<protect>

# Track: Build Core Game Engine and Level 1 Vertical Slice

**Track ID:** `engine_l1_20260621`
**Type:** Feature
**Status:** New
**Created:** 2026-06-21

---

## 1. Objective

Establish the full technical foundation of DinoSteps and deliver a playable Level 1 vertical slice end-to-end. This track scaffolds the project, implements the core architecture, rendering, input, audio, and game loop — culminating in a complete Level 1 playthrough (character selection → grid view → tap-to-code → GO → execute → win/fail → advance).

## 2. Scope

### In Scope

**Project Scaffolding:**
- Vite + TypeScript project initialized with pnpm
- Toolchain configured: oxlint, oxfmt, vitest, lefthook, tsc (strict, noEmit, incremental)
- lefthook.yml: pre-commit (oxlint + oxfmt on staged), pre-push (vitest coverage 80% + tsc --noEmit)
- Project directory structure (`src/`, `data/`, `test/`)
- `index.html` shell with Canvas element

**Core Architecture & Data Layer:**
- TypeScript types: `Command` (`'F'|'L'|'R'|'A'`), `Direction` vector, `LevelData`, `GameState`, `PersistedState`, `TileType`
- Direction vector module: `E=(1,0)`, `S=(0,1)`, `W=(-1,0)`, `N=(0,-1)`, forward, turn-left (CCW), turn-right (CW)
- Level data schema and loader (`/data/levels.json`)
- BFS level validator (replay solutions, compute minimums, verify obstacles gate)
- State tree: runtime `game` (per-level) + `persisted` (cross-session)
- localStorage persistence: 3 keys (`unlockedLevel`, `chosenCharacter`, `muted`)

**Command Execution Engine:**
- Command queue processor (triggered by GO)
- Forward: boundary/obstacle check → hard failure; uncleared interactable exit → soft resist; valid move → advance
- Left/Right: 90° rotation in place, advance index
- Action (🦕): contextual — on food → win; on uncleared interactable → clear; on empty/cleared → no-op signature move
- Win condition: 🦕-on-food required (no auto-win on step)
- Two-tier failure model: hard (teleport + reset queue) / soft (stay + advance)
- Execution loop state machine (GDD §9.5)

**Canvas2D Rendering:**
- `requestAnimationFrame` render loop
- 5×3 grid rendering with tile types (empty, obstacle, interactable, food)
- Dino vector rendering (basic procedural drawing)
- Smoothstep tweening utility (`3t² - 2t³`)
- Movement interpolation (grid logic stays integer; rendering floats)
- Basic animations: idle, walking (stomp), turning

**Input System & UI:**
- Tap-to-append: action menu buttons → track slots
- Tap-to-delete: placed track blocks
- GO button: triggers execution
- Track UI: variable slots (6 for L1), budget display
- Action menu: 4 command buttons (🐾 ↩️ ↪️ 🦕), 64px tap targets
- Character swap: edit-time only, disabled during execution
- Home screen: character selection carousel
- Level-select screen (gated by `unlockedLevel`)

**Audio System:**
- Web Audio API context initialization
- Stomp sound (sine sweep 120→20Hz)
- Dizzy/bonk sound (triangle 400→800Hz vibrato)
- Success chime (square wave C5→E5→G5→C6 arpeggio)
- Signature SFX per character (Rexy roar, Trikey snort, Sera chirp)
- Mute toggle (persisted)

**Level 1 Integration:**
- Level 1 data: "Hungry Steps" — start (0,1)E, food (3,1), no obstacles, budget 6, solution `🐾🐾🐾🦕`
- Success animation: confetti burst + backflip + nom-nom + chime
- Failure animation: bump + dizzy ring + squeaky bonk + teleport to start
- Food-wiggle hint (sequence ends on food without 🦕)
- Level advancement on win
- Accessibility: 64px targets, `prefers-reduced-motion` support, <3Hz cap

