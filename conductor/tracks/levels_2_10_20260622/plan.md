<protect>
# Track: Levels 2-10 — Implementation Plan

## Phase 1 — Data Model Refactor: TileType Expansion

Goal: Expand `TileType` to include sub-types, update all classification helpers, parser, executor, validator, and renderer to work with the new types. Update Level 1 to use the new tile sub-types.

- [ ] Task: Read spec.md and workflow.md for this phase.
    - [ ] Review acceptance criteria and references in `spec.md`.
    - [ ] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [ ] Task: Expand `TileType` in `src/engine/types.ts`.
    - [ ] Change `TileType` from `'empty' | 'obstacle' | 'food' | 'interactable'` to `'empty' | 'rock' | 'mud' | 'berry' | 'leaf' | 'cookie' | 'turtle' | 'grass'`.
- [ ] Task: Add classification helpers.
    - [ ] Add `isObstacle(tile: TileType): boolean` → returns `true` for `'rock'` | `'mud'`.
    - [ ] Add `isFood(tile: TileType): boolean` → returns `true` for `'berry'` | `'leaf'` | `'cookie'`.
    - [ ] Add `isInteractable(tile: TileType): boolean` → returns `true` for `'turtle'` | `'grass'`.
    - [ ] Place these in `src/engine/types.ts` or a new `src/engine/tileUtils.ts` (follow existing pattern).
- [ ] Task: Write failing tests for classification helpers.
    - [ ] Test each helper with all 8 tile types (true/false for each).
    - [ ] Run tests and confirm they fail (Red phase).
- [ ] Task: Implement classification helpers to pass tests (Green phase).
- [ ] Task: Update `src/engine/levelData.ts` parser.
    - [ ] Update `VALID_TILE_TYPES` array to include all 8 sub-types.
    - [ ] Verify `parseLevel` validation still works with expanded types.
- [ ] Task: Update `src/engine/executor.ts` helper functions.
    - [ ] Update `isObstacle()` to check `tile === 'rock' || tile === 'mud'` (or use the new helper).
    - [ ] Update `isFood()` to check `tile === 'berry' || tile === 'leaf' || tile === 'cookie'`.
    - [ ] Update `isInteractable()` to check `tile === 'turtle' || tile === 'grass'`.
    - [ ] Verify all executor tests still pass (update test data if needed).
