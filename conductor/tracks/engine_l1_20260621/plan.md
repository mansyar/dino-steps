<protect>

# Implementation Plan: Build Core Game Engine and Level 1 Vertical Slice

**Track ID:** `engine_l1_20260621`
**Created:** 2026-06-21

---

## Phase 1: Project Scaffolding & Tooling

- [x] Task: Read `spec.md` and `workflow.md` before starting this phase

- [x] Task: Initialize Vite + TypeScript project with pnpm
    - [x] Run `pnpm create vite . --template ts` (or equivalent scaffolding)
    - [x] Verify `pnpm dev` starts the dev server and loads default page
    - [x] Create project directory structure: `src/`, `src/engine/`, `src/render/`, `src/input/`, `src/audio/`, `src/ui/`, `data/`, `test/`

- [x] Task: Configure TypeScript (tsconfig.json)
    - [x] Set `strict: true`
    - [x] Set `noEmit: true` (Vite handles emission)
    - [x] Set `incremental: true`
    - [x] Configure path aliases if desired (e.g., `@/` → `src/`)
    - [x] Verify `pnpm typecheck` (tsc --noEmit) passes

- [x] Task: Install and configure dev toolchain
    - [x] Install dev deps: `pnpm add -D vitest oxlint oxfmt lefthook`
    - [x] Create `oxlint.config.json` (or equivalent) with TypeScript rules
    - [x] Create `.oxfmtrc.json` (or equivalent) with formatting rules
    - [x] Add npm scripts to `package.json`: `dev`, `test`, `test:watch`, `lint`, `format`, `typecheck`, `coverage`
    - [x] Verify `pnpm lint`, `pnpm format`, `pnpm test` all run without errors

- [x] Task: Configure lefthook git hooks
    - [x] Create `lefthook.yml` with pre-commit (oxlint + oxfmt on staged files)
    - [x] Add pre-push hook (vitest coverage 80% threshold + tsc --noEmit)
    - [x] Run `pnpm lefthook install` to activate hooks
    - [x] Verify hooks trigger on a test commit

- [x] Task: Create index.html shell and Canvas element
    - [x] Create `index.html` with a `<canvas>` element and viewport meta (mobile-first)
    - [x] Add minimal CSS (full-screen canvas, no scroll, touch-action: none)
    - [x] Add `<div id="app">` container for UI overlay
    - [x] Verify the page loads in browser with canvas visible

- [x] Task: Create initial .gitignore
    - [x] Add `node_modules/`, `dist/`, `.tsbuildinfo`, coverage output
    - [x] Commit initial scaffolding

- [x] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffolding & Tooling' (Protocol in workflow.md)
    - Checkpoint SHA: `448b598` (retroactive)

---

## Phase 2: Core Types & Logic

- [ ] Task: Read `spec.md` and `workflow.md` before starting this phase

- [x] Task: Define TypeScript types and interfaces
    - [x] Write test: type-level assertions for `Command` union (`'F'|'L'|'R'|'A'`)
    - [x] Implement `src/engine/types.ts`: `Command`, `Direction` (`{dx, dy}`), `Facing` (`'E'|'S'|'W'|'N'`), `TileType`, `LevelData`, `GameState`, `PersistedState`, `DinoCharacter`
    - [x] Verify types compile with `pnpm typecheck`

- [x] Task: Implement direction vector module
    - [x] Write tests: forward adds vector to position; turn-left (CCW) transforms `(dx,dy)→(dy,-dx)`; turn-right (CW) transforms `(dx,dy)→(-dy,dx)`; all 4 starting orientations verified
    - [x] Implement `src/engine/direction.ts`: `DIRECTIONS` map, `forward(pos, dir)`, `turnLeft(dir)`, `turnRight(dir)`, `facingToVector(facing)`
    - [x] Verify tests pass with `pnpm test`

- [x] Task: Implement level data schema and loader
    - [x] Write tests: valid level JSON parses correctly; invalid JSON throws; missing required fields throw; command array maps to `Command` type
    - [x] Implement `src/engine/levelData.ts`: `parseLevel(json)`, `parseLevels(jsonArray)`, validation for required fields (`id`, `title`, `grid`, `start`, `food`, `trackBudget`, `verifiedSolution`)
    - [x] Create `data/levels.json` with Level 1 data only (id:1, "Hungry Steps", start (0,1)E, food (3,1), budget 6, solution `[F,F,F,A]`)
    - [x] Verify tests pass

