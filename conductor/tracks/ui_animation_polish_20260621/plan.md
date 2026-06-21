# Track: UI & Animation Polish — Implementation Plan

## Phase 1 — Foundation: Theme & Stylesheet

Goal: Centralize visual tokens and stop hard-coding colors/sizes in `tap.ts`.

- [ ] Task: Create `src/styles.css` with GDD palette CSS custom properties.
    - [ ] Define background, grid, command, GO, failure, and character accent variables.
    - [ ] Add utility classes for buttons, slots, overlays, and screens.
- [ ] Task: Import `src/styles.css` into `src/main.ts` and attach the stylesheet to the build.
- [ ] Task: Write failing tests for any new pure helpers (e.g., theme-token resolver if introduced).
- [ ] Task: Refactor `src/input/tap.ts` to use classes from `styles.css` for all static styling.
    - [ ] Replace hard-coded color, size, and border-radius inline styles with class names.
    - [ ] Keep only dynamic values (`disabled` opacity, character colors) in JavaScript, referencing CSS variables.
- [ ] Task: Verify the game still renders without visual regressions.
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
- [ ] Task: Conductor - User Manual Verification 'Foundation: Theme & Stylesheet' (Protocol in workflow.md)

## Phase 2 — Game Screen Layout & Controls

Goal: Re-layout the game screen per the GDD palette and 64 px touch-target rule.

- [ ] Task: Update `index.html` / canvas background to use the sage background color.
    - [ ] Keep the canvas full-size; set CSS background to `--color-background`.
- [ ] Task: Update `src/render/grid.ts` to draw mint tiles with the new palette.
- [ ] Task: Add a top bar in the game UI.
    - [ ] Home button (left).
    - [ ] Current level title (center).
    - [ ] Swap dino + mute buttons (right).
    - [ ] Ensure each top control is at least 64×64 px.
- [ ] Task: Rebuild the bottom control panel.
    - [ ] Command menu row.
    - [ ] Action track row with placeholder icons in empty slots.
    - [ ] Large GO pill to the right of the track.
- [ ] Task: Relocate the hint pill above the command menu/track area.
- [ ] Task: Write failing tests for UI layout math if new helpers are added (e.g., breakpoint/space split).
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
- [ ] Task: Conductor - User Manual Verification 'Game Screen Layout & Controls' (Protocol in workflow.md)

## Phase 3 — Button & Track Animation

Goal: Make every tap feel acknowledged and make the track animate like a physical sequence.

- [ ] Task: Add button press feedback.
    - [ ] Scale to 0.95 on `pointerdown` using CSS transforms.
    - [ ] Restore on `pointerup`, `pointercancel`, or `pointerleave`.
- [ ] Task: Implement track add animation.
    - [ ] A newly filled slot scales up from 0.6 + fades in over ~150 ms.
- [ ] Task: Implement track delete animation.
    - [ ] Removed slot scales down and fades out over ~120 ms.
    - [ ] Remaining slots slide horizontally to fill the gap.
- [ ] Task: Add GO-button pulse when the command queue is non-empty.
    - [ ] Pulse stops during execution or when the queue is empty.
- [ ] Task: Dim the control panel during execution.
- [ ] Task: Write failing tests for animation-timing helpers (e.g., easing functions, clamp helpers).
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
- [ ] Task: Conductor - User Manual Verification 'Button & Track Animation' (Protocol in workflow.md)

## Phase 4 — Canvas Juice: Movement & Signature Moves

Goal: Add GDD-specified movement and action visual effects.

- [ ] Task: Create `src/render/juice.ts` for shared canvas effect helpers.
    - [ ] Screen-shake helper (`jitterX`, `jitterY`, decay).
    - [ ] Smoke/dust puff particle renderer.
    - [ ] Signature-move effect renderers per character.
    - [ ] Soft-resist tile bounce helper.
    - [ ] Food-glance head rotation helper.
- [ ] Task: Wire screen shake into the render loop when a forward step lands.
    - [ ] Respect `prefers-reduced-motion`.
- [ ] Task: Draw smoke/dust puff under the dino during a forward step.
- [ ] Task: Implement per-character signature move visuals for the 🦕 Action.
    - [ ] Rexy: expanding sound rings.
    - [ ] Trikey: head-dip charge + dust kick.
    - [ ] Sera: wing/spin with feather sparkles.
- [ ] Task: Implement soft-resist animation (dino leans, tile bounces back).
- [ ] Task: Implement food-glance hint when execution ends on the food tile without an Action command.
- [ ] Task: Extend reduced-motion support to all new effects.
- [ ] Task: Write failing tests for pure animation math (easing, particle positions, shake decay).
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
- [ ] Task: Conductor - User Manual Verification 'Canvas Juice: Movement & Signature Moves' (Protocol in workflow.md)

## Phase 5 — Home & Level Select Screens

Goal: Polish the pre-game screens with character art, metadata, and progression cues.

- [ ] Task: Refactor `renderHomeScreen` to embed the actual SVG character images.
    - [ ] Each card shows the chosen SVG with a slow idle bob.
    - [ ] Add staggered fade/slide-up entrance animation.
    - [ ] Add press feedback (scale 0.95 on active).
- [ ] Task: Refactor `renderLevelSelect`.
    - [ ] Add a top bar with a back/home button.
    - [ ] Render level tiles showing number, title, and a tiny grid preview.
    - [ ] Mark completed levels with a star/check.
    - [ ] Visually group levels by track-budget band (6/8/10).
- [ ] Task: Write failing tests for level-select helpers if any new pure functions are created.
- [ ] Task: Run `pnpm test`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.
- [ ] Task: Conductor - User Manual Verification 'Home & Level Select Screens' (Protocol in workflow.md)

## Phase 6 — Integration & Quality Gates

Goal: Verify the whole track meets acceptance criteria and project quality gates.

- [ ] Task: Manual UI/animation pass on desktop and mobile viewport sizes.
    - [ ] Verify 64 px tap targets using browser dev tools.
    - [ ] Verify `prefers-reduced-motion` disables/reduces motion.
- [ ] Task: Run full test suite and coverage.
    - [ ] `pnpm coverage` must pass the 80% threshold.
- [ ] Task: Run full quality check.
    - [ ] `pnpm lint`
    - [ ] `pnpm format`
    - [ ] `pnpm typecheck`
    - [ ] `pnpm test`
- [ ] Task: Verify production bundle size stays under 500 KB.
- [ ] Task: Update `plan.md` task statuses and record checkpoint SHA.
- [ ] Task: Conductor - User Manual Verification 'Integration & Quality Gates' (Protocol in workflow.md)
