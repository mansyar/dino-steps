<protect>
# Track: Articulated Characters (Pilot: Rexy)

## Overview

This track upgrades the game characters' **visual quality and animation richness** by replacing the current single-flat-SVG-per-character rendering with an **articulated multi-part SVG rig**: each character is split into named body parts (tail, legs, body, arms, head, jaw), each loaded as its own SVG file and composited on Canvas with an independent transform pivoted at the part's anatomical joint. This enables true per-part animation — stomping legs, a swishing tail, a bobbing head, and a jaw that opens for Rexy's roar — which is impossible with the current whole-body-image approach.

**Pilot scope:** Rexy only. The part-rig schema and renderer are designed so Trikey and Sera migrate via the same pattern in a later track. The old single-image render path is retained as a fallback for unmigrated characters.

**GDD amendment:** The locked GDD §11.1 mandates *procedural Canvas2D vector drawing* with *"no external asset files in the bundle."* The shipped code already deviates (loads external SVGs via `Image()`). This track formally blesses the external per-part SVG approach as the new locked decision and amends GDD §11.1, the §13 decision log, and `tech-stack.md` to match reality.

### Decisions (confirmed with stakeholder)

| Decision | Choice |
|-----------|--------|
| Scope | Both visuals + animation |
| GDD divergence | Keep SVG approach; amend GDD to match |
| Art source | Hand-authored SVG |
| Animation states | Prioritized subset: idle, walking(stomp), signature, eating, backflip, dizzy |
| Signature treatment | Articulated body (jaw opens) + retained FX overlay |
| Rollout | Pilot Rexy, then replicate Trikey & Sera in a later track |
| Articulation technique | Per-part SVG files (independent transforms per joint) |

## Functional Requirements

### FR1: Character Part Rig Schema

Define a typed rig describing how a character is split into independently-transformable parts. New module `src/render/character-parts.ts`.

```typescript
export interface CharacterPart {
  name: string;          // e.g. 'jaw', 'leg-front', 'tail'
  file: string;         // e.g. '/characters/rexy/tail.svg'
  pivotX: number;        // joint pivot, character-local coords (0–120 viewBox space)
  pivotY: number;
}

export interface CharacterRig {
  character: DinoCharacter;
  parts: CharacterPart[];  // ordered back-to-front (draw order)
}
```

- Each part SVG shares the same `viewBox="0 0 120 120"` so parts align when composited at the same rect with no transform; transparent padding surrounds each part.
- **Rexy rig (8 parts), draw order back→front:** `tail`, `leg-back`, `arm-left`, `body`, `leg-front`, `arm-right`, `head`, `jaw`.
- `REXY_RIG` is the first concrete rig. Trikey/Sera rigs are out of scope (later track).

### FR2: Articulation State

Extend the animation state carried into the renderer to drive per-part transforms.

```typescript
export type ArticulationPhase =
  | 'idle' | 'walking' | 'turning' | 'signature' | 'eating' | 'celebrating' | 'dizzy';

export interface ArticulationState {
  phase: ArticulationPhase;
  idleTime: number;        // seconds, accumulates while idle
  walkCycle: number;       // advances per forward step
  signatureProgress: number;  // 0–1, or -1 when inactive
  eatingProgress: number;     // 0–1, or -1 when inactive
  backflipProgress: number;   // 0–1, or -1 when inactive
  dizzyProgress: number;      // 0–1, or -1 when inactive
  reducedMotion: boolean;
}
```

This supersedes the current `DinoAnimState` (idleTime, walkCycle, turnProgress) and the loose `animType`/`backflipProgress` parameters passed ad-hoc to `drawDino`.

### FR3: Per-Part Transform Logic (testable core)

A **pure function** maps `(partName, ArticulationState) → PartTransform`:

