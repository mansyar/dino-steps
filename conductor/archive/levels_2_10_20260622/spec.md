<protect>
# Track: Levels 2-10 — Full Game Content

## Overview

DinoSteps currently ships with only Level 1 ("Hungry Steps"). The remaining 9 BFS-verified levels from GDD §5.1 are the core game content — without them, the game is a single-level demo. This track delivers all 9 levels, the tile sub-type system needed for visual variety, and the BFS validator fix required to validate levels containing interactables.

The track expands `TileType` from generic categories (`'obstacle'`, `'food'`, `'interactable'`) to specific sub-types (`'rock'`, `'mud'`, `'berry'`, `'leaf'`, `'cookie'`, `'turtle'`, `'grass'`), adds all 9 levels to `data/levels.json`, fixes the BFS validator to handle interactable clearing and soft-resist, and updates the renderer with distinct emoji per sub-type.

## Type

Feature

## Motivation

- **Levels 2-10 are the High-priority deferred item** (GDD §14.3). The game cannot ship with a single level.
- **The current `TileType` union is too coarse** — all obstacles render as 🪨, all food as 🍎, and interactables have no visual at all (just a teal background). For a preschool audience, visual variety across 10 levels is essential for engagement.
- **The BFS validator cannot handle interactables** — it only tracks obstacles and food, not cleared interactable state. Levels 7, 8, and 10 (which contain turtle/grass tiles) cannot be validated until this is fixed.
- **The executor already handles interactables** (soft-resist on exit, clearing on 🦕) — no executor changes needed, only validator parity.

## Goals

1. Expand `TileType` to include specific sub-types for obstacles, food, and interactables.
2. Update classification helpers, parser, executor, validator, and renderer to work with the expanded types.
3. Author levels 2-10 as JSON data, matching the BFS-verified specs in GDD §5.1.
4. Fix the BFS validator to handle interactable tiles (track cleared state, try `A` as clearing action, enforce soft-resist on exit).
5. Add distinct emoji rendering for all tile sub-types (rock 🪨, mud 🟤, berry 🫐, leaf 🍃, cookie 🍪, turtle 🐢, grass 🌿).
6. Sync the hardcoded level data in `main.ts` with `data/levels.json`.
7. Maintain test coverage above 80% with comprehensive tests for new types, validator behavior, and level solutions.

## Functional Requirements

### FR1 — TileType Expansion

Expand the `TileType` union in `src/engine/types.ts` from:
```typescript
type TileType = 'empty' | 'obstacle' | 'food' | 'interactable';
```
to:
```typescript
type TileType = 'empty' | 'rock' | 'mud' | 'berry' | 'leaf' | 'cookie' | 'turtle' | 'grass';
```

- **Obstacle sub-types:** `'rock'` (impassable terrain), `'mud'` (impassable terrain, visual variant).
- **Food sub-types:** `'berry'`, `'leaf'`, `'cookie'` — all functionally identical (win condition is 🦕 on any food tile), purely cosmetic.
- **Interactable sub-types:** `'turtle'` (sleeping turtle), `'grass'` (dense grass) — both block exit until cleared by 🦕, identical mechanics.

### FR2 — Classification Helpers

Add or update classification functions that check whether a tile belongs to a category:

```typescript
function isObstacle(tile: TileType): boolean;     // 'rock' | 'mud'
function isFood(tile: TileType): boolean;        // 'berry' | 'leaf' | 'cookie'
function isInteractable(tile: TileType): boolean; // 'turtle' | 'grass'
```

- These replace the current pattern of `grid[y][x] === 'obstacle'` direct comparisons.
- The executor's existing `isObstacle()`, `isFood()`, `isInteractable()` functions must be updated to use the new sub-type checks.
- The BFS validator's `isObstacle()`, `isFood()` functions must be updated similarly.
- New `isInteractable()` must be added to the validator (currently absent).

### FR3 — Level Data Parser Updates

Update `src/engine/levelData.ts`:
- Update `VALID_TILE_TYPES` to include all 8 sub-types.
- The parser already validates grid dimensions and tile types — just expand the valid set.
- No structural changes to `LevelData` interface (the `food` field remains `{ x, y }` — food type is inferred from the grid).

