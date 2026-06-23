<protect>
# Implementation Plan: Articulated Characters Migration (Trikey & Sera)

## Phase 1: Trikey Articulated Migration [checkpoint: 4d401d9]

- [x] Task: Read `spec.md` and `workflow.md` to align with requirements and TDD protocol
- [x] Task: Create Trikey per-part SVG assets
    - [x] Create `public/characters/trikey/tail.svg` (viewBox `0 0 120 120`, Triceratops tail)
    - [x] Create `public/characters/trikey/leg-back.svg` (back leg)
    - [x] Create `public/characters/trikey/arm-left.svg` (left forelimb)
    - [x] Create `public/characters/trikey/body.svg` (main torso)
    - [x] Create `public/characters/trikey/leg-front.svg` (front leg)
    - [x] Create `public/characters/trikey/arm-right.svg` (right forelimb)
    - [x] Create `public/characters/trikey/head.svg` (head with frill and horns)
    - [x] Create `public/characters/trikey/jaw.svg` (beak/jaw)
    - [x] Verify all 8 SVGs composite correctly at viewBox `0 0 120 120` in back-to-front draw order

- [x] Task: Write failing tests for TRIKEY_RIG definition and registration (TDD Red)
    - [x] Create test file `src/render/character-parts.test.ts` (extended existing test file)
    - [x] Test: `TRIKEY_RIG.character` equals `'Trikey'`
    - [x] Test: `TRIKEY_RIG.parts` has exactly 8 parts with correct names (`tail`, `leg-back`, `arm-left`, `body`, `leg-front`, `arm-right`, `head`, `jaw`)
    - [x] Test: Each `TRIKEY_RIG` part file path starts with `/characters/trikey/`
    - [x] Test: Each `TRIKEY_RIG` part has `pivotX`/`pivotY` within 0–120 range
    - [x] Test: `getCharacterRig('Trikey')` returns non-null rig after `preloadCharacterRigs()`
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement TRIKEY_RIG and register in characters.ts (TDD Green)
    - [x] Define `TRIKEY_RIG` constant in `src/render/character-parts.ts` with correct anatomical pivots
    - [x] Refactor `preloadCharacterRigs()` in `src/render/characters.ts` to iterate over a rig array (Rexy + Trikey)
    - [x] Add `TRIKEY_RIG` to `rigCache` in `preloadCharacterRigs()`
    - [x] Run tests and confirm they pass (Green phase)
    - [x] Verify `pnpm typecheck` passes
    - [x] Verify `pnpm lint` passes
    - _commit: f22594a_

- [x] Task: Conductor - User Manual Verification 'Trikey Articulated Migration' (Protocol in workflow.md)

## Phase 2: Sera Articulated Migration

- [x] Task: Read `spec.md` and `workflow.md` to align with requirements and TDD protocol
- [x] Task: Create Sera per-part SVG assets
    - [x] Create `public/characters/sera/tail.svg` (viewBox `0 0 120 120`, Pterodactyl tail)
    - [x] Create `public/characters/sera/leg-back.svg` (back leg)
    - [x] Create `public/characters/sera/arm-left.svg` (left wing)
    - [x] Create `public/characters/sera/body.svg` (main torso)
    - [x] Create `public/characters/sera/leg-front.svg` (front leg)
    - [x] Create `public/characters/sera/arm-right.svg` (right wing)
    - [x] Create `public/characters/sera/head.svg` (head)
    - [x] Create `public/characters/sera/jaw.svg` (snout)
    - [x] Verify all 8 SVGs composite correctly at viewBox `0 0 120 120` in back-to-front draw order

- [x] Task: Write failing tests for SERA_RIG definition and registration (TDD Red)
    - [x] Extend test file `src/render/character-parts.test.ts` with SERA_RIG tests
    - [x] Test: `SERA_RIG.character` equals `'Sera'`
    - [x] Test: `SERA_RIG.parts` has exactly 8 parts with correct names
    - [x] Test: Each `SERA_RIG` part file path starts with `/characters/sera/`
    - [x] Test: Each `SERA_RIG` part has `pivotX`/`pivotY` within 0–120 range
    - [x] Test: `getCharacterRig('Sera')` returns non-null rig after `preloadCharacterRigs()`
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement SERA_RIG and register in characters.ts (TDD Green) _commit: 3b69954_
    - [x] Define `SERA_RIG` constant in `src/render/character-parts.ts` with correct anatomical pivots
    - [x] Add `SERA_RIG` to the rig array in `preloadCharacterRigs()` (Rexy + Trikey + Sera)
    - [x] Add `SERA_RIG` to `rigCache` in `preloadCharacterRigs()`
    - [x] Run tests and confirm they pass (Green phase)
    - [x] Verify `pnpm typecheck` passes
    - [x] Verify `pnpm lint` passes

- [ ] Task: Conductor - User Manual Verification 'Sera Articulated Migration' (Protocol in workflow.md)
</protect>
