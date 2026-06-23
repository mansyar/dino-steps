<protect>
# Track: Articulated Characters Migration (Trikey & Sera)

## Overview

Migrate Trikey (Triceratops) and Sera (Pterodactyl) from the single-image fallback rendering path to the articulated per-part SVG compositing system established by Rexy. This gives both characters the same rich per-part animations (idle bob, walking leg swing, signature chomp, eating, dizzy droop, celebration backflip) that Rexy already has.

Both characters will use the identical 8-part decomposition as Rexy (tail, leg-front, leg-back, jaw, head, body, arm-left, arm-right) with shared animation logic. Only the SVG art differs per character, adapted to each dinosaur's visual identity. The migration is implemented one character at a time (Trikey first, then Sera) following the proven Rexy pattern.

## Background

Rexy was the pilot for the articulated per-part character system (track `articulated_characters_20260623`, now archived). The system splits each character into named body parts under `public/characters/<character>/`, one SVG per part at `viewBox="0 0 120 120"`. Parts are preloaded and composited on Canvas2D with independent transforms pivoted at each part's anatomical joint.

Trikey and Sera currently fall back to the `drawSingleImageDino()` path in `src/render/dino.ts`, which draws a single whole-character SVG with only a body-level bob/bounce — no per-part articulation.

## Functional Requirements

### FR-1: Per-Part SVG Assets
- Create 8 per-part SVG files for Trikey under `public/characters/trikey/`: `tail.svg`, `leg-front.svg`, `leg-back.svg`, `jaw.svg`, `head.svg`, `body.svg`, `arm-left.svg`, `arm-right.svg`.
- Create 8 per-part SVG files for Sera under `public/characters/sera/`: same 8 file names.
- All SVGs share `viewBox="0 0 120 120"` and composite correctly when drawn in back-to-front order.
- Art style matches Rexy's vector aesthetic but reflects each dinosaur's anatomy (e.g., Sera's "arm" parts depict wings, Trikey's "head" includes the frill/horns).

### FR-2: Character Rigs
- Define `TRIKEY_RIG` and `SERA_RIG` constants in `src/render/character-parts.ts`, following the `CharacterRig` interface, with correct `pivotX`/`pivotY` values per part (anchored at each part's anatomical joint).
- Both rigs use the same 8 part names as `REXY_RIG` so the existing `computePartTransform()` function applies unchanged.

### FR-3: Rig Registration & Preloading
- Register `TRIKEY_RIG` and `SERA_RIG` in `src/render/characters.ts`:
  - `preloadCharacterRigs()` loads and caches part images for all three rigs.
  - `rigCache` maps all three `DinoCharacter` values to their rigs.
  - `getCharacterRig()` returns the rig for Trikey and Sera (no longer null).

### FR-4: Rendering Path
- `drawDino()` in `src/render/dino.ts` uses `drawCompositeDino()` (the articulated path) for all three characters. The single-image fallback (`drawSingleImageDino`) remains as a graceful fallback if a rig is missing or images fail to load.
- All animation phases work identically for Trikey and Sera as they do for Rexy: idle, walking, turning, signature, eating, celebrating, dizzy.

## Non-Functional Requirements

### NFR-1: Performance
- No additional runtime dependencies.
- Part image preloading must not block the game's startup sequence (already async via `preloadCharacterRigs()`).
- Total new SVG payload remains consistent with the <500KB project budget.

### NFR-2: Accessibility
- All animations respect `prefers-reduced-motion` (already handled by the shared `amp()` helper in `computePartTransform()`).
- Animation frequency remains below the 3Hz cap.

### NFR-3: Backward Compatibility
- The existing single-image SVGs (`trikey.svg`, `sera.svg`) remain in place as fallback art (used by the character selection screen and `drawSingleImageDino` fallback path).
- No changes to game mechanics, level data, or audio systems.

## Acceptance Criteria

1. Selecting Trikey on the character select screen and playing any level shows full per-part articulation (idle bob, walking leg swing, signature chomp, eating, dizzy, celebration backflip) — visually equivalent in animation quality to Rexy.
2. Selecting Sera shows the same full per-part articulation.
3. All three characters render correctly in all animation phases.
4. `pnpm test` passes with >80% coverage on testable logic modules.
5. `pnpm typecheck` and `pnpm lint` pass with no errors.
6. The game runs at 60fps target on the device floor (iPad 5th gen / iPhone 8 / Galaxy Tab A).

## Out of Scope

- Character-specific animation curves or amplitudes (shared logic per decision).
- Anatomy-specific part names (wings, frill) — using same 8 part names as Rexy.
- Changes to signature *overlay effects* (drawRexyRings/drawTrikeyDip/drawSeraFeathers in juice.ts) — these already differ per character and remain unchanged.
- Changes to audio synthesis (playSignature already handles per-character sounds).
- Changes to game mechanics, level data, or the character selection UI logic.
- Removing the single-image fallback path (retained for graceful degradation).
</protect>