```typescript
export interface PartTransform {
  rotate: number;   // radians, applied about the part's pivot
  tx: number;       // character-local translate offset (pre-scale), applied post-rotate
  ty: number;
  scaleY: number;   // 1 default; used for squash/stretch
}

export function computePartTransform(
  partName: string,
  state: ArticulationState,
): PartTransform
```

Per-state, per-part behavior (Rexy):

- **idle:** whole-body gentle bob (handled in renderer, not per-part); `tail` sways ±0.06 rad at 1.5× idle frequency; `head` bobs ±0.03 rad phase-offset from body; `jaw` static.
- **walking:** `leg-front` and `leg-back` alternate with 180° phase offset (±0.35 rad swing, driven by `walkCycle`); `tail` counter-sways ±0.12 rad; `head` slight forward nod ±0.04 rad on each step; `jaw` static.
- **turning:** `head` leads the turn (±0.15 rad toward turn direction); body follows via facing rotation (renderer).
- **signature (Rexy roar):** `jaw` opens to 0.5 rad peak at `signatureProgress≈0.4`, eases closed by 0.9; `head` tilts back ±0.12 rad; `body` subtle puff (scaleY 1.0→1.03→1.0). FX sound-rings remain in `juice.ts` `drawSignature`.
- **eating:** `jaw` chomps — opens to 0.4 rad then snaps closed, one cycle over `eatingProgress` 0→1; `head` dips forward ±0.08 rad.
- **celebrating (backflip):** whole-body 360° rotation + jump arc (existing logic, renderer-level); parts keep neutral transforms (the body rotates as a unit).
- **dizzy:** `head` wobbles ±0.1 rad at dizzy frequency; `tail` droops +0.15 rad; dizzy-star overlay remains in `drawDizzyRings`.
- **reducedMotion:** all amplitudes halved; frequencies unchanged (keeps <3Hz cap, §11.2).

### FR4: Articulated Composite Renderer

Rewrite `drawDino` (`src/render/dino.ts`) to composite parts instead of drawing one image:

1. Resolve the rig via `getCharacterRig(character)`.
2. **Fallback:** if no rig exists (Trikey/Sera during pilot), render the current single-image path unchanged — preserving existing behavior for unmigrated characters.
3. If a rig exists: apply whole-body transforms first (translate to tile center, facing rotation via `angleFromFacing`, idle bob, backflip rotation/jump). Then for each part in draw order: `ctx.save()` → translate to pivot → apply `computePartTransform` → translate back from pivot → `ctx.drawImage(partImg, ...)` at the shared 120×120 rect → `ctx.restore()`.
4. `drawDino` accepts an `ArticulationState` (replacing the ad-hoc `anim`/`animType`/`backflipProgress` args). `main.ts` builds this each frame.

### FR5: Per-Part SVG Loader

Rewrite `src/render/characters.ts` to preload per-part SVGs:

- `preloadCharacters()` loads all part images for every rig defined (Rexy during pilot), plus retains the single-image load for unmigrated characters (Trikey/Sera) as the fallback path.
- `getCharacterRig(char): CharacterRig | null` returns the rig (or null → fallback).
- `getPartImage(file): HTMLImageElement | null` returns a preloaded part image.
- Existing `getCharacterImage(char)` retained for the fallback path.

### FR6: Eating State Wiring

The `eating` phase is new. On `🦕` on the food tile (win condition), play the eating animation (jaw chomp, ~0.4s) **before** transitioning to the celebrating backflip. `main.ts` drives `eatingProgress` 0→1, then sets the win/celebration flow. If the existing win flow already plays `playSuccess()` + backflip immediately, insert the eating phase first.

### FR7: Signature Body Articulation Wiring

`drawDino` currently receives no signature state (signature FX are drawn separately *after* the dino via `drawSignature`). Pass `signatureProgress` into the `ArticulationState` so the jaw opens during Rexy's roar. The FX overlay (`drawRexyRings` in `juice.ts`) is called after `drawDino` unchanged.

### FR8: GDD & Tech-Stack Amendment

