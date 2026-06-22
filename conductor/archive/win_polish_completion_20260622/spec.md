<protect>
# Track: win_polish_completion_20260622

## Overview

This track closes the most visible gaps between the GDD and the current implementation by making the win experience fully text-free and complete. It addresses five GDD-specified gaps: (1) the text-based "Level Complete!" win overlay violates the core text-free design principle, (2) the GDD-specified "nom-nom" eating sound is missing from the win sequence, (3) there is no game-completion state after level 10 (dead-end UX), (4) the GDD-mandated reset-progress option is missing, and (5) the character carousel's "Cancel" button uses text instead of an icon.

## Functional Requirements

### FR-1: Text-Free Win Overlay Removal
- Remove the DOM-based win overlay (`winEl`) entirely from the win sequence
- The win moment is communicated solely through: confetti burst, dino backflip, success chime (existing), nom-nom eating sound (new FR-2), and auto-advance after the celebration timer
- Remove the `showWinOverlay()` / `hideWinOverlay()` DOM manipulation from `main.ts`
- Ensure the auto-advance timer still fires after the celebration duration (no regression)

### FR-2: Nom-Nom Eating Sound
- Add a new `playNomNom()` function to `src/audio/sfx.ts`
- The sound is a universal cartoon chomping/chewing sound (not character-specific)
- It plays immediately before the success chime in the win sequence (nom-nom → success chime order per GDD §8.2)
- Synthesized via Web Audio API (oscillators, gain envelopes) — no audio files
- Respects the existing mute state (`persisted.muted`)

### FR-3: Game Completion After Level 10
- When the child wins level 10 (the final level), instead of the normal auto-advance:
  - The standard win celebration plays (confetti + backflip + chime + nom-nom)
  - After the celebration timer, the game returns to the home screen (not level select)
- On the home screen, a visual "trophy" indicator appears showing all levels are complete
- The trophy is a canvas-drawn or emoji-based visual element (e.g., 🏆) that appears near the title
- Completing all levels does NOT lock levels — the child can still replay any level

### FR-4: Reset Progress (Long-Press Title)
- Long-pressing (or holding) the "DinoSteps" title on the home screen for ~2 seconds reveals a hidden reset option
- The reset option is a small overlay or inline button: "Reset Progress" (text acceptable here — parent-facing, not child-facing)
- Activating reset clears all 3 localStorage keys: `dinosteps:unlockedLevel`, `dinosteps:chosenCharacter`, `dinosteps:muted`
- After reset, the game returns to the initial state (level 1 unlocked, default character, unmuted)
- The long-press interaction must use a timer (not just a click) to prevent accidental triggering by children
- The reset button includes a confirmation step (tap "Reset" again within 3 seconds, or it auto-hides)

### FR-5: Text-Free Character Carousel Close
- Replace the text "Cancel" button in the character swap carousel with a ✕ (close) icon
- The ✕ icon must meet the 64px tap target requirement
- Retain the existing `aria-label` for accessibility ("Close character selection")
- No other text in the carousel is changed (character names remain for parent reference)

## Non-Functional Requirements

- **Audio**: `playNomNom()` must use the existing `AudioContext` infrastructure and synth patterns (no new audio dependencies)
- **Accessibility**: All new UI elements must meet 64px tap target minimum, support `prefers-reduced-motion`, and have appropriate ARIA labels
- **Performance**: No additional DOM elements that could affect render performance. Win overlay removal should be net-positive for DOM performance
- **Text-free compliance**: No readable text appears during gameplay states (win, fail, execution). Text is permitted only in parent-facing contexts (reset confirmation, menu labels for parents)
- **Persistence**: Reset must clear exactly the 3 specified localStorage keys — no other storage is affected
- **Testing**: All new testable logic (nom-nom sound trigger logic, game completion state transition, reset progress logic, long-press timer logic) must have unit tests. Coverage must remain >80%

## Acceptance Criteria

1. **AC-1**: Winning any level (1–9) shows confetti + backflip + nom-nom sound + success chime, then auto-advances to the next level. No text overlay appears at any point during the win sequence.
2. **AC-2**: Winning level 10 shows the same celebration, then returns to the home screen with a trophy indicator visible.
3. **AC-3**: The nom-nom sound plays before the success chime on every win.
4. **AC-4**: Long-pressing the home screen title for ~2 seconds reveals a "Reset Progress" option.
5. **AC-5**: Activating reset clears all 3 localStorage keys and returns the game to its initial state.
6. **AC-6**: The character carousel close button shows a ✕ icon, not the text "Cancel".
7. **AC-7**: The mute toggle affects the nom-nom sound (no sound when muted).
8. **AC-8**: `prefers-reduced-motion` is respected — if reduced motion is on, the trophy indicator appears without animation.
9. **AC-9**: All existing tests still pass. New tests cover: nom-nom trigger logic, game completion state, reset progress, long-press timer.

## Out of Scope

- Color-blind palette audit (GDD §11.2) — deferred to a separate track
- Removing text from menus (home screen title, level select titles, character names) — these are parent-facing and acceptable per the GDD's wireframe annotations
- Playtesting (GDD §14.5) — deferred to a separate track
- Changing level data format or loading mechanism
- Adding new levels beyond the existing 10
</protect>
