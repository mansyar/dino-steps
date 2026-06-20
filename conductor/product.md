# Initial Concept

Build the full DinoSteps web game as specified in the locked Game Design Document (`docs/GDD.md`). DinoSteps is a text-free web game that introduces sequencing, spatial awareness, and programmatic thinking to preschool/kindergarten children (ages 3–5). Players choose one of three cute dinosaur friends and help them reach prehistoric treats on a 5×3 grid by tapping oversized action icons to assemble a sequence on a horizontal track, then pressing a big green GO button to execute.

The full scope includes all 10 BFS-verified levels, 3 cosmetic characters (Rexy, Trikey, Sera), the contextual 🦕 action mechanic, two-tier failure model, tap-to-code input, variable track limits (6/8/10), localStorage persistence, Web Audio API synthesized sound effects, and procedural Canvas2D vector rendering — all built on Canvas2D + TypeScript + Vite.

---

# DinoSteps — Product Guide

## Project Overview

DinoSteps is a delightful, text-free web game that introduces sequencing, spatial awareness, and programmatic thinking to children before they can read. Players choose one of three cute dinosaur friends and help them reach delicious prehistoric treats on a 5×3 grid map by tapping oversized action icons to assemble a sequence on a horizontal "track," then pressing the big green GO button to watch their code come to life.

- **Project Name:** DinoSteps
- **Genre:** Toddler-First Visual Coding / Puzzle
- **Platform:** Web-Based (Mobile Safari, Chrome, Tablet Browsers)
- **Business Model:** 100% Free (No ads, no paywalls, open educational resource)

## Target Audience

- **Primary:** Preschool / Kindergarten children, ages 3–5
- **Secondary:** Parents, educators, and caregivers seeking screen-time that is genuinely educational
- **Context of use:** Tablets and phones in preschool households; common hand-me-down devices (iPad 5th gen, iPhone 8, Galaxy Tab A)

## Core Value Proposition

A coding-readiness game that is **usable before literacy**. By replacing drag-and-drop (which frustrates under-4s due to developing fine-motor control) with tap-to-append input, and by removing all text and failure shame, DinoSteps makes programmatic thinking accessible to the youngest learners. Every interaction — even a "wrong" press — produces a delightful response, encouraging playful experimentation.

## Key Features

1. **Tap-to-Code Input** — Tap action icons to append commands to a sequence track; tap placed blocks to delete them. No drag-and-drop.
2. **Four Command Blocks** — 🐾 Forward, ↩️ Left, ↪️ Right, 🦕 Action (contextual).
3. **Contextual 🦕 Action** — Eats food (win), clears interactables (turtle/grass), or performs a signature idle animation (no-op). Every press does something fun; nothing is punished.
4. **10 BFS-Verified Levels** — A progressive difficulty curve teaching linear sequencing, turns, obstacle awareness, multi-turn paths, U-turns, interactables, and compound sequencing.
5. **Variable Track Limits** — Track grows from 6 → 8 → 10 slots across level bands, signaling progression as a visible reward.
6. **Three Cosmetic Characters** — Rexy (T-Rex), Trikey (Triceratops), Sera (Pterodactyl). Identical mechanics; different signature animations and audio. Swap is edit-time only.
7. **Two-Tier Failure Model** — Hard failure (teleport to start) for obstacle/boundary collisions; soft resist (stay on tile) for forgotten 🦕 on interactables. No pop-ups, no error screens.
8. **Procedural Audio** — Web Audio API synthesizes all SFX on the fly (stomp, bonk, success chime, signature moves). Zero audio files.
9. **Vector-Only Rendering** — Procedural Canvas2D vector drawing for characters/animations; inline SVG for static tiles. Infinitely scalable, tiny payload.
10. **Local Persistence** — 3 localStorage keys (unlocked level, chosen character, mute). No accounts, no telemetry, no cross-device sync.
11. **Accessibility-First** — 64px tap targets, multi-cue state distinctions (never color alone), <3Hz animation cap, `prefers-reduced-motion` support.

## Game Mechanics Summary

- **Grid:** 5×3, y-down screen-space as authored. `(0,0)` = top-left, `(4,2)` = bottom-right.
- **Movement:** Integer direction vectors `(dx, dy)` — no trigonometry. Forward adds the vector; turns rotate 90° in place.
- **Win Condition:** `🦕` on the food tile (explicit eat). Stepping on food does not auto-win — teaches precision.
- **Interactables:** Sleeping turtle and dense grass block exit until cleared by 🦕. Clearing plays the character's signature move.
- **Execution:** Turn-based command queue processing triggered by GO. Smoothstep interpolation for rendering only; game state stays integer.

## Technical Approach

- **Render:** HTML5 Canvas2D context + `requestAnimationFrame` loop
- **Language:** TypeScript (type-safe command union `'F'|'L'|'R'|'A'`, direction vectors, level schema)
- **Build:** Vite (hot-reload dev server, simple production build)
- **Tweening:** Hand-rolled ~50-line smoothstep utility
- **State:** Runtime `game` (per-level, ephemeral) split from `persisted` (cross-session, mirrors localStorage)
- **Levels:** JSON loaded from `/data/levels.json`, consumable by both runtime and BFS validator
- **Assets:** Zero external files — vector drawing + inline SVG + synthesized audio

## Success Criteria

- All 10 levels playable end-to-end with BFS-verified solutions
- 60fps target (graceful degradation to 30fps) on device floor (iPad 5th gen / iPhone 8 / Galaxy Tab A)
- Total payload < 500KB
- Touch latency < 100ms (perceived instant)
- Load time < 2s on 4G mobile
- Passes accessibility audit: 64px targets, no color-alone cues, <3Hz, reduced-motion respected
- No external asset dependencies (fully self-contained bundle)

## Constraints & Non-Goals

- **No Phaser/framework** — raw Canvas2D only (Phaser's strengths all unused by this design)
- **No raster spritesheets / Spine / Lottie** — vector-only
- **No accounts or telemetry** — pre-readers can't log in; child privacy is paramount
- **No cross-device sync** — out of scope for a free educational resource
- **No in-app purchases or ads** — 100% free, open educational resource
- **No reading required** — the game is fully usable by pre-literate children