- [x] Task: Implement BFS level validator
    - [x] Write tests: Level 1 solution `[F,F,F,A]` validates as winning; invalid solution (walks into wall) fails; `[F,F,A]` (too short) does not reach food; BFS computes minimum solution length; removing an obstacle shortens minimum (gates verification)
    - [x] Implement `src/engine/bfsValidator.ts`: `replaySolution(level, commands)` → result enum (`win`/`fail`/`incomplete`), `computeMinimum(level)` → number, `verifyObstaclesGate(level)` → boolean
    - [x] Verify Level 1 data passes validation with `pnpm test`

- [x] Task: Implement state tree (runtime + persisted) `a7b59b3`
    - [x] Write tests: initial `GameState` for Level 1 has correct `dinoPos`, `dinoFacing`, empty `commandQueue`, `activeCommandIndex: -1`, `trackBudget: 6`, empty `clearedInteractables`; state transitions (add command, remove command, advance index, clear interactable, teleport to start) produce correct new state; `isExecuting` flag toggles correctly
    - [x] Implement `src/engine/state.ts`: `createInitialState(level, character)`, `addCommand(state, cmd)`, `removeCommand(state, index)`, `advanceIndex(state)`, `clearInteractable(state, tile)`, `resetToStart(state)`, `setExecuting(state, bool)`
    - [x] Verify tests pass

- [x] Task: Implement localStorage persistence layer `22ec5fb`
    - [x] Write tests: `loadPersisted()` returns defaults when localStorage empty; `saveUnlockedLevel(n)` writes key `dinosteps:unlockedLevel`; `saveCharacter(c)` writes `dinosteps:chosenCharacter`; `saveMuted(b)` writes `dinosteps:muted`; `loadPersisted()` hydrates all 3 keys; `resetProgress()` clears all 3 keys; uses `vi.spyOn` on localStorage
    - [x] Implement `src/engine/persistence.ts`: `loadPersisted()`, `saveUnlockedLevel(n)`, `saveCharacter(c)`, `saveMuted(b)`, `resetProgress()`, key constants
    - [x] Verify tests pass

- [x] Task: Commit Phase 2 core logic `8fd0ffb`
    - [x] Stage and commit all Phase 2 files
    - [x] Attach git note with task summary

- [x] Task: Conductor - User Manual Verification 'Phase 2: Core Types & Logic' (Protocol in workflow.md)
    - Checkpoint SHA: `91e62df` (retroactive)

---

## Phase 3: Command Execution Engine

- [x] Task: Read `spec.md` and `workflow.md` before starting this phase

- [x] Task: Implement command queue processor skeleton
    - [x] Write tests: empty queue → idle state (no execution); queue with commands → processes sequentially; `activeCommandIndex` increments after each command; queue exhaustion → terminal check
    - [x] Implement `src/engine/executor.ts`: `processNextCommand(state, level)` → result (`continue`/`win`/`hardFail`/`softResist`), `checkTerminalState(state, level)` → terminal result
    - [x] Verify tests pass

- [x] Task: Implement Forward command
    - [x] Write tests: forward into empty tile → moves, advances index; forward out-of-bounds → hard failure; forward into obstacle → hard failure; forward out of uncleared interactable → soft resist (stay, advance); forward onto food tile → moves but no auto-win; forward onto cleared interactable → moves
    - [x] Implement `forwardCommand(state, level)` in executor: compute target, check bounds, check obstacle, check uncleared interactable exit, move or fail
    - [x] Verify tests pass

- [x] Task: Implement Left and Right commands
    - [x] Write tests: left turn from E → faces N; left from N → W; left from W → S; left from S → E; right from E → S; right from S → W; right from W → N; right from N → E; both advance index without moving
    - [x] Implement `leftCommand(state)` and `rightCommand(state)` using `turnLeft`/`turnRight` from direction module
    - [x] Verify tests pass

