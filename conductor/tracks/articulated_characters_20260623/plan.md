<protect>
# Implementation Plan: Articulated Characters (Pilot: Rexy)

## Phase 1: GDD & Tech-Stack Amendment (Docs — no code)

- [x] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 1
- [x] Task: Amend GDD §11.1 (`docs/GDD.md`) to bless per-part external SVG approach [9e145f4]
    - [x] Replace the "Characters + dynamic animations → Procedural Canvas2D vector drawing" row with "Articulated per-part SVG files, composited on Canvas2D with per-part transforms"
    - [x] Replace "No external asset files in the bundle (SVG strings are inlined)" with a note that character art is external per-part SVG vector files (still no raster spritesheets / Spine / Lottie)
    - [x] Verify: diff the GDD change reads cleanly; no other §11.1 constraints altered
- [x] Task: Add a dated Tier-4 entry to the GDD §13 decision log recording the amendment + rationale [9e145f4]
- [x] Task: Update `conductor/tech-stack.md` Assets section to describe per-part SVG files in `public/characters/<character>/` [9e145f4]
    - [x] Verify: `pnpm typecheck` — 0 errors (docs only, but confirm no breakage)

[checkpoint: 5fb6e49]

## Phase 2: Part Rig Schema & Transform Logic (TDD — testable core)

- [x] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 2
- [x] Task: Define rig + articulation types and `computePartTransform` in `src/render/character-parts.ts` [94cb84a]
    - [x] **Red:** Write failing tests in `test/character-parts.test.ts`:
        - [x] `computePartTransform('leg-front', walkingState)` returns a swing that is the negative of `('leg-back', walkingState)` (180° phase offset)
        - [x] `computePartTransform('jaw', signatureState@0.4)` returns `rotate` ≈ 0.5 rad (peak open); at 0.9 returns ≈ 0 (closed)
        - [x] `computePartTransform('jaw', eatingState)` chomps: opens then closes across progress
        - [x] `computePartTransform('tail', idleState)` sways ±0.06 rad; `reducedMotion` halves amplitude
        - [x] Rig-data integrity: `REXY_RIG.parts` has 8 entries, unique names, pivots within 0–120, draw order includes all expected parts
    - [x] **Green:** Implement `CharacterPart`, `CharacterRig`, `ArticulationPhase`, `ArticulationState`, `PartTransform`, `computePartTransform`, and `REXY_RIG` (with placeholder pivot coords to be finalized in Phase 3 against the real art)
    - [x] **Refactor:** Extracted per-phase helper functions (`idleTransform`, `walkingTransform`, `signatureTransform`, `eatingTransform`, `celebrateTransform`, `dizzyTransform`) for clarity per the switch dispatch
    - [x] **Verify:** Run `CI=true pnpm test` — 219 tests pass; run `CI=true pnpm coverage` — line coverage 100% / statements 94.2% / branches 90.6% for `src/render/character-parts.ts` (well above 80% threshold)

[checkpoint: f63a4b1]

## Phase 3: Rexy Part Art (SVG authoring — not TDD)

- [x] Task: Read `spec.md` to refresh the visual + part requirements before authoring
- [x] Task: Hand-author Rexy part SVGs under `public/characters/rexy/` [bd70401]
    - [x] Create `tail.svg`, `leg-back.svg`, `leg-front.svg`, `arm-left.svg`, `body.svg`, `arm-right.svg`, `head.svg`, `jaw.svg`
    - [x] Each `viewBox="0 0 120 120"`; part drawn at its correct position with transparent padding so parts align when composited
    - [x] Visual upgrade: cheek blush on head for cuter face, gradient palette preserved, cleaner silhouette via head/jaw split
    - [x] Verify: 8 SVGs all validated as well-formed XML with correct viewBox
- [x] Task: Finalize `REXY_RIG` pivot coordinates in `src/render/character-parts.ts` against the real art (hip for legs, neck for head, jaw hinge for jaw, tail base, shoulders for arms) [bd70401]
    - [x] Verify: `CI=true pnpm test` — rig-data integrity tests still pass with finalized pivots (219 tests)

## Phase 4: Articulated Composite Renderer (Rendering — not TDD)

- [ ] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 4
- [ ] Task: Rewrite `src/render/characters.ts` loader for per-part SVGs
    - [ ] Add `preloadCharacterRigs()` loading all part images for defined rigs (Rexy); retain `preloadCharacters()` single-image load for fallback (Trikey/Sera)
    - [ ] Add `getCharacterRig(char): CharacterRig | null` and `getPartImage(file): HTMLImageElement | null`; retain `getCharacterImage(char)` for fallback
    - [ ] Verify: `CI=true pnpm typecheck` — 0 errors
- [ ] Task: Rewrite `drawDino` in `src/render/dino.ts` to composite parts
    - [ ] Accept an `ArticulationState` (replace ad-hoc `anim`/`animType`/`backflipProgress` params)
    - [ ] If `getCharacterRig(char)` returns null → render current single-image fallback path (unchanged) for unmigrated characters
    - [ ] If rig exists → apply whole-body transforms (translate to center, `angleFromFacing`, idle bob, backflip), then iterate parts in draw order applying `computePartTransform` per part pivoted at its joint
    - [ ] Verify: `CI=true pnpm typecheck` — 0 errors; `CI=true pnpm lint` — 0 errors
- [ ] Task: Conductor — User Manual Verification 'Phase 4: Articulated Composite Renderer' (Protocol in workflow.md)

## Phase 5: main.ts Wiring & Eating State (Rendering — not TDD)

- [ ] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 5
- [ ] Task: Build `ArticulationState` each frame in `src/main.ts` render callback (~lines 804–816)
    - [ ] Replace the `animType` + `dinoAnim` + `backflipProgress` ad-hoc args to `drawDino` with a single `ArticulationState` built from `movement`, `showWin`, `signatureState`, `failDizzyProgress`, `prefersReducedMotion`
    - [ ] Pass `signatureState.progress` into `ArticulationState.signatureProgress` so the jaw articulates during roar (FX overlay `drawSignature` called after, unchanged)
    - [ ] Update the home-screen / level-select idle `drawDino` call (~line 854) to use the new signature
    - [ ] Verify: `CI=true pnpm typecheck` — 0 errors
- [ ] Task: Wire the `eating` phase on `🦕`-on-food (win)
    - [ ] On win, drive `eatingProgress` 0→1 (~0.4s jaw chomp) before entering the celebrating backflip
    - [ ] Ensure `playSuccess()` still plays (unchanged); sequence: eat chomp → success chime → backflip
    - [ ] Verify: `CI=true pnpm typecheck` — 0 errors; `CI=true pnpm lint` — 0 errors
- [ ] Task: Conductor — User Manual Verification 'Phase 5: main.ts Wiring & Eating State' (Protocol in workflow.md)

## Phase 6: Final Verification

- [ ] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 6
- [ ] Task: Run full quality gate
    - [ ] Run `CI=true pnpm test` — all tests pass (existing + new character-parts tests)
    - [ ] Run `CI=true pnpm coverage` — coverage >80%
    - [ ] Run `pnpm typecheck` — 0 errors
    - [ ] Run `pnpm lint` — 0 errors / 0 warnings
    - [ ] Run `pnpm format` — clean
    - [ ] Run `pnpm build` and check build size <500KB
- [ ] Task: Conductor — User Manual Verification 'Phase 6: Final Verification' (Protocol in workflow.md)
</protect>
