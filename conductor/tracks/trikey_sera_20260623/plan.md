<protect>
# Implementation Plan: Articulated Characters Migration (Trikey & Sera)

## Phase 1: Trikey Articulated Migration

- [ ] Task: Read `spec.md` and `workflow.md` to align with requirements and TDD protocol
- [ ] Task: Create Trikey per-part SVG assets
    - [ ] Create `public/characters/trikey/tail.svg` (viewBox `0 0 120 120`, Triceratops tail)
    - [ ] Create `public/characters/trikey/leg-back.svg` (back leg)
    - [ ] Create `public/characters/trikey/arm-left.svg` (left forelimb)
    - [ ] Create `public/characters/trikey/body.svg` (main torso)
    - [ ] Create `public/characters/trikey/leg-front.svg` (front leg)
    - [ ] Create `public/characters/trikey/arm-right.svg` (right forelimb)
    - [ ] Create `public/characters/trikey/head.svg` (head with frill and horns)
    - [ ] Create `public/characters/trikey/jaw.svg` (beak/jaw)
    - [ ] Verify all 8 SVGs composite correctly at viewBox `0 0 120 120` in back-to-front draw order

- [ ] Task: Write failing tests for TRIKEY_RIG definition and registration (TDD Red)
    - [ ] Create test file `src/render/character-parts.test.ts`
    - [ ] Test: `TRIKEY_RIG.character` equals `'Trikey'`
    - [ ] Test: `TRIKEY_RIG.parts` has exactly 8 parts with correct names (`tail`, `leg-back`, `arm-left`, `body`, `leg-front`, `arm-right`, `head`, `jaw`)
    - [ ] Test: Each `TRIKEY_RIG` part file path starts with `/characters/trikey/`
    - [ ] Test: Each `TRIKEY_RIG` part has `pivotX`/`pivotY` within 0–120 range
    - [ ] Test: `getCharacterRig('Trikey')` returns non-null rig after `preloadCharacterRigs()`
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement TRIKEY_RIG and register in characters.ts (TDD Green)
    - [ ] Define `TRIKEY_RIG` constant in `src/render/character-parts.ts` with correct anatomical pivots
    - [ ] Refactor `preloadCharacterRigs()` in `src/render/characters.ts` to iterate over a rig array (Rexy + Trikey)
    - [ ] Add `TRIKEY_RIG` to `rigCache` in `preloadCharacterRigs()`
    - [ ] Run tests and confirm they pass (Green phase)
    - [ ] Verify `pnpm typecheck` passes
    - [ ] Verify `pnpm lint` passes

- [ ] Task: Conductor - User Manual Verification 'Trikey Articulated Migration' (Protocol in workflow.md)

## Phase 2: Sera Articulated Migration

- [ ] Task: Read `spec.md` and `workflow.md` to align with requirements and TDD protocol
- [ ] Task: Create Sera per-part SVG assets
    - [ ] Create `public/characters/sera/tail.svg` (viewBox `0 0 120 120`, Pterodactyl tail)
    - [ ] Create `public/characters/sera/leg-back.svg` (back leg)
    - [ ] Create `public/characters/sera/arm-left.svg` (left wing)
    - [ ] Create `public/characters/sera/body.svg` (main torso)
    - [ ] Create `public/characters/sera/leg-front.svg` (front leg)
    - [ ] Create `public/characters/sera/arm-right.svg` (right wing)
    - [ ] Create `public/characters/sera/head.svg` (head with crest)
    - [ ] Create `public/characters/sera/jaw.svg` (beak/jaw)
    - [ ] Verify all 8 SVGs composite correctly at viewBox `0 0 120 120` in back-to-front draw order

- [ ] Task: Write failing tests for SERA_RIG definition and registration (TDD Red)
    - [ ] Extend test file `src/render/character-parts.test.ts` with SERA_RIG tests
    - [ ] Test: `SERA_RIG.character` equals `'Sera'`
    - [ ] Test: `SERA_RIG.parts` has exactly 8 parts with correct names
    - [ ] Test: Each `SERA_RIG` part file path starts with `/characters/sera/`
    - [ ] Test: Each `SERA_RIG` part has `pivotX`/`pivotY` within 0–120 range
    - [ ] Test: `getCharacterRig('Sera')` returns non-null rig after `preloadCharacterRigs()`
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement SERA_RIG and register in characters.ts (TDD Green)
    - [ ] Define `SERA_RIG` constant in `src/render/character-parts.ts` with correct anatomical pivots
    - [ ] Add `SERA_RIG` to the rig array in `preloadCharacterRigs()` (Rexy + Trikey + Sera)
    - [ ] Add `SERA_RIG` to `rigCache` in `preloadCharacterRigs()`
    - [ ] Run tests and confirm they pass (Green phase)
    - [ ] Verify `pnpm typecheck` passes
    - [ ] Verify `pnpm lint` passes

- [ ] Task: Conductor - User Manual Verification 'Sera Articulated Migration' (Protocol in workflow.md)
</protect>
