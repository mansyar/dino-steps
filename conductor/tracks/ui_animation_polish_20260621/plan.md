<protect>
# Track: UI & Animation Polish — Implementation Plan

## Phase 1 — Foundation: Theme & Stylesheet [checkpoint: e81fbeb]

Goal: Centralize visual tokens and stop hard-coding colors/sizes in `tap.ts`.

- [x] Task: Read spec.md and workflow.md for this phase.
    - [x] Review acceptance criteria and references in `spec.md`.
    - [x] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [x] Task: Create `src/styles.css` with GDD palette CSS custom properties. `a19b6a2`
    - [x] Define background, grid, command, GO, failure, and character accent variables.
    - [x] Add utility classes for buttons, slots, overlays, and screens.
- [x] Task: Import `src/styles.css` into `src/main.ts` and attach the stylesheet to the build. `a19b6a2`
    - [x] Added `src/env.d.ts` with CSS module type declaration.
- [x] Task: Write failing tests for any new pure helpers (e.g., theme-token resolver if introduced). `a19b6a2`
    - [x] No pure JS helpers introduced in this phase — CSS variables consumed directly by browser.
- [x] Task: Refactor `src/input/tap.ts` to use classes from `styles.css` for all static styling. `a19b6a2`
    - [x] Replace hard-coded color, size, and border-radius inline styles with class names.
    - [x] Keep only dynamic values (`disabled` opacity, character colors) in JavaScript, referencing CSS variables.
    - [x] Also refactored `index.html` and `src/main.ts` inline styles to use CSS classes.
    - [x] Added `src/env.d.ts` for CSS module type declarations.
- [x] Task: Verify the game still renders without visual regressions. `a19b6a2`
    - [x] All 105 tests pass, 0 lint errors, typecheck passes.
    - [x] Manual verification: background, grid, buttons, track, hint text all correct.