### FR4 — Level Data Authoring (Levels 2-10)

Author levels 2-10 in `data/levels.json`, using the BFS-verified specs from GDD §5.1. Each level uses the expanded tile types in its grid:

| L | Title | Grid Tiles | Food Type | Budget | Verified Solution |
|---|-------|-----------|-----------|--------|-------------------|
| 1 | Hungry Steps | — | berry 🫐 | 6 | `F F F A` |
| 2 | Double Hop | — | berry 🫐 | 6 | `F F F F A` |
| 3 | The Great Rock | rock (1,0) | berry 🫐 | 6 | `R F L F A` |
| 4 | Tiny Corner | — | leaf 🍃 | 6 | `F L F F A` |
| 5 | S-Curve Path | rock (0,0), rock (1,2) | leaf 🍃 | 8 | `L F R F L F A` |
| 6 | Around the Swamp | mud (2,2) | leaf 🍃 | 8 | `F R F F R F F A` |
| 7 | Sleepy Turtle | turtle (2,1) | leaf 🍃 | 8 | `F F A F F A` |
| 8 | Tall Grass Chomp | rock (1,2), grass (0,1) | cookie 🍪 | 10 | `L F R A F F F F A` |
| 9 | Twin Paths | rock (3,0), rock (4,2) | cookie 🍪 | 10 | `F L F R F L F A` |
| 10 | Dino Master | rock (0,2), rock (2,1), turtle (1,1) | cookie 🍪 | 10 | `F R A F L F F F A` |

**Food type assignment by level band:**
- L1-L3: berry 🫐 (intro levels)
- L4-L7: leaf 🍃 (mid levels)
- L8-L10: cookie 🍪 (advanced levels)

**Level 1 update:** Change the existing `'food'` tile to `'berry'` to match the new type system.

### FR5 — BFS Validator Interactable Handling

Update `src/engine/bfsValidator.ts` to handle interactable tiles:

1. **Track cleared interactables in BFS state:** Add a `cleared: Set<string>` (or equivalent) to `BFSState` so the validator tracks which interactables have been cleared during the search.
2. **Try `A` command in BFS:** The `computeMinimum` function currently only tries `F`, `L`, `R`. Add `A` as a fourth option:
   - On an interactable tile → clear it (add to cleared set), advance step count.
   - On a food tile → win (return steps + 1).
   - On empty/cleared tile → no-op (advance step count, no state change).
3. **Enforce soft-resist on exit:** When trying `F` from an interactable tile that hasn't been cleared, skip the move (the dino can't leave). This matches the executor's soft-resist behavior.
4. **Update `replaySolution`:** Track cleared interactables during replay. When `A` is executed on an interactable, mark it cleared. When `F` is executed from an uncleared interactable, return `'fail'` (soft-resist in executor stays on tile and advances — but for replay validation, this means the solution is invalid if it tries to leave an uncleared interactable).

### FR6 — Renderer Updates

Update `src/render/grid.ts`:
- Expand the `COLORS` map to include all 8 tile types with distinct background colors.
- Add emoji rendering for each sub-type:
  - `rock` → 🪨 (already exists, keep)
  - `mud` → 🟤 (or a mud-specific emoji/shape)
  - `berry` → 🫐
  - `leaf` → 🍃
  - `cookie` → 🍪
  - `turtle` → 🐢
  - `grass` → 🌿
- Update `drawFoodWiggle` to use the food tile type from the grid (currently hardcodes 🍎).
- Update the tile-type lookup to use classification helpers where appropriate (e.g., check `isFood(tileType)` before drawing food emoji).

### FR7 — Sync `main.ts` Hardcoded Levels

The `main.ts` file (lines 62-77) contains a hardcoded copy of the level data. This must be synced with `data/levels.json` to include all 10 levels with the expanded tile types.