### Out of Scope (Deferred to Future Tracks)

- Levels 2–10 (this track delivers Level 1 only)
- Obstacle types beyond what Level 1 needs (Level 1 has none, but the engine must support them)
- Interactable tiles (turtle, grass) — engine supports the type, but no Level 1 usage; full clear-animation polish deferred
- Full character animation state inventory (10 states) — basic states only (idle, walk, turn); advanced states (backflip, dizzy, eating, resisting) implemented at minimum viable quality
- Particle system polish (confetti is basic; smoke/sound-ring particles deferred)
- Color-blind palette audit (flagged for final implementation)
- Playtesting with children (separate track)

## 3. Technical Requirements

### Architecture Constraints (from GDD)
- **Grid:** 5×3, y-down screen-space, `(0,0)` = top-left
- **Movement:** Integer direction vectors `(dx, dy)`, no trigonometry
- **Rendering:** Smoothstep interpolation for pixels only; game state stays integer
- **Commands:** Single-letter keys (`F`/`L`/`R`/`A`) in data; emoji at render only
- **State:** Runtime `game` (ephemeral, resets per level) + `persisted` (mirrors localStorage)
- **Persistence:** 3 localStorage keys, no backend, no accounts
- **Assets:** Zero external files — procedural Canvas2D + inline SVG + Web Audio synthesis

### Performance Targets (from GDD §11.3)
- 60fps target, graceful degradation to 30fps
- Total payload < 500KB
- Touch latency < 100ms
- Load time < 2s on 4G
- Device floor: iPad 5th gen / iPhone 8 / Galaxy Tab A

### Testing Scope
- **Testable logic only** (vitest): grid logic, direction vectors, command execution, contextual 🦕 resolution, failure model, level data/validator, state management, persistence hydration, track budget, win detection
- **Not tested (visual/audio):** Canvas2D rendering, Web Audio synthesis, animation tweens
- **Coverage:** >80% on testable logic modules

## 4. Acceptance Criteria

1. `pnpm dev` starts the Vite dev server and loads the game in a browser
2. Home screen shows 3 selectable characters (Rexy, Trikey, Sera)
3. Selecting a character enters Level 1 ("Hungry Steps")
4. The 5×3 grid renders with the dino at (0,1) facing East and food at (3,1)
5. Tapping action menu buttons appends commands to the track (budget: 6)
6. Tapping a placed track block removes it
7. Pressing GO executes the command queue with visible movement animation
8. `🐾🐾🐾🦕` wins Level 1 (dino walks to food, eats, confetti, chime, advances)
9. Walking into the boundary triggers hard failure (bonk, dizzy, teleport to start, queue reset)
10. Sequence ending on food without 🦕 triggers food-wiggle hint (no failure)
11. Character swap works during editing, disabled during execution
12. Mute toggle persists across reloads
13. `unlockedLevel` persists across reloads
14. `pnpm test` passes with >80% coverage on testable logic
15. `pnpm lint` and `pnpm typecheck` pass with zero errors
16. Game runs at 60fps on a modern browser
17. All tap targets are ≥64px
18. `prefers-reduced-motion` reduces shake/confetti/spin

## 5. Dependencies

- **GDD:** `docs/GDD.md` (fully locked, development-ready)
- **Tech Stack:** `conductor/tech-stack.md`
- **Product Guidelines:** `conductor/product-guidelines.md`
- **Workflow:** `conductor/workflow.md` (TDD, >80% coverage, per-task commits, phase checkpoints)

## 6. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Canvas2D vector drawing complexity for characters | Start with minimal viable dino (colored rectangle + eye); iterate to vector paths |
| Web Audio API initialization on mobile (autoplay policy) | Initialize AudioContext on first user interaction (tap), not on page load |
| Touch event handling across browsers | Use Pointer Events API (unifies touch + mouse) |
| State management complexity | Keep runtime/persisted split clean from day one (GDD §9.2) |

</protect>
