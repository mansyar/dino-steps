# Track: UI & Animation Polish

## Overview

Refactor DinoSteps' user interface and animation layer so the game matches the locked visual identity and "juice" specifications in the Game Design Document (GDD). The current game screen uses a dark navy background and small, inline-styled controls that drift from the intended toddler-friendly palette; the home/level-select screens are minimal; and several GDD-mandated animations (screen shake, smoke puffs, signature moves) are absent.

This track delivers:

1. A centralized stylesheet and theme-token system.
2. A redesigned game screen that follows the GDD palette and layout.
3. Consistent button press feedback and command-track animations.
4. Polished home and level-select screens with character previews and progression cues.
5. Additional animation juice for movement, hard failures, and character-specific signature actions.

## Type

Feature

## Motivation

- The current dark navy background (`#1a1a2e`) conflicts with the GDD's light jungle-sage palette (`#f3f8f6`).
- Inline styles in `src/input/tap.ts` and `src/main.ts` make palette tweaks and animation timing painful and error-prone.
- Command buttons and the GO button do not read as a single "build then run" workflow; the GO button is too small and positioned away from the track.
- Track slots provide almost no feedback when commands are added or removed, weakening the core tap-to-code learning loop.
- Missing juice (screen shake, smoke puffs, signature moves) makes execution feel flat compared to the GDD specification.

## Goals

1. Extract UI styling into a project stylesheet with CSS variables mapped to the GDD palette.
2. Bring the game-screen colors, spacing, and control sizes in line with the GDD and product guidelines.
3. Make every tap feel acknowledged with press feedback and sound.
4. Animate command-track additions and deletions so children see cause and effect.
5. Improve the home and level-select screens with actual character art, level metadata, and clear navigation.
6. Add movement and signature-action animations required by the GDD.

## Functional Requirements

### FR1 — Theme & Stylesheet

- Create `src/styles.css` and import it in `src/main.ts`.
- Define CSS custom properties for every color in the GDD §10.2 / product guidelines palette:
  - `--color-primary: #0b57d0`
  - `--color-secondary: #c4eed0`
  - `--color-background: #f3f8f6`
  - `--color-button: #e2ece9`
  - `--color-go: #34a853`
  - `--color-dizzy: #ff8a80`
  - Character accent colors as `--color-rexy`, `--color-trikey`, `--color-sera`.
- Replace inline style assignments in `src/input/tap.ts` with class assignments where possible. Dynamic values (character colors, disabled state) may still be set from JavaScript, but should reference the CSS variables.
- Keep the global reset in `index.html`; do not duplicate it in the stylesheet.

### FR2 — Game Screen Layout

- Change the game canvas/CSS background to the jungle-sage background color.
- Draw grid tiles with the mint secondary color and a soft border.
- Render a top bar with:
  - Home button (left).
  - Current level number and title (center).
  - Character swap and mute buttons (right).
- Ensure all top-bar icons are at least 64×64 px.
- Move the command menu, action track, and GO button into a bottom control panel.
- Place the GO button immediately to the right of the track as a large, green, rounded pill.
- Move the "Feed <Character>!" hint pill directly above the track, near the command menu.

### FR3 — Command Buttons & Track

- Command buttons must be at least 64×64 px with a bold icon, a colored border matching the command, and a subtle press state.
- Empty track slots should show a faint placeholder icon (e.g., a light-gray number or dotted outline) so children know where the next command will land.
- Filled track slots must match the command color scheme and remain tappable for deletion.
- When execution is active, disable command/track interactions and dim the control panel.

### FR4 — Animations & Feedback

- Button press feedback: on `pointerdown`, scale the element to 0.95; restore on `pointerup`/`pointerleave`.
- Track add animation: a newly filled slot should scale up from 0.6 + fade in over ~150 ms.
- Track delete animation: a removed slot should scale down + fade out over ~120 ms while the remaining slots slide to fill the gap.
- GO button: pulse gently when a valid sequence exists but execution has not started.
- Stomp juice: when the dino completes a forward step, shake the canvas 2–4 px for ~80 ms and draw a small dust/smoke puff under the moving foot.
- Signature moves: when the contextual 🦕 Action executes, play a character-specific visual effect:
  - **Rexy:** expanding sound rings from the dino.
  - **Trikey:** a short forward head dip with a dust kick.
  - **Sera:** a wing flap/spin with two colored feather sparkles.
