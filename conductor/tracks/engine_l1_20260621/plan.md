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

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffolding & Tooling' (Protocol in workflow.md)

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

- [ ] Task: Commit Phase 2 core logic
    - [ ] Stage and commit all Phase 2 files
    - [ ] Attach git note with task summary

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Types & Logic' (Protocol in workflow.md)

---

## Phase 3: Command Execution Engine

- [ ] Task: Read `spec.md` and `workflow.md` before starting this phase

- [ ] Task: Implement command queue processor skeleton
    - [ ] Write tests: empty queue → idle state (no execution); queue with commands → processes sequentially; `activeCommandIndex` increments after each command; queue exhaustion → terminal check
    - [ ] Implement `src/engine/executor.ts`: `processNextCommand(state, level)` → result (`continue`/`win`/`hardFail`/`softResist`), `checkTerminalState(state, level)` → terminal result
    - [ ] Verify tests pass

- [ ] Task: Implement Forward command
    - [ ] Write tests: forward into empty tile → moves, advances index; forward out-of-bounds → hard failure; forward into obstacle → hard failure; forward out of uncleared interactable → soft resist (stay, advance); forward onto food tile → moves but no auto-win; forward onto cleared interactable → moves
    - [ ] Implement `forwardCommand(state, level)` in executor: compute target, check bounds, check obstacle, check uncleared interactable exit, move or fail
    - [ ] Verify tests pass

- [ ] Task: Implement Left and Right commands
    - [ ] Write tests: left turn from E → faces N; left from N → W; left from W → S; left from S → E; right from E → S; right from S → W; right from W → N; right from N → E; both advance index without moving
    - [ ] Implement `leftCommand(state)` and `rightCommand(state)` using `turnLeft`/`turnRight` from direction module
    - [ ] Verify tests pass

- [ ] Task: Implement Action (🦕) command — contextual
    - [ ] Write tests: 🦕 on food tile → win (terminal); 🦕 on uncleared interactable → clears tile, marks cleared, advances; 🦕 on cleared interactable → no-op, advances; 🦕 on empty tile → no-op, advances; all cases advance index (except win which is terminal)
    - [ ] Implement `actionCommand(state, level)` in executor: check food, check uncleared interactable, else no-op
    - [ ] Verify tests pass

- [ ] Task: Implement win condition detection
    - [ ] Write tests: 🦕 on food → `win` result; sequence ends with dino on food but no 🦕 → `hint` result (food wiggle); sequence ends with dino not on food → `idle` result; 🦕-on-food mid-sequence → win immediately (discard remaining)
    - [ ] Implement win/hint/idle detection in executor's terminal check
    - [ ] Verify tests pass

- [ ] Task: Implement two-tier failure model
    - [ ] Write tests: hard failure resets `dinoPos` to start, resets `dinoFacing` to start facing, clears `commandQueue`, resets `activeCommandIndex` to -1, clears `clearedInteractables`; soft resist preserves position, advances index, does not clear queue
    - [ ] Implement `hardFail(state, level)` and `softResist(state)` in executor
    - [ ] Verify tests pass

- [ ] Task: Implement execution loop state machine (GDD §9.5)
    - [ ] Write tests: full Level 1 solution `[F,F,F,A]` → processes 4 commands → `win`; invalid solution `[F,F,F,F]` (walks past food) → `idle` (not on food after queue); solution `[F,R,F,L,F,A]` with turns → `win`; solution hitting boundary `[F,F,F,F,F,F]` (6 forwards, hits wall at x=5) → `hardFail`
    - [ ] Implement `executeQueue(state, level)` — the top-level function called by GO button: loops `processNextCommand` until terminal
    - [ ] Verify all Level 1 scenarios pass with `pnpm test`

- [ ] Task: Commit Phase 3 execution engine
    - [ ] Stage and commit all Phase 3 files
    - [ ] Attach git note with task summary

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Command Execution Engine' (Protocol in workflow.md)

---

## Phase 4: Canvas2D Rendering

- [ ] Task: Read `spec.md` and `workflow.md` before starting this phase

- [ ] Task: Set up Canvas2D context and render loop
    - [ ] Create `src/render/canvas.ts`: get canvas + 2d context, handle resize/DPI scaling
    - [ ] Create `src/render/loop.ts`: `requestAnimationFrame` loop with delta-time, start/stop controls
    - [ ] Verify canvas renders a test rectangle in browser

- [ ] Task: Implement grid rendering
    - [ ] Create `src/render/grid.ts`: draw 5×3 grid with tile size calculation, tile background colors (mint green for empty)
    - [ ] Create `src/render/tiles.ts`: render tile types — empty, obstacle (rock), interactable (turtle/grass), food (berry/leaf/cookie) — using inline SVG or basic canvas paths
    - [ ] Verify grid renders with Level 1 layout (dino at (0,1), food at (3,1)) in browser

- [ ] Task: Implement dino vector rendering
    - [ ] Create `src/render/dino.ts`: procedural Canvas2D drawing of dino body (basic shapes: body, head, eye, legs) parameterized by character color (Rexy green, Trikey blue, Sera pink)
    - [ ] Support facing direction (flip/rotate sprite based on `dinoFacing`)
    - [ ] Verify dino renders on grid at correct position and facing in browser

- [ ] Task: Implement smoothstep tweening utility
    - [ ] Write test: `smoothstep(0) === 0`; `smoothstep(1) === 1`; `smoothstep(0.5) === 0.5`; `smoothstep(0.25) === 0.15625`; monotonicity (output increases with input)
    - [ ] Implement `src/render/smoothstep.ts`: `smoothstep(t)` = `3t² - 2t³`, `lerp(a, b, t)` helper
    - [ ] Verify tests pass