- [x] Task: Implement Action (🦕) command — contextual
    - [x] Write tests: 🦕 on food tile → win (terminal); 🦕 on uncleared interactable → clears tile, marks cleared, advances; 🦕 on cleared interactable → no-op, advances; 🦕 on empty tile → no-op, advances; all cases advance index (except win which is terminal)
    - [x] Implement `actionCommand(state, level)` in executor: check food, check uncleared interactable, else no-op
    - [x] Verify tests pass

- [x] Task: Implement win condition detection
    - [x] Write tests: 🦕 on food → `win` result; sequence ends with dino on food but no 🦕 → `hint` result (food wiggle); sequence ends with dino not on food → `idle` result; 🦕-on-food mid-sequence → win immediately (discard remaining)
    - [x] Implement win/hint/idle detection in executor's terminal check
    - [x] Verify tests pass

- [x] Task: Implement two-tier failure model
    - [x] Write tests: hard failure resets `dinoPos` to start, resets `dinoFacing` to start facing, clears `commandQueue`, resets `activeCommandIndex` to -1, clears `clearedInteractables`; soft resist preserves position, advances index, does not clear queue
    - [x] Implement `hardFail(state, level)` and `softResist(state)` in executor
    - [x] Verify tests pass

- [x] Task: Implement execution loop state machine (GDD §9.5)
    - [x] Write tests: full Level 1 solution `[F,F,F,A]` → processes 4 commands → `win`; invalid solution `[F,F,F,F]` (walks past food) → `idle` (not on food after queue); solution `[F,R,F,L,F,A]` with turns → `win`; solution hitting boundary `[F,F,F,F,F,F]` (6 forwards, hits wall at x=5) → `hardFail`
    - [x] Implement `executeQueue(state, level)` — the top-level function called by GO button: loops `processNextCommand` until terminal
    - [x] Verify all Level 1 scenarios pass with `pnpm test`

- [x] Task: Commit Phase 3 execution engine `837d4c6`
    - [x] Stage and commit all Phase 3 files
    - [x] Attach git note with task summary

- [x] Task: Conductor - User Manual Verification 'Phase 3: Command Execution Engine' (Protocol in workflow.md)
    - Checkpoint SHA: `9f21519` (retroactive)

---

## Phase 4: Canvas2D Rendering

- [x] Task: Read `spec.md` and `workflow.md` before starting this phase

- [x] Task: Set up Canvas2D context and render loop
    - [x] Create `src/render/canvas.ts`: get canvas + 2d context, handle resize/DPI scaling
    - [x] Create `src/render/loop.ts`: `requestAnimationFrame` loop with delta-time, start/stop controls
    - [x] Verify canvas renders in browser

- [x] Task: Implement grid rendering
    - [x] Create `src/render/grid.ts`: draw 5×3 grid with tile size calculation, tile background colors (mint green for empty)
    - [x] Create `src/render/tiles.ts`: render tile types — empty, obstacle (rock), interactable (turtle/grass), food (berry/leaf/cookie) — using inline SVG or basic canvas paths
    - [x] Verify grid renders with Level 1 layout (dino at (0,1), food at (3,1)) in browser

- [x] Task: Implement dino vector rendering
    - [x] Create `src/render/dino.ts`: procedural Canvas2D drawing of dino body (basic shapes: body, head, eye, legs) parameterized by character color (Rexy green, Trikey blue, Sera pink)
    - [x] Support facing direction (flip/rotate sprite based on `dinoFacing`)
    - [x] Verify dino renders on grid at correct position and facing in browser

- [x] Task: Implement smoothstep tweening utility
    - [x] Write test: `smoothstep(0) === 0`; `smoothstep(1) === 1`; `smoothstep(0.5) === 0.5`; `smoothstep(0.25) === 0.15625`; monotonicity (output increases with input)
    - [x] Implement `src/render/smoothstep.ts`: `smoothstep(t)` = `3t² - 2t³`, `lerp(a, b, t)` helper
    - [x] Verify tests pass

- [x] Task: Implement movement interpolation
    - [x] Create `src/render/movement.ts`: interpolate dino render position between grid cells using smoothstep over a duration (e.g., 200ms per step)
    - [x] Track animation state: `idle`, `walking`, `turning`
    - [x] Verify dino smoothly slides between tiles in browser (visual check)

- [x] Task: Implement basic dino animations
    - [x] Implement idle animation (subtle bob)
    - [x] Implement walking animation (leg movement during smoothstep transition)
    - [x] Implement turning animation (rotate during turn command)
    - [x] Verify animations play in browser during Level 1 execution

