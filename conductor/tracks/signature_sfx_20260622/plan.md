<protect>
# Implementation Plan: Character Signature SFX

## Phase 1: Executor Enhancement — Action Context (TDD) [checkpoint: 870a558]

- [x] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 1
- [x] Task: Add `actionContext` field to `CommandResult` type and `actionCommand()` 2b78469
    - [ ] **Red:** Write failing tests in `test/executor.test.ts` for `actionCommand` returning `actionContext: 'clear'` on uncleared interactable, `actionContext: 'noop'` on cleared/empty tile, and `type: 'win'` (unchanged) on food
    - [ ] **Green:** Add `actionContext?: 'clear' | 'noop'` to the `continue` variant of `CommandResult` in `src/engine/executor.ts`; set it in `actionCommand()` — `'clear'` when `isUnclearedInteractable`, `'noop'` otherwise
    - [ ] **Refactor:** Ensure `forwardCommand`, `leftCommand`, `rightCommand` return `{ type: 'continue' }` without `actionContext` (no change needed — optional field absent)
    - [ ] **Verify:** Run `CI=true pnpm test` — all tests pass including new ones; run `CI=true pnpm coverage` — coverage >80%
- [x] Task: Conductor - User Manual Verification 'Phase 1: Executor Enhancement' (Protocol in workflow.md)

## Phase 2: Signature SFX & Audio Gap Sounds (Audio Synthesis — NOT TDD) [checkpoint: d8ba2d7]

- [x] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 2
- [x] Task: Implement `playSignature(character: DinoCharacter, isClearing: boolean)` in `src/audio/sfx.ts` f2f7840
    - [x] Implement Rexy action variant: sawtooth growl sweep 200→80Hz, vibrato {depth: 30, rate: 8}, 0.3s, gain 0.4
    - [x] Implement Rexy idle variant: same growl, 0.15s, gain 0.2
    - [x] Implement Trikey action variant: triangle 400Hz fixed (no sweep), 0.2s, gain 0.4, fast decay
    - [x] Implement Trikey idle variant: same, 0.1s, gain 0.2
    - [x] Implement Sera action variant: `playArpeggio([800, 1000, 1200], 0.1, 'sine', 0.3)`
    - [x] Implement Sera idle variant: `playArpeggio([800, 1000], 0.075, 'sine', 0.15)`
    - [x] Verify: Run `CI=true pnpm test` — existing tests still pass (no new tests for audio synthesis per workflow scope)
- [x] Task: Implement `playSoftResist()` in `src/audio/sfx.ts`
    - [x] Low muted thud: sine 150→100Hz, 0.2s, gain 0.3, soft attack (exponential decay)
    - [x] Verify: Run `CI=true pnpm test` — existing tests still pass
- [x] Task: Implement `playHint()` in `src/audio/sfx.ts`
    - [x] Ascending two-note chime: `playArpeggio([C5, E5], 0.15, 'sine', 0.2)` (C5=523.25Hz, E5=659.25Hz — constants already exist)
    - [x] Verify: Run `CI=true pnpm test` — existing tests still pass
- [x] Task: Remove dead `playAction()` from `src/audio/sfx.ts` (deferred to Phase 3)
    - [x] Delete `playAction` function after wiring `playSignature` in Phase 3
    - [x] Verify: Run `CI=true pnpm typecheck` — no type errors (ensure no remaining references)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Signature SFX & Audio Gaps' (Protocol in workflow.md)

## Phase 3: Wiring & Text-Free Fix (Input/Rendering — NOT TDD) 350891e

- [x] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 3
- [x] Task: Wire `playSignature()` into `src/main.ts` 🦕 action handler
    - [x] Update import: replace `playAction` with `playSignature` in the import from `./audio/sfx`
    - [x] Replace `playAction()` call with `playSignature(gameState.character, result.actionContext === 'clear')` in the `continue` + `A` command case
    - [x] Verify: Run `CI=true pnpm typecheck` — no type errors
- [x] Task: Wire `playSoftResist()` into `src/main.ts` soft-resist case
    - [x] Add `playSoftResist` to the import from `./audio/sfx`
    - [x] Add `if (!currentMuted) playSoftResist();` in the `softResist` case (alongside existing `triggerSoftResist` visual call)
    - [x] Verify: Run `CI=true pnpm typecheck` — no type errors
- [x] Task: Wire `playHint()` into `src/main.ts` hint terminal case
    - [x] Add `playHint` to the import from `./audio/sfx`
    - [x] Add `if (!currentMuted) playHint();` in the `hint` terminal case (alongside existing food-wiggle visual)
    - [x] Verify: Run `CI=true pnpm typecheck` — no type errors
- [x] Task: Remove text hint element (text-free fix, GDD §1)
    - [x] Remove or comment out `hintEl.textContent = ...` line in the hint terminal case
    - [x] Remove `hintEl` creation/show logic if it serves no other purpose; otherwise leave the element but empty its content
    - [x] Verify: Run `CI=true pnpm typecheck` and `CI=true pnpm lint` — no errors
- [x] Task: Conductor - User Manual Verification 'Phase 3: Wiring & Text-Free Fix' (Protocol in workflow.md)

## Phase 4: Final Verification [checkpoint: d9be3c6]

- [x] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 4
- [x] Task: Run full quality gate
    - [x] Run `CI=true pnpm test` — all tests pass (178+ existing + new executor tests)
    - [x] Run `CI=true pnpm coverage` — coverage >80%
    - [x] Run `pnpm typecheck` — 0 errors
    - [x] Run `pnpm lint` — 0 errors / 0 warnings
    - [x] Run `pnpm format` — clean
    - [x] Run `pnpm build` and check build size <500KB
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
</protect>
