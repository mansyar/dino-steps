# DinoSteps — Product Guidelines

## 1. Tone & Prose Style

**Audience for written artifacts:** Developers, contributors, and future maintainers. The game itself is text-free; these guidelines govern documentation, code comments, commit messages, and any contributor-facing prose.

- **Voice:** Warm, clear, and encouraging — mirrors the game's joyful, child-friendly ethos without being patronizing.
- **Clarity over cleverness.** Prefer the plain, precise term. Avoid jargon when a common word works.
- **Active voice, present tense** for describing behavior (e.g., "The dino steps forward," not "A step is taken by the dino").
- **Short sentences.** One idea per sentence. Pre-readers' guardians skim docs on phones between tasks.
- **Inclusive & age-respecting.** Never refer to children as "users" in product docs; use "children," "players," or "kids." Reserve "users" for technical/developer contexts.
- **Embrace delight in moderation.** A touch of playfulness (e.g., "nom-nom" in spec prose) is welcome where it aids memory; do not force whimsy into technical descriptions.

## 2. Branding & Visual Identity

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary (Interface Trim) | Deep Toddler Blue | `#0b57d0` |
| Secondary (Grid Tiles) | Mint / Soft Jungle Green | `#c4eed0` |
| Background (Jungle Terrain) | Light Soft Sage | `#f3f8f6` |
| Button Normal (Commands) | Warm Clay Gray | `#e2ece9` |
| Go Button (Play Sequence) | Juicy Play Green | `#34a853` |
| Dizzy Pop (Failure FX) | Pastel Coral Red | `#ff8a80` |

**Confetti theme:** `#f4b400` (Yellow), `#db4437` (Red), `#4285f4` (Blue), `#0f9d58` (Green)

### Branding Principles

- **Soft, rounded, friendly.** No sharp corners on UI elements; generous border-radius evokes safety for young children.
- **High-contrast, never harsh.** Pastels on light backgrounds; ensure WCAG AA contrast for any text (rare in-game, common in docs/settings).
- **Color is never the sole signal.** Every state distinction pairs color with a distinct shape, icon, or animation (per GDD §11.2).
- **Consistent emoji vocabulary.** 🐾 Forward, ↩️ Left, ↪️ Right, 🦕 Action — use these exact glyphs everywhere they appear (UI, docs, specs).

## 3. UX Principles

These principles govern all interactive design decisions. They derive directly from the GDD's preschool context.

1. **Tap, don't drag.** Fine-motor control is still developing in ages 3–5. Every interaction is a single tap on a ≥64px target. No drag-and-drop, no press-and-hold, no multi-finger gestures.
2. **No failure shame.** Every "wrong" action produces a delightful response (signature animation, gentle audio). Hard failures teleport with a comical bonk; soft resists nudge without punishing. Never show error pop-ups, red screens, or score dockets.
3. **Experimentation is rewarded.** The contextual 🦕 action always does *something* fun, even as a no-op. The game never says "you can't do that."
4. **Progressive, visible growth.** The track physically grows (6→8→10) as difficulty rises. Children feel progress spatially, not numerically.
5. **No reading required.** The entire game is playable without literacy. Any text (e.g., level titles in docs) is for adults, not children.
6. **Instant response.** Touch latency <100ms. Every tap must feel immediately acknowledged (visual or audio).
7. **Forgiving by default.** Swap characters freely during editing; progress persists across sessions; a "reset progress" option exists but is never forced.
8. **Calm, not overstimulating.** Animation stays under 3Hz to protect photosensitive players. `prefers-reduced-motion` reduces shake, confetti, and spin speed.

## 4. Accessibility Principles

- **Tap targets:** minimum 64×64px (above Apple HIG's 44pt), sized for preschool fine-motor control.
- **Multi-cue states:** every state distinction pairs color with shape/icon/animation. Never color-alone.
- **Color-blind safe:** verify green/coral pairing (GO vs. failure) for deuteranopia/protanopia. Flag for final palette audit during implementation.
- **Audio cues for all state changes:** stomp, bonk, chime, signature SFX. Supports visually impaired players.
- **No strobing >3Hz:** dizzy ring is a slow spin; confetti is falling particles. Enforce the cap.
- **Respect `prefers-reduced-motion`:** reduce screen-shake amplitude, confetti count, dizzy-spin speed.
- **No reliance on sound alone:** every audio cue has a visual counterpart (the game is visual-first by design).

## 5. Code & Documentation Conventions

- **Code comments:** explain *why*, not *what*. The code shows what it does; comments justify decisions, especially where the GDD locked a non-obvious choice (e.g., "integer vectors, no trig — avoids y-up/y-down convention ambiguity, per GDD §4.2").
- **Naming:** match GDD vocabulary exactly. `commandQueue`, `activeCommandIndex`, `clearedInteractables`, `trackBudget`, `dinoPos`, `dinoFacing` — use these field names verbatim from GDD §9.2.
- **Command keys:** single letters (`F`/`L`/`R`/`A`) in data/code; emoji (🐾/↩️/↪️/🦕) only at render time (GDD §9.3).
- **Coordinate convention:** y-down screen-space, `(0,0)` top-left. Never flip. Document this at the top of any coordinate-handling module.
- **Commit messages:** conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Reference GDD sections where relevant (e.g., `feat: implement two-tier failure model (GDD §8)`).
- **Docs tone:** match §1 (warm, clear, active voice). Reference the GDD as the single source of truth for design decisions.

## 6. Performance Ethos

- **Small is delightful.** Target <500KB total payload. Every byte is a longer wait for a child on a hand-me-down tablet.
- **No external runtime dependencies for assets.** Vector drawing, inline SVG, synthesized audio. The bundle is fully self-contained.
- **60fps is the contract.** Graceful degradation to 30fps is acceptable; below that is a bug.
- **Measure, don't guess.** Profile on the device floor (iPad 5th gen / iPhone 8 / Galaxy Tab A), not just a dev laptop.
