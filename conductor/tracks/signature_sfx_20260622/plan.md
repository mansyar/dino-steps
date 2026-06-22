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

## Phase 2: Signature SFX & Audio Gap Sounds (Audio Synthesis — NOT TDD)

- [ ] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 2
- [ ] Task: Implement `playSignature(character: DinoCharacter, isClearing: boolean)` in `src/audio/sfx.ts`
    - [ ] Implement Rexy action variant: sawtooth growl sweep 200→80Hz, vibrato {depth: 30, rate: 8}, 0.3s, gain 0.4
    - [ ] Implement Rexy idle variant: same growl, 0.15s, gain 0.2
    - [ ] Implement Trikey action variant: triangle 400Hz fixed (no sweep), 0.2s, gain 0.4, fast decay
    - [ ] Implement Trikey idle variant: same, 0.1s, gain 0.2
    - [ ] Implement Sera action variant: `playArpeggio([800, 1000, 1200], 0.1, 'sine', 0.3)`
    - [ ] Implement Sera idle variant: `playArpeggio([800, 1000], 0.075, 'sine', 0.15)`
    - [ ] Verify: Run `CI=true pnpm test` — existing tests still pass (no new tests for audio synthesis per workflow scope)
- [ ] Task: Implement `playSoftResist()` in `src/audio/sfx.ts`
    - [ ] Low muted thud: sine 150→100Hz, 0.2s, gain 0.3, soft attack (exponential decay)
    - [ ] Verify: Run `CI=true pnpm test` — existing tests still pass
- [ ] Task: Implement `playHint()` in `src/audio/sfx.ts`
    - [ ] Ascending two-note chime: `playArpeggio([C5, E5], 0.15, 'sine', 0.2)` (C5=523.25Hz, E5=659.25Hz — constants already exist)
    - [ ] Verify: Run `CI=true pnpm test` — existing tests still pass
- [ ] Task: Remove dead `playAction()` from `src/audio/sfx.ts`
    - [ ] Delete `playAction` function (will be replaced by `playSignature` in Phase 3)
    - [ ] Verify: Run `CI=true pnpm typecheck` — no type errors (ensure no remaining references)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Signature SFX & Audio Gaps' (Protocol in workflow.md)

## Phase 3: Wiring & Text-Free Fix (Input/Rendering — NOT TDD)

- [ ] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 3
- [ ] Task: Wire `playSignature()` into `src/main.ts` 🦕 action handler
    - [ ] Update import: replace `playAction` with `playSignature` in the import from `./audio/sfx`
    - [ ] Replace `playAction()` call with `playSignature(gameState.character, result.actionContext === 'clear')` in the `continue` + `A` command case
    - [ ] Verify: Run `CI=true pnpm typecheck` — no type errors
- [ ] Task: Wire `playSoftResist()` into `src/main.ts` soft-resist case
    - [ ] Add `playSoftResist` to the import from `./audio/sfx`
    - [ ] Add `if (!currentMuted) playSoftResist();` in the `softResist` case (alongside existing `triggerSoftResist` visual call)
    - [ ] Verify: Run `CI=true pnpm typecheck` — no type errors
- [ ] Task: Wire `playHint()` into `src/main.ts` hint terminal case
    - [ ] Add `playHint` to the import from `./audio/sfx`
    - [ ] Add `if (!currentMuted) playHint();` in the `hint` terminal case (alongside existing food-wiggle visual)
    - [ ] Verify: Run `CI=true pnpm typecheck` — no type errors
- [ ] Task: Remove text hint element (text-free fix, GDD §1)
    - [ ] Remove or comment out `hintEl.textContent = ...` line in the hint terminal case
    - [ ] Remove `hintEl` creation/show logic if it serves no other purpose; otherwise leave the element but empty its content
    - [ ] Verify: Run `CI=true pnpm typecheck` and `CI=true pnpm lint` — no errors
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Wiring & Text-Free Fix' (Protocol in workflow.md)

## Phase 4: Final Verification

- [ ] Task: Read `spec.md` and `workflow.md` to refresh context before starting Phase 4
- [ ] Task: Run full quality gate
    - [ ] Run `CI=true pnpm test` — all tests pass (178+ existing + new executor tests)
    - [ ] Run `CI=true pnpm coverage` — coverage >80%
    - [ ] Run `pnpm typecheck` — 0 errors
    - [ ] Run `pnpm lint` — 0 errors / 0 warnings
    - [ ] Run `pnpm format` — clean
    - [ ] Run `pnpm build` and check build size <500KB
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
</protect>