- [ ] Task: Update `src/engine/bfsValidator.ts` helper functions.
    - [ ] Update `isObstacle()` to use sub-type checks.
    - [ ] Update `isFood()` to use sub-type checks.
    - [ ] Add `isInteractable()` function (currently absent in validator).
    - [ ] Do NOT add interactable handling logic yet (that's Phase 3) — just fix the classification functions.
    - [ ] Verify all validator tests still pass (update test data if needed).
- [ ] Task: Update `src/render/grid.ts` renderer.
    - [ ] Expand `COLORS` map with distinct background colors for all 8 tile types.
    - [ ] Add emoji rendering for each sub-type: rock 🪨, mud 🟤, berry 🫐, leaf 🍃, cookie 🍪, turtle 🐢, grass 🌿.
    - [ ] Update `drawFoodWiggle` to read the food tile type from the grid instead of hardcoding 🍎.
    - [ ] Use `isFood()` helper to detect food tiles (instead of `=== 'food'`).
- [ ] Task: Update Level 1 data in `data/levels.json` and `main.ts`.
    - [ ] Change the food tile from `'food'` to `'berry'` in the grid.
    - [ ] Verify Level 1 still renders and plays correctly.
- [ ] Task: Update existing tests to use new tile sub-types.
    - [ ] Replace `'obstacle'` with `'rock'` in test fixtures.
    - [ ] Replace `'food'` with `'berry'` (or appropriate sub-type) in test fixtures.
    - [ ] Replace `'interactable'` with `'turtle'` or `'grass'` in test fixtures.
    - [ ] Run `pnpm test` and confirm all pass.
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [ ] All tests pass.
    - [ ] 0 lint errors, 0 warnings.
    - [ ] Format clean.
    - [ ] Typecheck passes.
- [ ] Task: Conductor - User Manual Verification 'Data Model Refactor' (Protocol in workflow.md)

## Phase 2 — Levels 2-6 (No Interactables)

Goal: Author levels 2-6 (which contain only obstacles, no interactables) and add BFS validation tests.

- [ ] Task: Read spec.md and workflow.md for this phase.
- [ ] Task: Author levels 2-6 in `data/levels.json`.
    - [ ] L2: Double Hop — start (0,2)E, food (4,2) berry, budget 6, solution `F F F F A`.
    - [ ] L3: The Great Rock — start (0,0)E, food (1,1) berry, rock (1,0), budget 6, solution `R F L F A`.
    - [ ] L4: Tiny Corner — start (0,2)E, food (1,0) leaf, budget 6, solution `F L F F A`.
    - [ ] L5: S-Curve Path — start (0,2)E, food (1,0) leaf, rock (0,0), rock (1,2), budget 8, solution `L F R F L F A`.
    - [ ] L6: Around the Swamp — start (1,2)N, food (3,2) leaf, mud (2,2), budget 8, solution `F R F F R F F A`.
    - [ ] Verify each grid is 5×3 with correct tile placements.
- [ ] Task: Write failing tests for level data parsing (levels 2-6).
    - [ ] Test `parseLevels` with all 6 levels (L1-L6) parses without error.
    - [ ] Test each level's grid dimensions, start position, food position, track budget, verified solution.
- [ ] Task: Write failing tests for BFS validation (levels 2-6).
    - [ ] Test `replaySolution` returns `'win'` for each level's verified solution.
    - [ ] Test `computeMinimum` returns the expected minimum for each level.
    - [ ] Run tests and confirm they fail (Red phase — levels not yet in data file or main.ts).
- [ ] Task: Sync `main.ts` hardcoded levels with `data/levels.json` (add levels 2-6).
- [ ] Task: Run `pnpm test` and confirm all new tests pass (Green phase).
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [ ] All tests pass.
    - [ ] 0 lint errors, 0 warnings.
    - [ ] Format clean.
    - [ ] Typecheck passes.
- [ ] Task: Conductor - User Manual Verification 'Levels 2-6' (Protocol in workflow.md)

## Phase 3 — BFS Validator Interactable Handling

Goal: Fix the BFS validator to handle interactable tiles — track cleared state, try `A` as a clearing action, enforce soft-resist on exit from uncleared interactables.

- [ ] Task: Read spec.md and workflow.md for this phase.
- [ ] Task: Write failing tests for BFS interactable handling.
    - [ ] Test `computeMinimum` on a simple level with one turtle interactable returns the correct minimum (including the `A` clear command).
    - [ ] Test `replaySolution` with a solution that clears an interactable returns `'win'`.
    - [ ] Test `replaySolution` with a solution that tries to `F` out of an uncleared interactable returns `'fail'` (soft-resist = invalid solution for replay).
    - [ ] Test `computeMinimum` on L7 (Sleepy Turtle), L8 (Tall Grass Chomp), L10 (Dino Master) returns the expected minimums (6, 9, 9).
    - [ ] Run tests and confirm they fail (Red phase — validator doesn't handle interactables yet).
- [ ] Task: Update `BFSState` in `src/engine/bfsValidator.ts`.
    - [ ] Add `cleared: string[]` (or `Set<string>`) to track cleared interactable coordinates.
    - [ ] Update the visited-set key to include cleared state (so BFS explores paths with different clearing states).
- [ ] Task: Update `computeMinimum` to handle interactables.
    - [ ] Add `A` as a fourth command option in the BFS loop.
    - [ ] On `A` at an interactable tile → add to cleared set, advance steps (no position change).
    - [ ] On `A` at a food tile → return `steps + 1` (win).
    - [ ] On `A` at empty/cleared tile → no-op, advance steps.
    - [ ] On `F` from an uncleared interactable tile → skip (soft-resist, can't exit).
    - [ ] Ensure the visited-set key includes cleared state to avoid infinite loops.
- [ ] Task: Update `replaySolution` to handle interactables.
    - [ ] Track `clearedInteractables` array during replay.
    - [ ] On `A` at an interactable → mark cleared, advance.
    - [ ] On `A` at food → return `'win'`.
    - [ ] On `A` at empty/cleared → no-op, advance.
    - [ ] On `F` from an uncleared interactable → return `'fail'` (solution is invalid if it tries to leave uncleared).
- [ ] Task: Run `pnpm test` and confirm all BFS tests pass (Green phase).
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [ ] All tests pass.
    - [ ] 0 lint errors, 0 warnings.
    - [ ] Format clean.
    - [ ] Typecheck passes.
- [ ] Task: Conductor - User Manual Verification 'BFS Validator Interactable Handling' (Protocol in workflow.md)

## Phase 4 — Levels 7-10 (With Interactables)

Goal: Author levels 7-10 (which contain interactables) and add BFS validation tests now that the validator supports them.

- [ ] Task: Read spec.md and workflow.md for this phase.
- [ ] Task: Author levels 7-10 in `data/levels.json`.
    - [ ] L7: Sleepy Turtle — start (0,1)E, food (4,1) leaf, turtle (2,1), budget 8, solution `F F A F F A`.
    - [ ] L8: Tall Grass Chomp — start (0,2)E, food (4,1) cookie, rock (1,2), grass (0,1), budget 10, solution `L F R A F F F F A`.
    - [ ] L9: Twin Paths — start (2,2)E, food (4,0) cookie, rock (3,0), rock (4,2), budget 10, solution `F L F R F L F A`.
    - [ ] L10: Dino Master — start (0,1)E, food (4,2) cookie, rock (0,2), rock (2,1), turtle (1,1), budget 10, solution `F R A F L F F F A`.
    - [ ] Verify each grid is 5×3 with correct tile placements.
- [ ] Task: Write failing tests for level data parsing (levels 7-10).
    - [ ] Test `parseLevels` with all 10 levels parses without error.
    - [ ] Test each level's grid dimensions, start position, food position, track budget, verified solution.
- [ ] Task: Write failing tests for BFS validation (levels 7-10).
    - [ ] Test `replaySolution` returns `'win'` for each level's verified solution.
    - [ ] Test `computeMinimum` returns the expected minimum for each level (L7: 6, L8: 9, L9: 8, L10: 9).
    - [ ] Run tests and confirm they fail (Red phase — levels not yet in data file or main.ts).
- [ ] Task: Sync `main.ts` hardcoded levels with `data/levels.json` (add levels 7-10).
- [ ] Task: Write integration tests for all 10 levels.
    - [ ] Test that replaying each level's verified solution through the executor produces a win state.
    - [ ] Test that the dino position, facing, and cleared interactables match expected end state.
- [ ] Task: Run `pnpm test` and confirm all new tests pass (Green phase).
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [ ] All tests pass.
    - [ ] 0 lint errors, 0 warnings.
    - [ ] Format clean.
    - [ ] Typecheck passes.
- [ ] Task: Conductor - User Manual Verification 'Levels 7-10' (Protocol in workflow.md)

## Phase 5 — Integration & Quality Gates

Goal: Verify the whole track meets acceptance criteria and project quality gates.

- [ ] Task: Read spec.md and workflow.md for this phase.
- [ ] Task: Manual verification of all 10 levels.
    - [ ] Run `pnpm dev` and play through each level (L1-L10) in the browser.
    - [ ] Verify correct tile rendering (rock 🪨, mud 🟤, berry 🫐, leaf 🍃, cookie 🍪, turtle 🐢, grass 🌿).
    - [ ] Verify each level's verified solution works end-to-end.
    - [ ] Verify interactable clearing works (turtle wakes, grass chomped).
    - [ ] Verify soft-resist when trying to leave an uncleared interactable.
    - [ ] Verify food wiggle hint uses correct food emoji.
    - [ ] Verify track budget grows correctly (6 → 8 → 10).
- [ ] Task: Run full test suite and coverage.
    - [ ] `pnpm coverage` must pass the 80% threshold.
- [ ] Task: Run full quality check.
    - [ ] `pnpm lint` — 0 warnings, 0 errors.
    - [ ] `pnpm format` — all files formatted.
    - [ ] `pnpm typecheck` — no errors.
    - [ ] `pnpm test` — all tests pass.
- [ ] Task: Verify production bundle size stays under 500 KB.
- [ ] Task: Update `docs/GDD.md` §14 Implementation Status with this track's results.
- [ ] Task: Update `conductor/tracks.md` to mark this track complete.
- [ ] Task: Conductor - User Manual Verification 'Integration & Quality Gates' (Protocol in workflow.md)
</protect>