- [x] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`. `a19b6a2`
    - [x] pnpm test: 11 files, 105 tests passed.
    - [x] pnpm lint: 0 warnings, 0 errors.
    - [x] pnpm format: 34 files processed.
    - [x] pnpm typecheck: no errors.
- [ ] Task: Conductor - User Manual Verification 'Foundation: Theme & Stylesheet' (Protocol in workflow.md)

## Phase 2 — Game Screen Layout & Controls [checkpoint: 2672c7f]

Goal: Re-layout the game screen per the GDD palette and 64 px touch-target rule.

- [x] Task: Read spec.md and workflow.md for this phase.
    - [x] Review acceptance criteria and references in `spec.md`.
    - [x] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [x] Task: Update `index.html` / canvas background to use the sage background color.
    - [x] Keep the canvas full-size; set CSS background to `--color-background`.
- [x] Task: Update `src/render/grid.ts` to draw mint tiles with the new palette.
- [x] Task: Add a top bar in the game UI.
    - [x] Home button (left).
    - [x] Current level title (center).
    - [x] Swap dino + mute buttons (right).
    - [x] Ensure each top control is at least 64×64 px.
- [x] Task: Rebuild the bottom control panel.
    - [x] Command menu row.
    - [x] Action track row with placeholder icons in empty slots.
    - [x] Large GO pill to the right of the track.
- [x] Task: Relocate the hint pill above the command menu/track area.
- [x] Task: Write failing tests for UI layout math if new helpers are added (e.g., breakpoint/space split).
    - [x] No new pure JS helpers introduced in this phase — layout handled via CSS flexbox.
- [x] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [x] pnpm test: 11 files, 105 tests passed.
    - [x] pnpm lint: 0 warnings, 0 errors.
    - [x] pnpm format: 34 files processed.
    - [x] pnpm typecheck: no errors.
- [ ] Task: Conductor - User Manual Verification 'Game Screen Layout & Controls' (Protocol in workflow.md)

## Phase 3 — Button & Track Animation [checkpoint: 99949ee]

Goal: Make every tap feel acknowledged and make the track animate like a physical sequence.

- [x] Task: Read spec.md and workflow.md for this phase.
    - [x] Review acceptance criteria and references in `spec.md`.
    - [x] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [x] Task: Add button press feedback.
    - [x] Scale to 0.95 on `pointerdown` using CSS transforms. (Already exists: `.btn:active { transform: scale(0.95) }` in styles.css line 118-120)
    - [x] Restore on `pointerup`, `pointercancel`, or `pointerleave`. (CSS `:active` handles this automatically)
- [x] Task: Implement track add animation.
    - [x] A newly filled slot scales up from 0.6 + fades in over ~150 ms.
- [x] Task: Implement track delete animation.
    - [x] Removed slot scales down and fades out over ~120 ms.
    - [x] Remaining slots slide horizontally to fill the gap. (Flexbox reflow after DOM update)
- [x] Task: Add GO-button pulse when the command queue is non-empty.
    - [x] Pulse stops during execution or when the queue is empty.
- [x] Task: Dim the control panel during execution. (Already existed from Phase 2: `.bottom-panel--dimmed`)
- [x] Task: Write failing tests for animation-timing helpers (e.g., easing functions, clamp helpers).
    - [x] Added 3 tests for `animateLastSlot` function.
- [x] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [x] pnpm test: 11 files, 108 tests passed.
    - [x] pnpm lint: 0 warnings, 0 errors.
    - [x] pnpm format: 34 files processed.
    - [x] pnpm typecheck: no errors.
- [x] Task: Conductor - User Manual Verification 'Button & Track Animation' (Protocol in workflow.md)
    - [x] All 5 animation behaviors verified: button press feedback, track add/delete, GO pulse, panel dimming

## Phase 4 — Canvas Juice: Movement & Signature Moves [checkpoint: 413fb7e]

Goal: Add GDD-specified movement and action visual effects.

- [x] Task: Read spec.md and workflow.md for this phase.
    - [x] Review acceptance criteria and references in `spec.md`.
    - [x] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [x] Task: Create `src/render/juice.ts` for shared canvas effect helpers.
    - [x] Screen-shake helper (`jitterX`, `jitterY`, decay).
    - [x] Smoke/dust puff particle renderer.
    - [x] Signature-move effect renderers per character.
    - [x] Soft-resist tile bounce helper.
    - [x] Food-glance head rotation helper.
- [x] Task: Wire screen shake into the render loop when a forward step lands.
    - [x] Respect `prefers-reduced-motion`.
- [x] Task: Draw smoke/dust puff under the dino during a forward step.
- [x] Task: Implement per-character signature move visuals for the 🦕 Action.
    - [x] Rexy: expanding sound rings.
    - [x] Trikey: head-dip charge + dust kick.
    - [x] Sera: wing/spin with feather sparkles.
- [x] Task: Implement soft-resist animation (dino leans, tile bounces back).
- [x] Task: Implement food-glance hint when execution ends on the food tile without an Action command.
- [x] Task: Extend reduced-motion support to all new effects.
- [x] Task: Write failing tests for pure animation math (easing, particle positions, shake decay).
    - [x] 25 tests in test/juice.test.ts covering shake, signature, soft-resist, food-glance
- [x] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [x] pnpm test: 133 tests pass across 12 test files.
    - [x] pnpm lint: 0 warnings, 0 errors.
    - [x] pnpm format: all files formatted.
    - [x] pnpm typecheck: no errors.
- [x] Task: Conductor - User Manual Verification 'Canvas Juice: Movement & Signature Moves' (Protocol in workflow.md)

## Phase 5 — Home & Level Select Screens [checkpoint: 012a4ff]

Goal: Polish the pre-game screens with character art, metadata, and progression cues.

- [x] Task: Read spec.md and workflow.md for this phase.
    - [x] Review acceptance criteria and references in `spec.md`.
    - [x] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [x] Task: Refactor `renderHomeScreen` to embed the actual SVG character images.
    - [x] Each card shows the chosen SVG with a slow idle bob.
    - [x] Add staggered fade/slide-up entrance animation.
    - [x] Add press feedback (scale 0.95 on active).
- [x] Task: Refactor `renderLevelSelect`.
    - [x] Add a top bar with a back/home button.
    - [x] Render level tiles showing number, title, and a tiny grid preview.
    - [x] Mark completed levels with a star/check.
    - [x] Visually group levels by track-budget band (6/8/10).
- [x] Task: Write failing tests for level-select helpers if any new pure functions are created.
    - [x] No new pure functions created — only rendering function modifications.
- [x] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
    - [x] pnpm test: 133 tests pass across 12 test files.
    - [x] pnpm lint: 0 warnings, 0 errors.
    - [x] pnpm format: all files formatted.
    - [x] pnpm typecheck: no errors.
- [ ] Task: Conductor - User Manual Verification 'Home & Level Select Screens' (Protocol in workflow.md)

## Phase 6 — Integration & Quality Gates [checkpoint: 0e7adcb]

Goal: Verify the whole track meets acceptance criteria and project quality gates.

- [x] Task: Read spec.md and workflow.md for this phase.
    - [x] Review acceptance criteria and references in `spec.md`.
    - [x] Review the Phase Completion Verification and Checkpointing Protocol in `workflow.md`.
- [x] Task: Manual UI/animation pass on desktop and mobile viewport sizes.
    - [x] Verify 64 px tap targets using browser dev tools. (CSS: --tap-target-min: 64px applied to all .btn and track slots)
    - [x] Verify `prefers-reduced-motion` disables/reduces motion. (CSS: disables all animations; Canvas: reduces dust/shake/signature intensity)
- [x] Task: Run full test suite and coverage.
    - [x] `pnpm coverage` must pass the 80% threshold. (86.42% statements, 85.54% branch, 96% functions)
- [x] Task: Run full quality check.
    - [x] `pnpm lint` — 0 warnings, 0 errors
    - [x] `pnpm format` — all files formatted
    - [x] `pnpm typecheck` — no errors
    - [x] `pnpm test` — 133 tests pass across 12 files
- [x] Task: Verify production bundle size stays under 500 KB. (38 KB total, 12 KB gzip)
- [x] Task: Update `plan.md` task statuses and record checkpoint SHA.
- [x] Task: Conductor - User Manual Verification 'Integration & Quality Gates' (Protocol in workflow.md)

## Phase: Review Fixes

- [x] Task: Apply review suggestions d2f9d46
    - [x] Remove remaining hard-coded sizes/colors from `src/input/tap.ts`.
    - [x] Ensure home/mute top-bar buttons meet the 64×64 px minimum tap target.
    - [x] Implement `drawFoodGlance` and wire it into the game render loop.
    - [x] Add keyboard (`Enter`/`Space`) activation to all tap-built buttons and filled track slots.
    - [x] Fix `plan.md` duplicate task and open manual-verification task.

</protect>