**Note:** The hardcoded data in `main.ts` should ideally be replaced with a `fetch('/data/levels.json')` call, but that's a refactor decision — if the current pattern works, matching it is simpler. The spec recommends keeping the hardcoded pattern for consistency with the existing architecture (Vite serves `data/` as a static asset, but the current code doesn't fetch it).

### FR8 — Testing

- **Unit tests for classification helpers:** `isObstacle`, `isFood`, `isInteractable` with all 8 tile types.
- **Level data parser tests:** Validate all 10 levels parse correctly with the new tile types.
- **BFS validator tests:** 
  - `computeMinimum` for levels with interactables (L7, L8, L10) returns the correct minimum.
  - `replaySolution` for interactable levels correctly tracks clearing.
  - Soft-resist: `F` from uncleared interactable is handled correctly.
- **Integration tests:** Replay the verified solution for all 10 levels and confirm `'win'` result.
- **Executor tests:** Update existing tests that use `'obstacle'`, `'food'`, `'interactable'` tile types to use the new sub-types.

## Non-Functional Requirements

### NFR1 — Performance
- No new runtime dependencies.
- The BFS validator's state space grows with interactable tracking, but the 5×3 grid with at most 1-2 interactables keeps it negligible.
- All rendering remains emoji-based (no asset files added).

### NFR2 — Payload
- New level data is JSON (already in the bundle). No external assets.
- Total bundle size must stay under 500 KB (currently ~38 KB).

### NFR3 — Backward Compatibility
- Level 1's data changes from `'food'` to `'berry'` — all code that checks for food must use the classification helper, not direct comparison.
- No changes to the `GameState`, `Command`, `Facing`, or `Direction` types.
- No changes to the executor's command processing logic (it already handles interactables correctly).

### NFR4 — Test Coverage
- Maintain >80% statement coverage.
- All new code paths (classification helpers, BFS interactable handling, renderer sub-types) must be tested.

## Acceptance Criteria

- [ ] `TileType` expanded to 8 sub-types in `src/engine/types.ts`.
- [ ] Classification helpers (`isObstacle`, `isFood`, `isInteractable`) updated and tested.
- [ ] `data/levels.json` contains all 10 levels with correct tile sub-types.
- [ ] `main.ts` hardcoded levels synced with `data/levels.json` (all 10 levels).
- [ ] BFS validator handles interactables: `computeMinimum` returns correct minimum for L7, L8, L10.
- [ ] BFS validator `replaySolution` tracks cleared interactables and returns `'win'` for all 10 verified solutions.
- [ ] Renderer draws distinct emoji for all 8 tile sub-types.
- [ ] `drawFoodWiggle` uses the correct food emoji based on grid tile type (not hardcoded 🍎).
- [ ] All existing tests updated to use new tile sub-types (no `'obstacle'`, `'food'`, `'interactable'` literals remain in tests).
- [ ] New tests cover classification helpers, BFS interactable handling, and all 10 level solutions.
- [ ] `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck` all pass.
- [ ] Coverage remains above 80%.

## Out of Scope

- Character signature SFX (`playSignature` — Medium deferred item, separate track).
- Playtesting with children (Low priority, post-content).
- Replacing hardcoded level data in `main.ts` with a fetch call (architectural refactor, not needed for this track).
- New game mechanics beyond what the GDD specifies for levels 2-10.
- Changes to the executor's command processing (it already handles interactables correctly).
- Procedural Canvas2D vector rendering for tiles (emoji rendering is sufficient and consistent with existing approach).

## References

- `docs/GDD.md` §5 (Level Matrix — BFS-verified specs for all 10 levels)
- `docs/GDD.md` §3.1 (Grid System — tile type descriptions)
- `docs/GDD.md` §3.4 (Special Action — interactable clearing behavior)
- `docs/GDD.md` §8 (Two-Tier Failure Model — soft-resist on interactables)
- `docs/GDD.md` §9.3 (Level Data Format — JSON schema)
- `docs/GDD.md` §14.3 (Deferred Items — Levels 2-10, BFS validator interactable handling)
- `conductor/archive/engine_l1_20260621/` — prior track that built the engine and Level 1
</protect>