- [x] Task: Conductor - User Manual Verification 'Phase 4: Canvas2D Rendering' (Protocol in workflow.md)
    - Checkpoint SHA: `4d97a4c` (retroactive)

---

## Phase 5: Input System & UI

- [x] Task: Read `spec.md` and `workflow.md` before starting this phase

- [x] Task: Implement tap-to-append input
    - [x] Create `src/input/tap.ts`: Pointer Events listener on action menu buttons; maps tap → `addCommand(state, cmd)` if track has capacity
    - [x] Create `src/ui/actionMenu.ts`: render 4 command buttons (🐾 ↩️ ↪️ 🦕) as DOM elements over canvas, 64px minimum tap targets
    - [x] Verify tapping buttons fills track slots in browser

- [x] Task: Implement tap-to-delete input
    - [x] Add tap listener on track slots → `removeCommand(state, index)` with pop animation
    - [x] Create `src/ui/track.ts`: render track slots (variable count from `trackBudget`), show placed commands as emoji blocks
    - [x] Verify tapping a placed block removes it in browser

- [x] Task: Implement GO button
    - [x] Create `src/ui/goButton.ts`: render GO button (green, ▶️ icon, 64px target)
    - [x] Wire GO tap → `setExecuting(state, true)` → `executeQueue(state, level)` → render results
    - [x] Disable GO during execution; re-enable after terminal state
    - [x] Verify GO executes the queue in browser

- [x] Task: Implement track budget display
    - [x] Render correct slot count from `trackBudget` (6 for Level 1)
    - [x] Show empty slots vs filled slots visually
    - [x] Animate slot growth when budget changes between levels (future-proof; test with hardcoded 6→8)
    - [x] Verify track shows 6 slots for Level 1 in browser

- [x] Task: Implement character swap UI
    - [x] Create `src/ui/swapButton.ts`: render swap button (top-right, 🦖 icon)
    - [x] Create `src/ui/characterCarousel.ts`: overlay with 3 character options
    - [x] Wire swap → `saveCharacter()` + update `activeDino` in state; disabled during `isExecuting`
    - [x] Verify swap changes dino skin during editing, disabled during execution in browser

- [x] Task: Implement home screen (character selection)
    - [x] Create `src/ui/home.ts`: render 3 character cards (Rexy, Trikey, Sera) with names and colors
    - [x] Wire selection → set `chosenCharacter`, enter Level 1
    - [x] Verify home screen shows on first load in browser

- [x] Task: Implement level-select screen
    - [x] Create `src/ui/levelSelect.ts`: render level tiles gated by `unlockedLevel`
    - [x] Wire selection → load level data, enter game view
    - [x] Verify only Level 1 is unlocked on first play in browser

- [x] Task: Implement mute toggle
    - [x] Create `src/ui/muteButton.ts`: render mute/unmute button
    - [x] Wire tap → `saveMuted(!current)` + update audio system
    - [x] Verify mute persists across reloads in browser

- [x] Task: Conductor - User Manual Verification 'Phase 5: Input System & UI' (Protocol in workflow.md)
    - Checkpoint SHA: `4d97a4c` (retroactive, combined with Phase 4)

---

## Phase 6: Audio System

- [x] Task: Read `spec.md` and `workflow.md` before starting this phase

- [x] Task: Initialize Web Audio API context
    - [x] Create `src/audio/context.ts`: lazy-init `AudioContext` on first user interaction (tap), not page load (mobile autoplay policy)
    - [x] Create `src/audio/synth.ts`: base helper to create oscillator + gain envelope
    - [x] Verify AudioContext initializes on first tap in browser

- [x] Task: Implement stomp sound
    - [x] Create `src/audio/sfx.ts`: `playStomp()` — sine wave, frequency sweep 120Hz→20Hz over 0.15s, fast attack + exponential decay
    - [x] Verify stomp sound plays on Forward command in browser

- [x] Task: Implement dizzy/bonk sound
    - [x] Implement `playBonk()` — triangle wave, frequency sweep 400Hz→800Hz vibrato over 0.3s
    - [x] Verify bonk sound plays on hard failure in browser

