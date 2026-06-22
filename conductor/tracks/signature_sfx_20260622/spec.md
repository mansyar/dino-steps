# Track: Character Signature SFX

## Overview

This track implements the per-character signature audio required by GDD §2 and §3.4, explicitly deferred in GDD §14.4. Each of the three characters (Rexy, Trikey, Sera) receives distinct synthesized signature sounds for the 🦕 action, with two variants per character: a stronger "action" variant (when clearing an interactable) and a softer "idle" variant (when no-op on cleared/empty tile). Additionally, this track fills two undocumented audio gaps — a gentle bonk for the soft-resist case (GDD §8.1) and a soft inviting cue for the food-wiggle hint (GDD §8.2) — and fixes a text-free violation bug where the hint case renders a text string despite GDD §1 declaring DinoSteps a text-free game.

## Functional Requirements

### FR1: Character Signature SFX

Each character gets two signature sounds (action + idle), synthesized via Web Audio API using the existing `playTone`/`playArpeggio` infrastructure in `src/audio/synth.ts`.

**Rexy (T-Rex) — "squeaky growls":**
- **Action variant** (clearing interactable): Low sawtooth growl sweep (~200→80Hz) with pitch wobble (vibrato depth 30Hz, rate 8Hz), ~0.3s duration, full gain (0.4)
- **Idle variant** (no-op): Same growl character but shorter (~0.15s) and quieter (gain 0.2)

**Trikey (Triceratops) — "horn-clicking sounds":**
- **Action variant**: Short percussive horn-click burst (~400Hz triangle, fast exponential decay), ~0.2s, full gain (0.4)
- **Idle variant**: Shorter (~0.1s), quieter (gain 0.2)

**Sera (Pterodactyl) — "high-pitched cheerful chirps":**
- **Action variant**: Rapid ascending 3-note chirp trill (~800→1000→1200Hz sine via `playArpeggio`), ~0.3s total (0.1s per note), full gain (0.3)
- **Idle variant**: 2-note ascending chirp (~800→1000Hz), ~0.15s total, quieter (gain 0.15)

### FR2: Replace Generic playAction()

The current `playAction()` (generic 600→400Hz sine "boop") is replaced by `playSignature(character: DinoCharacter, isClearing: boolean)` on the 🦕 command. `playAction()` is removed as dead code.

### FR3: Soft-Resist Audio (GDD §8.1)

A gentle bonk sound plays on soft-resist (forgotten 🦕 on interactable exit).
- **Sound**: Low muted thud — 150→100Hz sine wave, ~0.2s duration, soft attack, low gain (0.3)
- **Distinct** from hard-failure `playBonk()` (400→800Hz triangle squeaky toy with vibrato)

### FR4: Food-Wiggle Hint Audio (GDD §8.2)

A soft inviting cue plays when the sequence ends with dino ON food but no 🦕 executed.
- **Sound**: Ascending two-note chime — C5 (523.25Hz) → E5 (659.25Hz) soft sine, ~0.15s per note
- **Character-agnostic** — same sound regardless of active character

### FR5: Text-Free Hint Fix (GDD §1)

Remove the text hint element (`hintEl.textContent = "🍎 Feed [character]!"`) from the hint terminal case. GDD §1 declares DinoSteps a "text-free web game" — the hint must be purely visual (food wiggle + dino glance, already implemented) + audio (FR4). No replacement text.

### FR6: Executor Enhancement — Action Context

The executor's `CommandResult` type currently returns `{ type: 'continue' }` for both 🦕-clearing-interactable and 🦕-no-op, making them indistinguishable. Add an optional `actionContext` field to the `continue` variant:

```typescript
export type CommandResult =
  | { type: 'continue'; actionContext?: 'clear' | 'noop' }
  | { type: 'win' }
  | { type: 'hardFail' }
  | { type: 'softResist' };
```

`actionCommand()` sets `actionContext: 'clear'` when clearing an interactable, `actionContext: 'noop'` for no-op. Other commands (`forwardCommand`, `leftCommand`, `rightCommand`) leave `actionContext` undefined. `main.ts` reads this to select the correct signature variant.

**This is the only testable-logic change** (per `workflow.md` testing scope — vitest covers engine logic, NOT audio synthesis or rendering).

## Non-Functional Requirements

### NFR1: Performance
- All new sounds use the existing `playTone`/`playArpeggio` infrastructure — zero new dependencies
- Total bundle size remains <500KB (current: ~30KB)
- No audio files added (all synthesized via Web Audio API)

### NFR2: Testing
- Testable logic (executor `actionContext` enhancement) follows TDD: Red → Green → Refactor
- Audio synthesis functions (`sfx.ts`) are NOT unit-tested per `workflow.md` scope ("NOT audio synthesis")
- `main.ts` wiring changes are NOT unit-tested per `workflow.md` scope ("NOT rendering")
- Overall coverage remains >80%

### NFR3: Accessibility
- All new audio cues are supplementary to visual cues (never audio-alone for state changes)
- `prefers-reduced-motion` does not affect audio (audio is not motion)
- Mute toggle (`persisted.muted`) suppresses all new sounds
- Distinct audio per state change (GDD §11.2: "All state changes have distinct audio cues")

## Acceptance Criteria

1. 🦕 on uncleared interactable → plays the active character's **action-variant** signature sound + visual signature animation
2. 🦕 on cleared/empty tile → plays the active character's **idle-variant** signature sound + visual signature animation
3. 🦕 on food → plays `playSuccess()` (unchanged)
4. Soft-resist (🐾 out of uncleared interactable) → plays gentle thud sound + visual lean/bounce
5. Hard failure (🐾 into obstacle/boundary) → plays `playBonk()` (unchanged)
6. Sequence ends on food without 🦕 → plays ascending two-note chime + visual food-wiggle/glance, **NO text element**
7. Mute toggle suppresses all new sounds
8. No text elements rendered in the hint case
9. All existing tests pass; new executor tests pass; coverage >80%
10. `pnpm typecheck` and `pnpm lint` pass with 0 errors

## Out of Scope

- Character swap SFX (not in GDD)
- Background music / ambient audio (not in GDD)
- Level-complete fanfare beyond existing `playSuccess()`
- Playtesting with children (GDD §11.4 — requires human subjects, not a code track)
- Changes to `synth.ts` infrastructure (existing `playTone`/`playArpeggio` sufficient)
- Changes to visual signature animations (already implemented in `juice.ts`)
