<protect>
# Implementation Plan: win_polish_completion_20260622

## Phase 1: Nom-Nom Eating Sound & Win Overlay Removal

### Task: Read spec.md and workflow.md before starting this phase
- [x] Read `conductor/tracks/win_polish_completion_20260622/spec.md` to review the specification for this phase
- [x] Read `conductor/workflow.md` to review the TDD workflow and quality gates

### Task: Implement playNomNom() in sfx.ts
- [x] Add `playNomNom()` function to `src/audio/sfx.ts`
- [x] Synthesize a universal cartoon chomping sound using existing AudioContext/synth infrastructure
- [x] Ensure it respects the existing mute state (check `persisted.muted` like other SFX)

### Task: Integrate nom-nom into win sequence and remove win overlay
- [x] In `main.ts`, call `playNomNom()` before `playSuccess()` in the win handler (GDD §8.2: nom-nom → success chime order)
- [x] Remove `showWinOverlay()` / `hideWinOverlay()` DOM manipulation calls from win sequence
- [x] Remove or hide the `winEl` DOM element and its CSS
- [x] Verify auto-advance timer still fires after celebration duration (no regression)

### Task: Conductor - User Manual Verification 'Nom-Nom Sound & Win Overlay Removal' (Protocol in workflow.md)

## Phase 2: Game Completion State After L10

### Task: Read spec.md and workflow.md before starting this phase
- [ ] Read `conductor/tracks/win_polish_completion_20260622/spec.md` to review the specification for this phase
- [ ] Read `conductor/workflow.md` to review the TDD workflow and quality gates

### Task: Write failing tests for game completion state
- [ ] Add test: state tracks a `gameComplete` boolean flag
- [ ] Add test: winning the last level (index = levels.length - 1) sets `gameComplete` to true
- [ ] Add test: `gameComplete` flag is not set for levels 1–9
- [ ] Run tests and confirm they fail (Red phase)

### Task: Implement game completion state logic
- [ ] Add `gameComplete` flag to the game state in `src/engine/state.ts`
- [ ] Set `gameComplete = true` when winning the last level
- [ ] In `main.ts`, when `gameComplete` is true after win celebration, return to home screen instead of auto-advancing
- [ ] Run tests and confirm they pass (Green phase)

### Task: Add trophy indicator on home screen
- [ ] Add trophy visual (🏆 emoji or canvas-drawn) to home screen when `gameComplete` is true
- [ ] Position trophy near the title
- [ ] Respect `prefers-reduced-motion` (static display, no animation)
- [ ] Ensure levels remain replayable (no locking)

### Task: Conductor - User Manual Verification 'Game Completion State After L10' (Protocol in workflow.md)

## Phase 3: Reset Progress (Long-Press Title)

### Task: Read spec.md and workflow.md before starting this phase
- [ ] Read `conductor/tracks/win_polish_completion_20260622/spec.md` to review the specification for this phase
- [ ] Read `conductor/workflow.md` to review the TDD workflow and quality gates

### Task: Write failing tests for reset progress logic
- [ ] Add test: `resetProgress()` clears `dinosteps:unlockedLevel` from localStorage
- [ ] Add test: `resetProgress()` clears `dinosteps:chosenCharacter` from localStorage
- [ ] Add test: `resetProgress()` clears `dinosteps:muted` from localStorage
- [ ] Add test: `resetProgress()` restores default values (level 1, default character, unmuted)
- [ ] Run tests and confirm they fail (Red phase)

### Task: Implement resetProgress() in persistence.ts
- [ ] Add `resetProgress()` function to `src/engine/persistence.ts`
- [ ] Clear all 3 localStorage keys
- [ ] Restore initial/default state values
- [ ] Run tests and confirm they pass (Green phase)

### Task: Implement long-press title interaction in tap.ts
- [ ] Add touchstart/mousedown hold detection on the home screen title element
- [ ] 2-second hold threshold to reveal "Reset Progress" option
- [ ] Add confirmation step (tap "Reset" again within 3 seconds, or auto-hide)
- [ ] On confirmed reset, call `resetProgress()` and reload game state
- [ ] Ensure 64px tap target for the reset button

### Task: Conductor - User Manual Verification 'Reset Progress' (Protocol in workflow.md)

## Phase 4: Text-Free Carousel Close

### Task: Read spec.md and workflow.md before starting this phase
- [ ] Read `conductor/tracks/win_polish_completion_20260622/spec.md` to review the specification for this phase
- [ ] Read `conductor/workflow.md` to review the TDD workflow and quality gates

### Task: Replace "Cancel" text with ✕ icon
- [ ] In `tap.ts`, change `closeBtn.textContent = 'Cancel'` to use ✕ emoji/icon
- [ ] Ensure 64px tap target is maintained
- [ ] Retain `aria-label="Close character selection"` for accessibility
- [ ] Verify visually that no text appears on the close button

### Task: Conductor - User Manual Verification 'Text-Free Carousel Close' (Protocol in workflow.md)
</protect>