- Soft-resist animation: on trying to leave an uncleared interactable, the dino leans forward and the tile bounces back once.
- Food-glance hint: when execution ends on the food tile without an `A` command, the dino briefly turns its head toward the food before idling.

### FR5 — Home Screen

- Render the actual SVG character art inside each choice card instead of an emoji.
- Add a subtle idle bob loop on the character preview.
- Animate the cards in with a staggered fade/slide-up on first display.
- Add a hover/active press scale effect.

### FR6 — Level Select Screen

- Display a back/home button in the top bar.
- Show each level as a tile with number, title, and a tiny grid-preview silhouette.
- Mark completed levels with a star or check.
- Visually group levels by track-budget band (6/8/10) using slot-count headers or badges.

### FR7 — Accessibility

- Keep tap targets at or above 64×64 px.
- Ensure all buttons have `aria-label`.
- Honor `prefers-reduced-motion`:
  - Disable screen shake.
  - Reduce confetti count and dizzy-ring spin speed (already partially implemented; extend to smoke puffs and signature-move particles).
  - Replace slide/scale transitions with simple fade or no animation.

## Non-Functional Requirements

### NFR1 — Performance

- No new runtime dependencies.
- Animations must run at 60 fps on the device floor (iPad 5th gen / iPhone 8 / Galaxy Tab A).
- Use `requestAnimationFrame` already in place; do not add setInterval animations.

### NFR2 — Payload

- New CSS file and SVG usage must keep the total production bundle under the 500 KB budget.

### NFR3 — Maintainability

- All new canvas animation routines must be placed in dedicated render modules under `src/render/` (e.g., `src/render/juice.ts` for shake/smoke/signature effects).
- UI creation functions remain in `src/input/tap.ts` or move to `src/ui/` only if that refactor is part of a later task.

## Acceptance Criteria

- [ ] `src/styles.css` exists and contains GDD palette variables.
- [ ] `src/input/tap.ts` no longer hard-codes colors or sizes; it references CSS classes/variables.
- [ ] Game screen displays the sage background, mint grid tiles, and a bottom control panel.
- [ ] Command buttons, GO button, swap, mute, and home buttons are all at least 64×64 px.
- [ ] Tapping a command button produces a visible press feedback animation.
- [ ] Adding or removing a command from the track triggers a slide/scale animation.
- [ ] The GO button pulses when a non-empty, valid command sequence is present.
- [ ] Forward steps produce a short screen shake and a smoke/dust puff (unless reduced motion is enabled).
- [ ] The contextual 🦕 Action shows a distinct visual effect per character.
- [ ] Home screen cards display the actual SVG character preview and animate in.
- [ ] Level select shows level numbers, titles, completion marks, and a back button.
- [ ] All existing tests pass and new tests cover any pure helper logic introduced (e.g., animation timing, layout math).
- [ ] `pnpm lint`, `pnpm format`, `pnpm typecheck`, and `pnpm test` all pass.

## Out of Scope

- New levels or changes to level data.
- New game mechanics beyond the GDD-mandated ones already implemented.
- Full screen transitions (page wipes) between home/level/game.
- Rewriting the canvas engine to use a rendering framework.
- Adding raster images, Spine, Lottie, or any external animation library.

## References

- `docs/GDD.md` §7 (UI & UX), §8 (Failure & Success), §10.2 (Theme Colors), §11.1 (Asset Pipeline), §11.2 (Accessibility)
- `conductor/product-guidelines.md` §2 (Branding & Visual Identity), §3 (UX Principles), §4 (Accessibility Principles)
- `conductor/tech-stack.md` — Canvas2D, TypeScript, Vite, zero runtime dependencies