- [x] Task: Implement success chime
    - [x] Implement `playSuccess()` — square wave (soft filtered), C5→E5→G5→C6 fast arpeggio
    - [x] Verify chime plays on Level 1 win in browser

- [x] Task: Implement signature SFX per character
    - [x] Implement `playSignature(character)` — Rexy: low growl sweep; Trikey: snort + horn click; Sera: high chirp + wing woosh
    - [x] Verify signature plays on 🦕 action (clear/no-op) in browser

- [x] Task: Implement mute support
    - [x] Check `persisted.muted` before playing any SFX; skip if muted
    - [x] Verify no audio plays when muted in browser

- [x] Task: Conductor - User Manual Verification 'Phase 6: Audio System' (Protocol in workflow.md)
    - Checkpoint SHA: `f74cbc3`

---

## Phase 7: Level 1 Integration & Polish

- [ ] Task: Read `spec.md` and `workflow.md` before starting this phase

- [ ] Task: Implement success animation (confetti + backflip)
    - [ ] Create `src/render/confetti.ts`: procedural particle system (multi-colored falling particles, confetti theme colors)
    - [ ] Create dino backflip animation (rotation during success)
    - [ ] Wire success → confetti burst + backflip + nom-nom + success chime
    - [ ] Verify win animation plays on Level 1 completion in browser

- [ ] Task: Implement failure animation (dizzy + teleport)
    - [ ] Create dizzy ring animation (slow spin over dino head, <3Hz)
    - [ ] Create bump animation (dino leans into obstacle/boundary)
    - [ ] Wire hard failure → bump + dizzy + bonk → teleport to start (smoothstep)
    - [ ] Verify failure animation plays on boundary collision in browser

- [ ] Task: Implement food-wiggle hint
    - [ ] Create food wiggle animation (gentle oscillation)
    - [ ] Create dino glance animation (head turns toward food)
    - [ ] Wire hint → trigger when sequence ends with dino on food but no 🦕 executed
    - [ ] Verify hint plays when queue ends on food tile without eating in browser

- [ ] Task: Implement level advancement
    - [ ] On win: increment `unlockedLevel` if current level was the highest unlocked
    - [ ] Save to localStorage via `saveUnlockedLevel()`
    - [ ] Auto-advance to next level (or show level-select if no next level)
    - [ ] Verify Level 1 win advances and persists unlocked level in browser

- [ ] Task: Implement accessibility features
    - [ ] Verify all tap targets are ≥64px (action menu, GO, track slots, swap, mute)
    - [ ] Implement `prefers-reduced-motion`: reduce screen-shake amplitude, confetti count, dizzy-spin speed
    - [ ] Verify <3Hz on all animations (dizzy ring, confetti)
    - [ ] Verify multi-cue states (GO button has ▶️ icon + green color; failure has dizzy ring + bonk + coral color)

- [ ] Task: End-to-end Level 1 playthrough verification
    - [ ] Start dev server, open browser
    - [ ] Select character → enter Level 1
    - [ ] Build `🐾🐾🐾🦕` → press GO → verify win (confetti, chime, backflip, advance)
    - [ ] Build invalid sequence (e.g., `🐾🐾🐾🐾🐾🐾`) → verify failure (walks off grid → bonk, dizzy, teleport)
    - [ ] Build `🐾🐾🐾` (ends on food, no 🦕) → verify food-wiggle hint
    - [ ] Swap character during editing → verify skin changes
    - [ ] Attempt swap during execution → verify disabled
    - [ ] Mute audio → verify silent → reload → verify mute persists
    - [ ] Win Level 1 → reload → verify level still unlocked

- [ ] Task: Run full quality gate
    - [ ] `pnpm test` — all tests pass, coverage >80% on testable logic
    - [ ] `pnpm lint` — zero lint errors
    - [ ] `pnpm typecheck` — zero type errors
    - [ ] `pnpm build` — production build succeeds, output <500KB
    - [ ] Manual 60fps verification in browser (DevTools Performance tab)

- [ ] Task: Commit final Level 1 integration
    - [ ] Stage and commit all remaining files
    - [ ] Attach git note with task summary

- [ ] Task: Conductor - User Manual Verification 'Phase 7: Level 1 Integration & Polish' (Protocol in workflow.md)

</protect>