- **GDD §11.1:** Replace the "Characters + dynamic animations → Procedural Canvas2D vector drawing" row and the "No external asset files in the bundle" line with the per-part external SVG approach. Keep the "no raster spritesheets / no Spine / no Lottie" constraint (per-part SVGs are still vector, not spritesheets).
- **GDD §13 (decision log):** Add a dated Tier-4 entry recording the amendment and rationale (code had already deviated; per-part SVG enables articulation while keeping designer-editable vector art).
- **`tech-stack.md` Assets:** Update the character-asset description to reflect per-part SVG files in `public/characters/<character>/`.

## Non-Functional Requirements

### NFR1: Performance
- Compositing ~8 small `drawImage` calls per frame is trivially within the 60fps budget (current single-image path draws 1). No measurable FPS impact expected on the device floor (iPad 5th gen / iPhone 8 / Galaxy Tab A).
- Total payload remains <500KB. Each part SVG is <1KB; 8 parts ≈ <8KB per character (current 3 single SVGs ≈ 8KB total). Well within budget.
- No new runtime dependencies. Zero-dep stays zero-dep.

### NFR2: Testing (per workflow.md scope)
- **Testable logic (TDD):** `computePartTransform` and rig-data integrity (all parts have valid pivots within 0–120, draw order is complete, no duplicate names) are pure logic → unit-tested in `test/character-parts.test.ts`.
- **NOT unit-tested (per workflow.md "NOT rendering"):** the Canvas composite draw in `dino.ts`, the SVG loader in `characters.ts`, and `main.ts` wiring.
- Overall coverage remains >80%.

### NFR3: Accessibility (GDD §11.2)
- All articulation stays under the **3Hz** cap. Walk cycle and jaw chomp frequencies verified <3Hz.
- `prefers-reduced-motion` halves all per-part amplitudes (frequencies unchanged) — extends the existing reduced-motion pattern already in `juice.ts`.
- Articulation is supplementary motion, never the sole state cue (existing multi-cue states preserved).

### NFR4: Backward Compatibility
- Trikey and Sera render identically to today via the fallback path. No visual regressions for unmigrated characters.
- Home screen / level-select idle dino (`main.ts` ~line 854) continues to work (Rexy articulated idle).

## Acceptance Criteria

1. Rexy is split into ≥8 named part SVGs under `public/characters/rexy/`, each `viewBox="0 0 120 120"`, compositing to a cohesive, higher-quality Rexy than the current single SVG.
2. Rexy's **legs alternate** during walking (visible stomp), distinct from the current whole-body bounce.
3. Rexy's **tail sways** during idle and counter-sways during walking.
4. Rexy's **jaw opens** during the signature roar (articulated body) **and** the sound-ring FX overlay still plays.
5. Rexy performs a **jaw chomp** (eating) on `🦕`-on-food before the backflip celebration.
6. Rexy **backflips** on win (unchanged behavior, now via composite path).
7. Rexy **wobbles** during dizzy (head) with the dizzy-star overlay still playing.
8. Trikey and Sera render **unchanged** (fallback single-image path).
9. `prefers-reduced-motion` halves articulation amplitudes; <3Hz cap holds.
10. GDD §11.1, §13 decision log, and `tech-stack.md` amended to bless the per-part SVG approach.
11. `computePartTransform` unit tests pass; rig-data integrity tests pass; overall coverage >80%.
12. `pnpm typecheck`, `pnpm lint`, `pnpm format` pass with 0 errors; `pnpm build` <500KB.

## Out of Scope

- Trikey and Sera part rigs / redraws (later track — same pattern).
- Deferred animation states: resisting, food-wiggle-glance, cleared-tile (later track).
- Changes to signature SFX (already complete in `signature_sfx_20260622`).
- Changes to the audio synthesis infrastructure.
- New characters beyond Rexy/Trikey/Sera.
- Raster spritesheets, Spine, or Lottie (forbidden by GDD §11.1, retained).
</protect>