- [ ] Task: Implement movement interpolation
    - [ ] Create `src/render/movement.ts`: interpolate dino render position between grid cells using smoothstep over a duration (e.g., 200ms per step)
    - [ ] Track animation state: `idle`, `walking`, `turning`
    - [ ] Verify dino smoothly slides between tiles in browser (visual check)

- [ ] Task: Implement basic dino animations
    - [ ] Implement idle animation (subtle bob)
    - [ ] Implement walking animation (leg movement during smoothstep transition)
    - [ ] Implement turning animation (rotate during turn command)
    - [ ] Verify animations play in browser during Level 1 execution

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Canvas2D Rendering' (Protocol in workflow.md)

---

## Phase 5: Input System & UI

- [ ] Task: Read `spec.md` and `workflow.md` before starting this phase

- [ ] Task: Implement tap-to-append input
    - [ ] Create `src/input/tap.ts`: Pointer Events listener on action menu buttons; maps tap → `addCommand(state, cmd)` if track has capacity
    - [ ] Create `src/ui/actionMenu.ts`: render 4 command buttons (🐾 ↩️ ↪️ 🦕) as DOM elements over canvas, 64px minimum tap targets
    - [ ] Verify tapping buttons fills track slots in browser

- [ ] Task: Implement tap-to-delete input
    - [ ] Add tap listener on track slots → `removeCommand(state, index)` with pop animation
    - [ ] Create `src/ui/track.ts`: render track slots (variable count from `trackBudget`), show placed commands as emoji blocks
    - [ ] Verify tapping a placed block removes it in browser

- [ ] Task: Implement GO button
    - [ ] Create `src/ui/goButton.ts`: render GO button (green, ▶️ icon, 64px target)
    - [ ] Wire GO tap → `setExecuting(state, true)` → `executeQueue(state, level)` → render results
    - [ ] Disable GO during execution; re-enable after terminal state
    - [ ] Verify GO executes the queue in browser

- [ ] Task: Implement track budget display
    - [ ] Render correct slot count from `trackBudget` (6 for Level 1)
    - [ ] Show empty slots vs filled slots visually
    - [ ] Animate slot growth when budget changes between levels (future-proof; test with hardcoded 6→8)
    - [ ] Verify track shows 6 slots for Level 1 in browser

- [ ] Task: Implement character swap UI
    - [ ] Create `src/ui/swapButton.ts`: render swap button (top-right, 🦖 icon)
    - [ ] Create `src/ui/characterCarousel.ts`: overlay with 3 character options
    - [ ] Wire swap → `saveCharacter()` + update `activeDino` in state; disabled during `isExecuting`
    - [ ] Verify swap changes dino skin during editing, disabled during execution in browser

- [ ] Task: Implement home screen (character selection)
    - [ ] Create `src/ui/home.ts`: render 3 character cards (Rexy, Trikey, Sera) with names and colors
    - [ ] Wire selection → set `chosenCharacter`, enter Level 1
    - [ ] Verify home screen shows on first load in browser

- [ ] Task: Implement level-select screen
    - [ ] Create `src/ui/levelSelect.ts`: render level tiles gated by `unlockedLevel`
    - [ ] Wire selection → load level data, enter game view
    - [ ] Verify only Level 1 is unlocked on first play in browser

- [ ] Task: Implement mute toggle
    - [ ] Create `src/ui/muteButton.ts`: render mute/unmute button
    - [ ] Wire tap → `saveMuted(!current)` + update audio system
    - [ ] Verify mute persists across reloads in browser

- [ ] Task: Conductor - User Manual Verification 'Phase 5: Input System & UI' (Protocol in workflow.md)

---

## Phase 6: Audio System

- [ ] Task: Read `spec.md` and `workflow.md` before starting this phase

- [ ] Task: Initialize Web Audio API context
    - [ ] Create `src/audio/context.ts`: lazy-init `AudioContext` on first user interaction (tap), not page load (mobile autoplay policy)
    - [ ] Create `src/audio/synth.ts`: base helper to create oscillator + gain envelope
    - [ ] Verify AudioContext initializes on first tap in browser

- [ ] Task: Implement stomp sound
    - [ ] Create `src/audio/sfx.ts`: `playStomp()` — sine wave, frequency sweep 120Hz→20Hz over 0.15s, fast attack + exponential decay
    - [ ] Verify stomp sound plays on Forward command in browser

- [ ] Task: Implement dizzy/bonk sound
    - [ ] Implement `playBonk()` — triangle wave, frequency sweep 400Hz→800Hz vibrato over 0.3s
    - [ ] Verify bonk sound plays on hard failure in browser

- [ ] Task: Implement success chime
    - [ ] Implement `playSuccess()` — square wave (soft filtered), C5→E5→G5→C6 fast arpeggio
    - [ ] Verify chime plays on Level 1 win in browser

- [ ] Task: Implement signature SFX per character
    - [ ] Implement `playSignature(character)` — Rexy: low growl sweep; Trikey: snort + horn click; Sera: high chirp + wing woosh
    - [ ] Verify signature plays on 🦕 action (clear/no-op) in browser

- [ ] Task: Implement mute support
    - [ ] Check `persisted.muted` before playing any SFX; skip if muted
    - [ ] Verify no audio plays when muted in browser

- [ ] Task: Conductor - User Manual Verification 'Phase 6: Audio System' (Protocol in workflow.md)

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
