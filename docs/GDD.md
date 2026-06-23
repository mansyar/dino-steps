# DinoSteps — Game Design Document (Living)

> **Document Status:** Living document — evolves with discussion.
> Sections are marked with status badges:
> - `[LOCKED]` — decision made, safe to implement against
> - `[DISCUSSING]` — actively under discussion
> - `[PENDING]` — not yet explored, awaiting deep-dive
>
> **Last updated:** Docker & Docker Compose Deployment track complete. Production-ready containerized deployment with brotli compression, SPA fallback, and security headers; image size 39.7 MB. **See §14.7 for implementation status.**

---

## 0. Decision Status Overview

| Area | Status | Notes |
|------|--------|-------|
| Core game loop | `[LOCKED]` | From first draft |
| Character profiles | `[LOCKED]` | Cosmetic + audio only (see §2) |
| Grid system (5×3) | `[LOCKED]` | From first draft |
| Tap-to-code input | `[LOCKED]` | From first draft |
| Command blocks | `[LOCKED]` | 4 commands |
| Special Action (🦕) behavior | `[LOCKED]` | Tier 2 — contextual rules (§3.4) |
| Goal detection logic | `[LOCKED]` | Tier 2 — 🦕-to-eat required (§3.5) |
| Character swap semantics | `[LOCKED]` | Tier 2 — edit-time only (§3.6) |
| Movement & coordinate model | `[LOCKED]` | Tier 1 — direction vectors |
| Track-limit policy | `[LOCKED]` | Tier 1 — variable 6/8/10 |
| Level matrix (10 levels) | `[LOCKED]` | Tier 1 — BFS-verified |
| UI & UX layout | `[LOCKED]` | From first draft |
| Failure & success states | `[LOCKED]` | Tier 2 — two-tier failure model (§8) |
| Engine choice | `[LOCKED]` | Tier 3 — Canvas2D + TS + Vite (§9.1) |
| State tree architecture | `[LOCKED]` | Tier 3 — runtime/persisted split (§9.2) |
| Level data format | `[LOCKED]` | Tier 3 — JSON schema (§9.3) |
| State persistence | `[LOCKED]` | Tier 3 — 3 localStorage keys (§9.4) |
| Execution loop | `[LOCKED]` | Tier 2 — all TBDs resolved (§9.5) |
| Asset pipeline | `[LOCKED]` | Tier 4 — vector-only (§11.1) |
| Accessibility | `[LOCKED]` | Tier 4 — 64px targets + cues (§11.2) |
| Performance budget | `[LOCKED]` | Tier 4 — 60fps / <500KB (§11.3) |
| Playtesting plan | `[LOCKED]` | Tier 4 — observation-based (§11.4) |

---

## 1. Executive Summary

DinoSteps is a delightful, text-free web game that introduces sequencing, spatial awareness, and programmatic thinking to children before they can read.

Players choose one of three cute dinosaur friends and help them reach delicious prehistoric treats on a grid map. Instead of dragging complex blocks, the child taps oversized action icons to assemble a sequence on a horizontal "track" and presses the big green "GO!" button to watch their code come to life.

- **Project Name:** DinoSteps
- **Target Audience:** Preschool / Kindergarten (Ages 3–5)
- **Genre:** Toddler-First Visual Coding / Puzzle
- **Platform:** Web-Based (Mobile Safari, Chrome, Tablet Browsers)
- **Business Model:** 100% Free (No ads, no paywalls, open educational resource)

### The Core Game Loop

```
1. Choose Character
       │
       ▼
2. View Grid & Snack
       │
       ▼
3. Tap Action Icons to Build Sequence
       │
       ▼
4. Press Green GO Button
       │
       ▼
   ┌─────────────┴─────────────┐
   ▼                           ▼
Dino Reaches Food?     Dino Collides / Misses
   │                           │
   ▼                           ▼
 5. Confetti + Nom-Nom    7. Dizzy Anim + Boing SFX
   │                           │
   ▼                           ▼
 6. Auto-Advance Next Lvl  Teleport to Start → back to 3
```

---

## 2. Character Profiles `[LOCKED]`

Giving children a choice of characters immediately increases engagement and ownership. At the start of the game (or from a simple pause screen), players can choose between three highly animated baby dinosaurs.

> **Design decision (Tier 1):** All three characters have **identical movement mechanics**. The signature move (roar / charge / spin) all map to the same `🦕` contextual action. Character choice is **purely cosmetic + audio** — no per-character gameplay branches. This is intentional for the age group.

### A. "Rexy" the T-Rex (The Classic Stomper)
- **Personality:** Loud, enthusiastic, slightly clumsy.
- **Visual Style:** Bright green, tiny arms, big happy eyes.
- **Signature Move:** A massive, screen-shaking roar that creates visible sound rings.
- **Audio:** Heavy THUD-THUD footsteps, squeaky growls.

### B. "Trikey" the Triceratops (The Charging Bulldozer)
- **Personality:** Playful, determined, stubborn.
- **Visual Style:** Light blue, cute round horns, wears a playful yellow leaf as a bib.
- **Signature Move:** A joyful, low-head dash forward that can shove light obstacles out of the way.
- **Audio:** Scuffling, playful snorts, horn-clicking sounds.

### C. "Sera" the Pterodactyl (The Gentle Hoverer)
- **Personality:** Graceful, curious, easily distracted by butterflies.
- **Visual Style:** Lavender pink, adorable wings, hops on two feet.
- **Signature Move:** A brief hover spin that sends colorful feathers or sparkles into the air.
- **Audio:** Flapping wing sounds (woosh), high-pitched cheerful chirps.

---

## 3. Gameplay & Mechanics

### 3.1 Grid System `[LOCKED]`

- Every level is a **5×3 grid** (x: 0–4, y: 0–2).
- Coordinate space: `(0,0)` = top-left tile, `(4,2)` = bottom-right tile. **y increases downward** (screen-space).
- **Impassable Tiles:** Dense jungle foliage (rock), deep mud pits, bubbling tar geysers.
- **Goal Tile:** A giant glowing berry, a delicious prehistoric leaf, or a golden dino-cookie.
- **Interactable Tiles:** Sleeping turtle, dense grass — enterable tiles that block forward movement *out* until cleared by the `🦕` action. (See §3.4.)

### 3.2 Tap-To-Code Input `[LOCKED]`

Standard drag-and-drop mechanics cause high frustration in children under 4 due to developing fine-motor control.

- **Tap-to-Append:** Tapping any button in the Action Menu at the bottom of the screen immediately duplicates that action and slides it into the next empty slot on the Action Track.
- **Tap-to-Delete:** Tapping an action block already inside the track deletes it with a comical pop animation, and all subsequent blocks slide over to fill the empty slot.
- **Track Limit:** Variable — see §6.

### 3.3 Command Blocks `[LOCKED]`

| Icon | Name | Behavior |
|------|------|----------|
| 🐾 Forward | Move 1 tile in the facing direction. |
| ↩️ Left | Rotate 90° counter-clockwise in place (no move). |
| ↪️ Right | Rotate 90° clockwise in place (no move). |
| 🦕 Action | Performs the contextual action — see §3.4. |

### 3.4 Special Action (🦕) Behavior `[LOCKED]`

> **Tier 2 decision.** The `🦕` action is **contextual** — its effect depends on what is under the dinosaur. A "wrong" `🦕` press becomes a delightful moment, not a failure.

| `🦕` context | Effect | Advances index? | Visual / Audio |
|--------------|--------|------------------|----------------|
| On food tile | **Eat → win → advance level** (remaining queue discarded) | Yes (terminal) | Backflip + confetti + nom-nom + success chime |
| On uncleared interactable (turtle/grass) | **Clear it** (turtle wakes, grass chomped) | Yes | Character signature move (roar/charge/spin) + tile-clear anim + signature SFX |
| On cleared interactable *or* empty tile | **No-op** — perform signature idle move, no gameplay effect | Yes | Signature animation (Rexy roars, etc.) + gentle audio |

**Design principles:**
1. **Every `🦕` advances the command index** — uniform execution model, no special-casing.
2. **The context is automatic** — the child does not need to "understand" what `🦕` will do; pressing it always does *something* fun (signature animation at minimum). Pre-readers learn by experimentation, not by reading context.
3. **No `🦕` press is ever punished** — even a no-op produces the character's signature animation, encouraging playful experimentation.
4. The signature move (Rexy's roar, Trikey's charge, Sera's spin) IS the `🦕` visual — so a no-op `🦕` on an empty tile simply shows the signature move with no gameplay consequence.

### 3.5 Goal Detection `[LOCKED]`

> **Tier 2 decision.** Resolves how "Dino Reaches Food?" is detected.

1. **Stepping onto the food tile does NOT auto-win.** The dino simply stands on it.
2. **`🦕` on the food tile → eat → win → advance level.** This is the required win condition. (Confirmed by the verified level matrix — every solution ends with `🦕`.)
3. **Food tile is passable** — the dino can step past it. The child must plan to stop on the food and press `🦕`. This teaches precision ("stop at the right spot").
4. **Sequence ends with dino ON food but no `🦕` executed → gentle hint:** the food wiggles invitingly and the dino glances at it. No failure. The child adds `🦕` and re-runs.
5. **Sequence ends with dino NOT on food → idle.** Await edit. No special handling.
6. **If `🦕`-on-food triggers mid-sequence** (more commands remain in the queue) → win immediately; remaining commands discarded; advance level.

**Pedagogical rationale:** Requiring an explicit `🦕`-to-eat gives a deliberate, satisfying win moment (the chomp) rather than an incidental step-onto. The two-beat "reach it, then eat it" is clearer for pre-readers than "step on it and magic happens."

### 3.6 Character Swap `[LOCKED]`

> **Tier 2 decision.** Resolves when/how the dino can be swapped.

1. **Swap is allowed during editing** (sequence not executing). The top-right `[🦖 Swap Dino]` button opens a character carousel overlay; picking one swaps sprite + audio instantly.
2. **During execution, the Swap button is disabled** (greyed out) — prevents mid-animation sprite swaps that would be visually jarring.
3. **Swap preserves all gameplay state** — position, facing, command queue, cleared interactables, current level. Only the visual/audio skin changes (cosmetic-only, per §2).
4. **No mid-execution swap** — if the child wants a different dino, they wait for the sequence to complete or fail, then swap during the next editing phase.

---

## 4. Movement & Coordinate Model `[LOCKED]`

> **Tier 1 decision.** Replaces the cos/sin angle approach from the first draft, which was ambiguous between math-space (y-up) and screen-space (y-down) conventions.

### 4.1 Authoring Space
- y-down screen-space, `(0,0)` = top-left, `(4,2)` = bottom-right — **exactly as the level matrix is authored.**
- No coordinate flips needed at authoring time.

### 4.2 Internal Direction Representation
- Direction is an **integer vector** `(dx, dy)`, not an angle:
  - `E = (1, 0)`, `S = (0, 1)`, `W = (-1, 0)`, `N = (0, -1)`
- No trigonometry in grid logic. No floating-point, no convention to misremember.

### 4.3 Operations

| Operation | Effect |
|-----------|--------|
| **Forward** | `(x, y) += (dx, dy)` |
| **Turn Left** (CCW) | `(dx, dy) → (dy, -dx)` |
| **Turn Right** (CW) | `(dx, dy) → (-dy, dx)` |

### 4.4 Rendering
- Grid → pixel: `screen_x = x · tile_size`, `screen_y = y · tile_size` directly (y-down matches screen, no flip).
- **Movement interpolation** between grid positions uses the smoothstep function:
  $$x_{\text{render}} = x_{\text{start}} + (x_{\text{target}} - x_{\text{start}}) \cdot (3t^2 - 2t^3), \quad t \in [0, 1]$$
- Grid logic is **integer**; rendering is **float**. Clean separation — the smoothstep only tweens pixels, never affects game state.

---

## 5. Level Matrix `[LOCKED]`

> **Tier 1 decision.** Every solution below has been BFS-validated: it reaches the food, avoids all stated obstacles, clears all interactables, and every obstacle genuinely gates the path (removing it yields a shorter solution — no decorative rocks).

### 5.1 Verified Matrix

| L | Title | Start (facing) | Food | Obstacles | Interactables | Track Budget | Min Sol | Headroom | Verified Solution | Concept Taught |
|---|-------|---------------|------|-----------|---------------|-------------|---------|----------|-------------------|----------------|
| 1 | Hungry Steps | (0,1) E | (3,1) | — | — | 6 | 4 | 2 | `🐾🐾🐾🦕` | Linear Sequencing |
| 2 | Double Hop | (0,2) E | (4,2) | — | — | 6 | 5 | 1 | `🐾🐾🐾🐾🦕` | Distance Estimation |
| 3 | The Great Rock | (0,0) E | (1,1) | rock (1,0) | — | 6 | 5 | 1 | `↪️🐾↩️🐾🦕` | Obstacle Awareness |
| 4 | Tiny Corner | (0,2) E | (1,0) | — | — | 6 | 5 | 1 | `🐾↩️🐾🐾🦕` | 90° Turn (Left) |
| 5 | S-Curve Path | (0,2) E | (1,0) | rock (0,0), rock (1,2) | — | 8 | 7 | 1 | `↩️🐾↪️🐾↩️🐾🦕` | Multi-turn Sequencing (3-turn weave) |
| 6 | Around the Swamp | (1,2) N | (3,2) | mud (2,2) | — | 8 | 7 | 1 | `🐾↪️🐾🐾↪️🐾🐾🦕` | U-turn / Loop Navigation |
| 7 | Sleepy Turtle | (0,1) E | (4,1) | — | turtle (2,1) | 8 | 6 | 2 | `🐾🐾🦕🐾🐾🦕` | Special Action (Roar/Interact) |
| 8 | Tall Grass Chomp | (0,2) E | (4,1) | rock (1,2) | grass (0,1) | 10 | 9 | 1 | `↩️🐾↪️🦕🐾🐾🐾🐾🦕` | Special Action (Clear Path) |
| 9 | Twin Paths | (2,2) E | (4,0) | rock (3,0), rock (4,2) | — | 10 | 8 | 2 | `🐾↩️🐾↪️🐾↩️🐾🦕` ¹ | Spatial Route Alternatives |
| 10 | Dino Master | (0,1) E | (4,2) | rock (0,2), rock (2,1) | turtle (1,1) | 10 | 9 | 1 | `🐾↪️🦕🐾↩️🐾🐾🐾🦕` | Compound Sequencing |

### 5.2 What Changed From the First Draft

- **5 levels had invalid solutions** (L3, L4, L5, L9, L10) — the stated "perfect solutions" either collided with stated obstacles or never reached the food. All now BFS-verified.
- **L6's "perfect" solution was non-minimal** (stated 9 moves; true minimum is 7). A child finding the shorter path would have felt the game was broken. Fixed.
- **L10's obstacles were off-path and irrelevant** (original minimum was 6 via a straight eastward run; turtle and mud sat off-path doing nothing). Redesigned so the turtle sits *on* the forced path and both rocks gate genuine alternatives. Now a real compound level (2 `🦕` actions + navigation).
- **L3's original layout needed 10 moves** (impossible in budget 6) — food moved closer so the obstacle-awareness lesson fits.
- **Track limit is now variable** (6 / 8 / 10) instead of a fixed 6 that half the levels couldn't fit.
- **L5 reworked (caveat fix):** the original was a 2-turn single-detour L-shape (`↩️🐾↪️🐾🐾🦕`). Replaced with a genuine **3-turn weave through all 3 rows**: food moved to (1,0), rocks at (0,0)+(1,2) force a staircase path `↩️🐾↪️🐾↩️🐾🦕` (min 7, budget 8). Path: (0,2)→(0,1)→(1,1)→(1,0).
- **L9 reworked (caveat fix):** the original's "spatial alternatives" claim was **false** — BFS verified only ONE shortest path existed (the East-facing start inherently biases a unique route, even on an open grid). Replaced with a verified **co-optimal config**: start (2,2)E, rocks at (3,0)+(4,2), TWO equal-length shortest routes of min 8 — `🐾↩️🐾↪️🐾↩️🐾🦕` (right-then-up) and `↩️🐾↪️🐾🐾↩️🐾🦕` (up-then-right). The child has a genuine binary route choice. (See footnote ¹.)

### 5.3 Documented Caveats

*Both original caveats have been resolved (see §5.2). Retained here for traceability.*

1. ~~**L5 was a weak S-curve** (single detour, 2 turns, only 1 shortest path).~~ → **Resolved:** reworked to a genuine 3-turn weave through 3 rows (min 7, food (1,0), rocks (0,0)+(1,2)). Both rocks gate (removing either shortens the path to 5–6).
2. ~~**L9's "spatial alternatives" was unverified** — in fact false: only 1 shortest path existed.~~ → **Resolved:** reworked to a verified co-optimal config with TWO equal-length shortest routes (min 8, start (2,2)E, rocks (3,0)+(4,2)). Both rocks gate (removing either shortens the path to 6–7).

### 5.4 Footnotes

¹ **L9 has two equal-length verified solutions** (co-optimal): `🐾↩️🐾↪️🐾↩️🐾🦕` (route A: right→up, visiting (3,2)→(3,1)→(4,1)) and `↩️🐾↪️🐾🐾↩️🐾🦕` (route B: up→right, visiting (2,1)→(3,1)→(4,1)). Both are min-length 8 and reach (4,0). The "Verified Solution" column shows route A; route B is equally valid. This is the intended "spatial alternatives" pedagogy — the child chooses either route.

### 5.5 Validation Tooling

A BFS-based level auditor/simulator was built during Tier 1. It can:
- Replay any stated solution against the rules and report validity.
- Compute the true minimum solution for any layout.
- Verify that each obstacle/interactable genuinely gates the path.

This tool should be retained as part of the development kit (level authors can validate new layouts against it).

---

## 6. Track-Limit Policy `[LOCKED]`

> **Tier 1 decision.** Resolves the contradiction between the original fixed 6-slot cap and the levels whose solutions exceeded 6.

- **Variable budget** that grows with the difficulty curve:

| Level band | Track slots | Rationale |
|-----------|-------------|-----------|
| L1–L4 | **6** | Intro concepts, shortest paths; guardrail strongest where attention spans are shortest |
| L5–L7 | **8** | Multi-turn + interactables introduced; mild expansion signals "you're getting bigger" |
| L8–L10 | **10** | Compound sequencing + alternatives; cap that still bounds chaos |

- The track should **visibly grow** between bands (slots animate in). For pre-readers, "my track got bigger" is an intuitive difficulty/progression signal and doubles as a reward.
- Every level's BFS-minimum fits its budget with 1–2 slots of headroom (so the child can solve non-optimally and still succeed), except where noted in §5.3.

---

## 7. UI & UX `[LOCKED]`

### 7.1 Layout Wireframe

```
+-------------------------------------------------------------+
|  [🏠 Home]         Level 3: The Muddy Path      [🦖 Swap Dino] |
+-------------------------------------------------------------+
|                                                             |
|    🦖 (Sera)       🪨 (Rock)                                |
|                                                    🍇 (Berry) |
|                                                             |
+-------------------------------------------------------------+
| Action Track (Sequence):                                  |
| [ 🐾 ] --> [ 🐾 ] --> [ ↪️ ] --> [ 🐾 ]              [ ▶️ GO! ]|
+-------------------------------------------------------------+
| Action Menu (Tap to Add):                                   |
|    ( 🐾 Forward )     ( ↩️ Left )     ( ↪️ Right )    ( 🦕 Action ) |
+-------------------------------------------------------------+
```

### 7.2 The "Juice" Specifications `[LOCKED]`

- **Interactive Physics:** When the dinosaur takes a step forward, the entire game screen must shake slightly, accompanied by a cartoon smoke puff under its feet.
- **Success Animation:** When the target food is reached, the screen bursts with multi-colored leaf/star confetti. The dinosaur does a happy backflip and gobbles the food with loud nom-nom noises.
- **Gentle Failures:** If a path hits an obstacle or boundary, the dinosaur bumps into it with a soft squeaky-toy sound effect, a cartoon "dizzy" ring spins over its head, and it instantly teleports back to the start grid space. **No "Try Again" pop-ups, no score dockets, no red error screens.**

---

## 8. Failure & Success States `[LOCKED]`

> **Tier 2 decision.** Two-tier failure model — hard failures (teleport to start) for true collisions; soft resists (stay on tile) for forgotten `🦕` on interactables.

### 8.1 Two-Tier Failure Model

| Trigger | Type | Visual | Audio | State Effect |
|---------|------|--------|-------|--------------|
| `🐾` into obstacle (rock/mud) or out-of-bounds | **Hard failure** | Bump + dizzy ring | Squeaky-toy bonk | **Teleport to start; reset command queue** |
| `🐾` out of uncleared interactable | **Soft resist** | Dino leans forward, interactable pushes back, gentle wiggle | Gentle bonk | **Dino stays on tile; index advances** (no teleport) |

**Rationale:** The soft resist is *not* a failure — it's a "you need to `🦕` first" nudge. The child wastes a slot (consequence) but isn't punished with a full reset. This is forgiving for 3–5 year-olds still learning the interactable mechanic, while the hard failure retains the clear "oops, try again" signal for genuine collisions.

### 8.2 Full Event Table

| Event | Visual | Audio | State Effect |
|-------|--------|-------|--------------|
| `🐾` into obstacle/boundary | Bump + dizzy ring | Squeaky-toy bonk | **Hard failure:** teleport to start; reset queue |
| `🐾` out of uncleared interactable | Lean + resist + wiggle | Gentle bonk | **Soft resist:** stay on tile; index advances |
| `🦕` on food | Happy backflip + confetti burst | Nom-nom + success chime | **Win:** advance to next level (discard remaining queue) |
| `🦕` on uncleared interactable | Signature move + tile-clear anim | Character signature SFX | Clear tile; mark cleared; advance index |
| `🦕` on cleared interactable or empty tile | Signature idle move | Gentle signature audio | No-op; advance index |
| Sequence ends, dino ON food, no `🦕` executed | Food wiggles; dino glances at it | Soft inviting cue | Gentle hint; await edit (no failure) |
| Sequence ends, dino NOT on food | Idle | Silence | Remain at final position; await edit |

---

## 9. Technical Architecture

### 9.1 Engine Choice `[LOCKED]`

> **Tier 3 decision.** Canvas2D + TypeScript + Vite.

**Decision: Raw Canvas2D (no framework), with TypeScript and Vite.**

Phaser 3 was considered and rejected. Phaser's strengths (physics, spritesheets, scene management, audio loading) are all *unused* by this design — the GDD specifies vector/canvas paths (not spritesheets), Web Audio API synthesis (no audio files), and a turn-based puzzle with no physics. What the game actually needs — a render loop, smoothstep tweening, pointer input, Web Audio synthesis, and bespoke toddler UI — is cleaner hand-rolled than fought through Phaser's abstractions.

| Factor | Canvas2D (chosen) | Phaser 3 (rejected) |
|--------|------------------|---------------------|
| Framework weight | 0 KB | ~1.2 MB minified (40% of <3MB budget) |
| Surface area match | Turn-based 5×3 puzzle — tiny | Built for action/physics games |
| Audio | Web Audio API synthesized (already specified) | Phaser's audio loader unused |
| Sprite animation | Vector/canvas paths (already specified) | Phaser's sprite system unused |
| Custom toddler UI | Full control | Fight Phaser's defaults |
| Build | Vite (dev server + simple build) | Phaser ecosystem expects bundler |

**Stack:**
- **Render:** HTML5 Canvas2D context, `requestAnimationFrame` loop.
- **Language:** TypeScript — type safety for the level schema, command union (`'F'|'L'|'R'|'A'`), and direction vectors.
- **Build:** Vite — hot-reload dev server, simple production build.
- **Tweening:** Hand-rolled ~50-line utility (smoothstep interpolation, no library needed).

### 9.2 State Tree Architecture `[LOCKED]`

> **Tier 3 decision.** Runtime game state (per-level, ephemeral) is separated from persisted state (cross-session, mirrors localStorage).

```json
{
  "game": {
    "currentLevel": 3,
    "activeDino": "rexy",
    "isExecuting": false,
    "activeCommandIndex": -1,
    "commandQueue": [],
    "trackBudget": 6,
    "dinoPos": { "x": 0, "y": 0 },
    "dinoFacing": "E",
    "clearedInteractables": []
  },
  "persisted": {
    "unlockedLevel": 3,
    "chosenCharacter": "rexy",
    "muted": false
  }
}
```

- **`game`** resets each level. `clearedInteractables` tracks which interactable tiles have been `🦕`-cleared during the current execution (reset on level start or hard-failure teleport).
- **`persisted`** mirrors the three `localStorage` keys (§9.4) and survives reloads.
- `activeDino` lives in `game` (runtime) but is initialized from `persisted.chosenCharacter` on load and written back on swap.

### 9.3 Level Data Format `[LOCKED]`

> **Tier 3 decision.** Levels are JSON, loaded from `/data/levels.json` (array of level objects). Consumable by both the runtime and the BFS validator.

```json
{
  "id": 3,
  "title": "The Great Rock",
  "concept": "Obstacle Awareness",
  "grid": { "width": 5, "height": 3 },
  "start": { "x": 0, "y": 0, "facing": "E" },
  "food": { "x": 1, "y": 1, "type": "berry" },
  "obstacles": [{ "x": 1, "y": 0, "type": "rock" }],
  "interactables": [{ "x": 2, "y": 1, "type": "turtle" }],
  "trackBudget": 6,
  "verifiedSolution": ["R", "F", "L", "F", "A"]
}
```

**Conventions:**
- Commands use single-letter keys (`F`/`L`/`R`/`A`) in data, mapped to emoji (🐾/↩️/↪️/🦕) only at render time. Keeps data compact and the validator simple.
- `facing` is a cardinal string (`"E"`/`"S"`/`"W"`/`"N"`), mapped to the direction vector at load.
- Obstacle/interactable `type` drives the visual asset and (for interactables) the clear animation.
- `verifiedSolution` is advisory (for the validator and hints), not enforced at runtime — the child's own sequence is what executes.

### 9.4 State Persistence `[LOCKED]`

> **Tier 3 decision.** Three `localStorage` keys, no accounts (pre-readers).

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `dinosteps:unlockedLevel` | number | `1` | Highest level unlocked (gates level select) |
| `dinosteps:chosenCharacter` | `"rexy"` \| `"trikey"` \| `"sera"` | `"rexy"` | Last picked dino (restored on reload) |
| `dinosteps:muted` | boolean | `false` | Audio mute preference |

- No cross-device sync — out of scope for a free educational resource.
- A "reset progress" option in the Home/settings menu clears these three keys.
- `persisted` state in §9.2 is hydrated from these keys on load and written back on change.

### 9.5 Execution Loop `[LOCKED]`

> **Tier 2 refinement.** All TBDs from the first draft are now resolved (see §3.4, §3.5, §8).

```
[Command Queue Process Triggered by GO button]
              │
              ▼
   Is commandQueue empty? (or activeCommandIndex past end)
   ├── Yes ──► Check terminal state:
   │            ├── Dino ON food tile? ──► Gentle hint (food wiggle); await edit
   │            └── Otherwise            ──► Idle; await edit
   └── No
        │
        ▼
   Process command at activeCommandIndex
   ├── 🐾 Forward: target = (x,y) + (dx,dy)
   │     ├── Is target out-of-bounds OR obstacle?  (hard block)
   │     │     └── Yes ──► HARD FAILURE: bump+dizzy anim → teleport to start → reset queue
   │     ├── Is current tile an UNCLEARED interactable?  (soft block on exit)
   │     │     └── Yes ──► SOFT RESIST: lean+wiggle anim → stay on tile → advance index
   │     └── No (move allowed)
   │           ├── Interpolate render position (smoothstep), set grid pos = target
   │           └── (do NOT auto-win on food — see §3.5)
   ├── ↩️ Left:  (dx,dy) → (dy,-dx); interpolate visual rotation; advance index
   ├── ↪️ Right: (dx,dy) → (-dy,dx); interpolate visual rotation; advance index
   └── 🦕 Action (contextual — see §3.4):
         ├── On food tile?       ──► WIN: success celebration → advance level (discard queue)
         ├── On uncleared interactable? ──► CLEAR: signature anim → mark tile cleared → advance index
         └── Otherwise (empty / cleared) ──► NO-OP: signature idle anim → advance index
   │
   ▼
   Advance activeCommandIndex; loop back to top
```

---

## 10. Sound Effects & Visual Asset Specs `[LOCKED]`

### 10.1 Audio Synthesizer Parameters (Web Audio API Fallbacks)

To keep the game completely self-contained and eliminate download lag, synthesizers dynamically generate adorable sound effects on the fly:

**Stomp Sound (Low Kick Sweep):**
- Oscillator: Sine Wave
- Frequency Sweep: $120\text{ Hz} \rightarrow 20\text{ Hz}$ over $0.15$ seconds
- Gain Envelope: Fast attack, exponential decay

**Dizzy/Bonk Sound (Squeaky Toy):**
- Oscillator: Triangle Wave + Frequency Modulator
- Frequency Sweep: $400\text{ Hz} \rightarrow 800\text{ Hz}$ vibrato over $0.3$ seconds

**Success Chime (Triumphant Major Arpeggio):**
- Oscillator: Square Wave (Soft filtered)
- Sequence: $C_5 \rightarrow E_5 \rightarrow G_5 \rightarrow C_6$ fast progression

### 10.2 CSS Theme Colors (Light & Dark Compatible)

| Role | Color | Hex |
|------|-------|-----|
| Primary (Interface Trim) | Deep Toddler Blue | `#0b57d0` |
| Secondary (Grid Tiles) | Mint Green / Soft Jungle Green | `#c4eed0` |
| Background (Jungle Terrain) | Light Soft Sage | `#f3f8f6` |
| Button Normal (Commands) | Warm Clay Gray | `#e2ece9` |
| Go Button (Play Sequence) | Juicy Play Green | `#34a853` |
| Dizzy Pop (Failure FX) | Pastel Coral Red | `#ff8a80` |

**Confetti Theme Colors:** `#f4b400` (Yellow), `#db4437` (Red), `#4285f4` (Blue), `#0f9d58` (Green)

---

## 11. Production `[LOCKED]`

> **Tier 4 decision.** Production concerns: asset pipeline, accessibility, performance budget, playtesting.

### 11.1 Asset Pipeline `[LOCKED]`

**Decision: Vector-only rendering. No raster spritesheets, no Spine, no Lottie.**

Matches the original GDD spec ("custom vector paths") and the Web Audio synthesis approach — a fully self-contained bundle with no download lag.

| Asset class | Approach | Rationale |
|-------------|----------|-----------|
| **Characters + dynamic animations** | Articulated per-part SVG files, composited on Canvas2D with per-part transforms | Each character is split into named body parts (tail, legs, body, arms, head, jaw) loaded as individual SVG files and composited with independent transforms pivoted at each part's anatomical joint. Enables true per-part animation (stomping legs, swishing tail, bobbing head, articulated jaw). Vector art remains designer-editable, infinitely scalable, and self-contained. See `conductor/tracks/articulated_characters_20260623/` for the Rexy pilot. |
| **Static tiles + food** (rock, mud, grass, turtle, berry, leaf, cookie) | Inline SVG strings, embedded in JS bundle | Authored in a vector editor (Figma/Illustrator); small, scalable, designer-friendly. Falls back to procedural Canvas2D if no designer is available. |
| **Particles** (confetti, smoke, sound rings) | Procedural canvas particle system | Tiny, dynamic, no asset cost. |

**Character art is external per-part SVG files** under `public/characters/<character>/` (e.g. `public/characters/rexy/tail.svg`, `…/leg-front.svg`, `…/jaw.svg`) — still vector, still no raster spritesheets / Spine / Lottie, and total per-character payload stays well under budget (~1 KB per part × ~8 parts). Unmigrated characters (Trikey, Sera) retain the single-image SVG fallback path until a future track migrates them.

**Animation state inventory per character (~10 states):** idle, walking (stomp), turning, signature (roar/charge/spin), backflip, dizzy, eating, resisting, food-wiggle-glance, cleared-tile. Per-part articulation (Rexy pilot) drives idle bob, leg-stomp walk cycle, tail counter-sway, head nod, signature jaw-open, and dizzy head wobble — driven by the tween utility and per-part pivots.

### 11.2 Accessibility `[LOCKED]`

For ages 3–5, motor and perceptual accessibility is paramount:

1. **Tap-target minimum: 64×64px** — above Apple HIG's 44pt minimum, sized for preschoolers' developing fine-motor control.
2. **Never rely on color alone** — every state distinction pairs color with a distinct shape/icon/animation. (Already the case: GO button has ▶️ icon, failure has dizzy ring + different animation.)
3. **Color-blind palette check** — verify the green/coral pairing (GO vs. failure) for deuteranopia/protanopia. Low-risk since they're positionally and contextually distinct, but flagged for a final palette audit during implementation.
4. **All state changes have distinct audio cues** — stomp, bonk, chime, signature SFX (already specified in §10.1). Supports visually impaired players.
5. **No strobing >3Hz** (photosensitive epilepsy) — dizzy ring is a slow spin, confetti is falling particles. Safe, but enforce the cap.
6. **Respect `prefers-reduced-motion`** — reduce screen-shake amplitude, confetti count, and dizzy-spin speed when the user preference is set.

### 11.3 Performance Budget `[LOCKED]`

The first draft stated <3MB; this concretizes the rest:

| Metric | Target | Rationale |
|--------|--------|-----------|
| Total payload | **<500KB** (budget <3MB) | Canvas2D + TS + procedural assets + Web Audio = tiny; comfortably under budget |
| FPS | **60fps target**, graceful degradation to 30fps | Smooth for animation; 30fps acceptable on low-end |
| Device floor | **iPad (5th gen, 2017) / iPhone 8 / Galaxy Tab A** | Common hand-me-down devices in preschool households |
| Touch latency | **<100ms tap-to-response** | Perceived as instant |
| Load time | **<2s on 4G mobile** | Instant perceived load |
| Audio latency | Web Audio scheduling (~10–20ms) | Fine for SFX |

### 11.4 Playtesting Plan `[LOCKED]`

For a preschool game, playtesting with actual children is the single most important QA step. Child privacy (no accounts, no telemetry) means **observation-only**:

1. **Paper prototype test** (pre-code): print the grid + command cards, have a child arrange them. Tests comprehensibility before any engineering.
2. **Vertical-slice test:** build L1 + L7 (basic + interactable), test with 3–5 children ages 3–5. Observe: can they tap-to-append? do they understand GO? do they retry after failure? do they notice the food-wiggle hint?
3. **Full progression test:** all 10 levels, 5–8 children. Observe drop-off points, frustration, and whether track-growth is understood as progression.
4. **Metrics (observed, not telemetry):** time-to-solve per level, number of attempts, where they get stuck, whether they swap characters.
5. **Privacy:** in-person or screen-recording with guardian consent. No analytics, no accounts, no data collection — consistent with the "open educational resource, no ads" ethos.

---

## 12. Open Questions Backlog

### Tier 2 — Core Mechanics `[RESOLVED]`
~~1. `🦕` contextual action: no-op behavior when nothing to interact with?~~ → Resolved §3.4: no-op plays signature idle move, advances index.
~~2. `🦕` does it advance the command index when it's a no-op?~~ → Resolved §3.4: yes, always advances.
~~3. Goal detection: `🐾`-onto-food auto-win, or `🦕`-to-eat required?~~ → Resolved §3.5: `🦕`-to-eat required.
~~4. What happens if the sequence continues after reaching food?~~ → Resolved §3.5: `🦕`-on-food wins immediately, remaining queue discarded.
~~5. Character swap: mid-level / mid-execution / between-levels only?~~ → Resolved §3.6: edit-time only; disabled during execution.
~~6. Failure into an *uncleared interactable* — same as obstacle, or different?~~ → Resolved §8: soft resist (stay on tile), not hard failure.

### Tier 3 — Architecture `[RESOLVED]`
~~7. Lock engine choice: Canvas2D vs Phaser 3.~~ → Resolved §9.1: Canvas2D + TypeScript + Vite.
~~8. Define level JSON schema.~~ → Resolved §9.3: JSON schema with single-letter commands.
~~9. Define persistence schema (localStorage keys).~~ → Resolved §9.4: 3 keys (unlockedLevel, chosenCharacter, muted).
~~10. Refine state tree with new fields.~~ → Resolved §9.2: runtime/persisted split.

### Tier 4 — Production `[RESOLVED]`
~~11. Asset pipeline: SVG / procedural canvas / Spine / Lottie?~~ → Resolved §11.1: vector-only (procedural Canvas2D + inline SVG).
~~12. Accessibility: tap-targets, color-blind, audio cues?~~ → Resolved §11.2: 64px targets, no color-alone, audio cues, <3Hz, reduced-motion.
~~13. Performance budget: FPS, device floor, latency?~~ → Resolved §11.3: 60fps/30fps floor, iPad-5/iPhone-8/Galaxy-Tab-A, <100ms touch, <2s load.
~~14. Playtesting plan with actual children?~~ → Resolved §11.4: observation-based, paper → vertical slice → full progression.

### 12.1 Known Level Caveats `[RESOLVED]`
~~15. L5 is a weak S-curve (single detour, not a true weave).~~ → Resolved §5.2/§5.3: reworked to 3-turn weave (min 7, food (1,0), rocks (0,0)+(1,2)).
~~16. L9 "spatial alternatives" — co-optimality not verified (in fact false: 1 unique shortest path).~~ → Resolved §5.2/§5.3: reworked to verified co-optimal 2-route config (min 8, start (2,2)E, rocks (3,0)+(4,2)).

---

## 13. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Tier 1 | Track limit: variable 6/8/10 by band | Fixed 6 cap excluded half the levels; fixed 10 abandons guardrail for youngest players |
| Tier 1 | Movement model: integer direction vectors, no trig | cos/sin approach was ambiguous between y-up/y-down conventions; grid games don't need trig |
| Tier 1 | Coordinate space: y-down screen-space as authored | Preserves GDD level data verbatim; no authoring flips |
| Tier 1 | Level matrix redesigned and BFS-verified | 5 of 10 original solutions were invalid; obstacles in L10 were off-path |
| Tier 1 | Characters are cosmetic-only, identical mechanics | Simplifies implementation; appropriate for age group |
| Tier 2 | `🦕` is contextual: eat on food / clear on interactable / no-op signature move elsewhere | Turns wrong presses into delightful experimentation; uniform index advance keeps execution simple |
| Tier 2 | Goal detection: `🦕`-to-eat required (no auto-win on step) | Deliberate win moment; teaches precision; matches verified matrix |
| Tier 2 | Character swap: edit-time only, disabled during execution | Cosmetic swap is trivial but mid-animation swaps are jarring; preserve all gameplay state |
| Tier 2 | Two-tier failure: hard (teleport) for obstacles, soft (resist) for uncleared interactables | Forgetting `🦕` shouldn't punish with full reset; distinguishes "wrong path" from "forgot a step" |
| Tier 3 | Engine: Canvas2D + TypeScript + Vite (no Phaser) | Phaser's strengths (physics, spritesheets, audio loader) all unused by design; <3MB budget favors minimalism |
| Tier 3 | Level data: JSON with single-letter commands | Compact, validator-friendly, emoji mapped only at render |
| Tier 3 | Persistence: 3 localStorage keys, no accounts | Pre-readers can't log in; cross-device sync out of scope |
| Tier 3 | State tree: runtime (game) / persisted split | Clean separation of ephemeral per-level state from cross-session state |
| Tier 4 | Asset pipeline: vector-only (procedural Canvas2D + inline SVG) | Matches "custom vector paths" spec; no Spine/Lottie/spritesheets; tiny self-contained payload |
| Tier 4 | Accessibility: 64px tap targets, no color-alone, audio cues, <3Hz, reduced-motion | Preschool motor control needs larger targets than HIG min; multi-cue states support color-blind + visually impaired |
| Tier 4 | Performance: 60fps/30fps floor, <500KB, <100ms touch, <2s load | Targets common hand-me-down devices; instant perceived response for toddlers |
| Tier 4 | Playtesting: observation-based, no telemetry | Child privacy (no accounts/analytics); paper → vertical slice → full progression |
| Caveat fix | L5 reworked: 3-turn weave through 3 rows (food (1,0), rocks (0,0)+(1,2), min 7) | Original was a single-detour L (2 turns); replaced with genuine multi-turn sequencing |
| Caveat fix | L9 reworked: verified co-optimal 2-route config (start (2,2)E, rocks (3,0)+(4,2), min 8) | Original falsely claimed "alternatives" but had 1 unique shortest path; now 2 equal-length routes give a genuine binary choice |
| 2026-06-23 | §11.1 Asset pipeline amended: character art is now articulated per-part external SVGs (composited on Canvas2D), not procedural Canvas2D vector drawing | The original "no external asset files" line had already been deviated from in shipped code (Rexy/Trikey/Sera loaded as `Image()` SVGs). The amendment formally blesses the per-part SVG approach and enables true per-part animation (stomping legs, swishing tail, bobbing head, articulated jaw) that the single-image path could not deliver. Vector-only constraint (no raster spritesheets / Spine / Lottie) retained. Rexy pilot migrates first; Trikey/Sera migrate in a later track via the same pattern. |

---

## 14. Implementation Status

### 14.1 Track: `engine_l1_20260621` — Level 1 Vertical Slice `[COMPLETE]`

**Status:** Complete, code-reviewed, fixes applied, and archived.

**Systems implemented:**
- **Engine** (`src/engine/`): TypeScript types, integer direction vectors, level data parser with validation, BFS level validator, immutable state tree, command queue executor with two-tier failure model, localStorage persistence with type-safe loading
- **Rendering** (`src/render/`): Canvas2D with DPI scaling, 5×3 grid renderer, procedural dino vector drawing (3 characters), smoothstep tweening utility, movement interpolation (walk/turn/idle), confetti particle system, dizzy ring + bump animations, food wiggle hint
- **Audio** (`src/audio/`): Lazy-init AudioContext, oscillator + gain envelope synthesizer, 5 SFX functions (stomp, bonk, success, turn, action)
- **Input** (`src/input/`): Tap-to-append/tap-to-delete, GO button, character swap carousel, home screen with character selection, level select, mute toggle — all with 64px tap targets and aria-labels
- **Level 1** (`data/levels.json`): "Hungry Steps" — start (0,1)E, food (3,1), budget 6, verified solution `[F,F,F,A]`

**Quality metrics (post-review):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 105 passed (11 files) | — |
| Coverage | 86.42% statements | 80% |
| Typecheck | 0 errors (includes `test/`) | 0 |
| Lint | 0 warnings (includes `src/` + `test/`) | 0 |
| Build size | ~26.5 KB total | <500 KB |

**Review fixes applied (commit `2853657`):**
- Critical: Added missing `@vitest/coverage-v8` dependency (coverage gate was non-functional)
- High: Converted all 28 TypeScript files to single-quote style (Google TS Style Guide compliance)
- Medium: Fixed `executeQueue` latent bug (`activeCommandIndex: 0`), safe `localStorage` cast with type guard, dizzy ring 5Hz→2.5Hz (accessibility), extracted shared `GRID_WIDTH`/`GRID_HEIGHT` constants, added `test/` to tsconfig + lint scope
- Low: Removed debug `console.log`, dead code (`playClear`/`playSignature`), redundant if-check, fixed `index.html` doctype/charset/CSS alphabetization, removed `_state` prefix, updated confetti to brand palette, extracted `CHARACTERS` constant

### 14.2 Track: `ui_animation_polish_20260621` — UI & Animation Polish `[COMPLETE]`

**Status:** Complete, code-reviewed, fixes applied, and archived to `conductor/archive/ui_animation_polish_20260621/`.

**Systems implemented:**
- **Stylesheet & theme tokens** (`src/styles.css`): Extracted GDD palette into CSS custom properties (`--color-background`, `--color-primary`, `--color-secondary`, `--color-go`, `--color-dizzy`, character accent colors), layout tokens (`--tap-target-min`, `--track-slot-size`, `--border-radius`, `--gap-*`), and typography utilities. Added `@media (prefers-reduced-motion)` reset.
- **Game screen layout** (`src/input/tap.ts`, `src/styles.css`): Redesigned top bar (home, level title, swap/mute) and bottom control panel (command menu, action track, GO pill). All controls now use CSS classes instead of inline styles. Home/mute targets restored to 64×64 px.
- **Button & track animations**: CSS `:active` scale feedback, track-slot add/delete keyframe animations, GO-button pulse when a valid sequence exists, bottom-panel dimming during execution.
- **Canvas juice** (`src/render/juice.ts`, `src/main.ts`): Screen shake and dust puffs on forward steps, per-character signature moves (Rexy rings, Trikey dip + dust, Sera feather sparkles), soft-resist lean/bounce, and food-glance dino-head indicator when ending on food without `A`.
- **Home & level-select screens**: SVG character previews with idle bob, staggered card entrances, track-budget band grouping in level select, completion stars, and keyboard-activation on all buttons.
- **Accessibility**: Added `aria-label`/`aria-pressed`, minimum 64×64 px targets, `prefers-reduced-motion` support for UI and canvas effects, and keyboard (`Enter`/`Space`) activation for focusable controls.

**Quality metrics (post-review):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 133 passed (12 files) | — |
| Coverage | 86.42% statements | 80% |
| Typecheck | 0 errors | 0 |
| Lint | 0 warnings / 0 errors | 0 |
| Format | clean | 0 changes needed |
| Build size | ~38 KB total / 12 KB gzip | <500 KB |

**Review fixes applied (commits `d2f9d46`, `a48fbc5`):**
- High: Removed remaining hard-coded sizes/colors from `src/input/tap.ts`; moved static values to `src/styles.css` classes.
- High: Restored Home/Mute buttons to the 64×64 px minimum via `.btn-mute`.
- High: Implemented missing `drawFoodGlance` and wired it into the render loop.
- High: Replaced character hard-coded hex colors with CSS custom properties using `data-character` selectors.
- Medium: Added keyboard (`Enter`/`Space`) activation to all tap-built buttons and filled track slots.
- Low: Fixed `oxfmt` formatting drift in `src/styles.css`.

### 14.3 Track: `levels_2_10_20260622` — Levels 2-10 `[COMPLETE]`

**Status:** Complete, code-reviewed, fixes applied, and archived to `conductor/archive/levels_2_10_20260622/`.

**Systems implemented:**
- **TileType expansion** (`src/engine/types.ts`): Expanded from generic `obstacle | food | interactable` to specific sub-types: `rock`, `mud`, `berry`, `leaf`, `cookie`, `turtle`, `grass`
- **Classification helpers** (`src/engine/tileUtils.ts`): NEW — `isObstacle()`, `isFood()`, `isInteractable()` functions for type-safe tile classification
- **Level data** (`data/levels.json`): 10 levels total — L1 (basic), L2-L6 (obstacles only), L7-L10 (with interactables)
- **BFS validator** (`src/engine/bfsValidator.ts`): Updated to handle interactables — tracks cleared state, tries `A` as a clearing action, enforces soft-resist on exit from uncleared interactables
- **Renderer** (`src/render/grid.ts`): Expanded COLORS and EMOJI maps for all 8 tile sub-types, updated food wiggle to use correct food emoji
- **Executor** (`src/engine/executor.ts`): Updated to use tileUtils helpers for tile classification
- **Input** (`src/input/tap.ts`): Level preview uses tileUtils helpers for classification

**Quality metrics (post-review):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 178 passed (13 files) | — |
| Coverage | 88.79% statements | 80% |
| Typecheck | 0 errors | 0 |
| Lint | 0 warnings / 0 errors | 0 |
| Format | clean | 0 changes needed |
| Build size | 30.20 KB total | <500 KB |

**Review fixes applied (commit `ab4087a`):**
- Medium: Fixed `berry` emoji from 🍎 to 🫐 per spec FR6 (also fixed `drawFoodWiggle` fallback)
- Medium: Fixed `mud` emoji from 💩 to 🟤 per spec FR6 (inappropriate for preschool audience)
- Low: Added type assertion justification comments in `executor.ts`, `bfsValidator.ts`, `tap.ts` (Google TS Style Guide §1 compliance)
- Low: Extracted `makeStateKey()` helper in `bfsValidator.ts` to eliminate fragile inline key construction

### 14.4 Track: `signature_sfx_20260622` — Character Signature SFX `[COMPLETE]`

**Status:** Complete, code-reviewed, fixes applied, and archived to `conductor/archive/signature_sfx_20260622/`.

**Systems implemented:**
- **Character signature SFX** (`src/audio/sfx.ts`): Replaced generic `playAction()` with `playSignature(character, isClearing)` — 6 variants across 3 characters (Rexy: sawtooth 200→80 Hz with vibrato; Trikey: triangle 400 Hz fixed; Sera: sine arpeggio 800→1000→1200 Hz), each with action (clearing) and idle (no-op) variants
- **Soft-resist audio** (`src/audio/sfx.ts`): `playSoftResist()` — sine 150→100 Hz thud for forgotten dino on interactable exit, distinct from hard-failure `playBonk()`
- **Hint audio** (`src/audio/sfx.ts`): `playHint()` — ascending C5→E5 two-note chime for food-wiggle hint, character-agnostic
- **Text-free hint fix** (`src/main.ts`): Removed `hintEl.textContent` — hint is now purely audio + visual (food glance/wiggle), no on-screen text
- **Executor enhancement** (`src/engine/executor.ts`): Added `actionContext: 'clear' | 'noop'` field to `CommandResult` continue variant, set by `actionCommand()` to distinguish clearing vs. no-op
- **Wiring** (`src/main.ts`): `playSignature` wired into `A` command (action vs. idle by `actionContext`), `playSoftResist` into soft-resist terminal, `playHint` into hint terminal — all gated by mute check

**Quality metrics (post-review):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 185 passed (13 files) | — |
| Coverage | 90.37% statements / 90.51% lines | 80% lines |
| Typecheck | 0 errors | 0 |
| Lint | 0 warnings / 0 errors | 0 |
| Build size | ~43 KB total / 13 KB gzip | <500 KB |

**Review fixes applied (commit `ae1dce7`):**
- Medium: Removed orphaned/misplaced JSDoc block above `playSoftResist()` (copy-paste error documenting wrong function)
- Low: Marked TDD subtask checkboxes in plan.md; noted vestigial empty `hintEl` element (plan-permitted) and inline comment nits (left as-is per surgical-change principle)

### 14.5 Track: `win_polish_completion_20260622` — Win Polish & Game Completion `[COMPLETE]`

**Status:** Complete, code-reviewed, fixes applied, and archived to `conductor/archive/win_polish_completion_20260622/`.

**Systems implemented:**
- **Win overlay removal** (`src/main.ts`): Removed text-based win overlay (🎉 + "Level Complete!" heading); win celebration is now purely audio + visual (confetti + backflip), auto-advancing after a timer
- **Nom-nom eating sound** (`src/audio/sfx.ts`): `playNomNom()` — 3-chomp synthesized eating sound (sine oscillators at 180/220/200 Hz with frequency ramps and gain envelopes), plays before `playSuccess()` on win, gated by mute check
- **Game completion state** (`src/engine/types.ts`, `src/engine/state.ts`, `src/main.ts`): Added `gameComplete` flag to `GameState`; `markWinComplete()` pure function sets it when winning the last level; returns to home screen with trophy indicator (🏆) on game completion
- **Reset progress** (`src/input/tap.ts`, `src/main.ts`): Long-press title (2-second hold) reveals "Reset Progress" button; two-tap confirmation within 3 seconds; calls `resetProgress()` to clear all 3 localStorage keys and return to initial state
- **Text-free carousel close** (`src/input/tap.ts`): Replaced "Cancel" text with ✕ icon, retained `aria-label="Close character selection"` for accessibility
- **Canvas clearing fix** (`src/main.ts`): Clear canvas each frame to prevent residual rendering (confetti/particles persisting across frames)

**Quality metrics (post-review):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 188 passed (13 files) | — |
| Coverage | 90.49% statements / 90.63% lines | 80% lines |
| Typecheck | 0 errors | 0 |
| Lint | 0 warnings / 0 errors | 0 |
| Build size | ~44.8 KB total / 13.6 KB gzip | <500 KB |

**Review fixes applied (commit `e7361d2`):**
- Medium: Added missing CSS styling for new UI elements (trophy, reset button, reset-confirm) using product palette tokens (`--color-button`, `--color-dizzy`)
- Medium: Extracted `markWinComplete()` pure function into `state.ts`; replaced trivial `gameComplete` test with proper transition tests (winning last level sets true, levels 1–9 do not)
- Low: Removed dead `.win-overlay` CSS rules left behind after win overlay removal
- Low: Updated "what" comment to "why" for canvas-clearing rationale

### 14.6 Track: `articulated_characters_20260623` — Articulated Characters (Pilot: Rexy) `[COMPLETE]`

**Status:** Complete, code-reviewed, fixes applied.

**Systems implemented:**
- **Character parts system** (`src/render/character-parts.ts`): `CharacterPart` interface with `pivotX`/`pivotY` (anatomical joint in viewBox space), `REXY_RIG` with 7 parts (tail, leg-back, leg-front, body, head, jaw), `ArticulationState`/`ArticulationPhase` types, `computePartTransform` dispatch function, per-phase transform functions (idle tail-sway/head-nod, walking leg-stomp/tail-counter-sway, signature jaw-open, eating jaw-chomp, celebrating backflip, dizzy head-wobble)
- **Composite renderer** (`src/render/dino.ts`): `drawCompositeDino` composites per-part SVGs on Canvas2D with independent per-part transforms (rotate, scale, translate) pivoted at each part's anatomical joint; `drawSingleImageDino` fallback for unmigrated characters (Trikey, Sera)
- **Character rig loader** (`src/render/characters.ts`): `preloadCharacterRigs` async loader, `getCharacterRig`/`getPartImage` cache accessors
- **Rexy SVG assets** (`public/characters/rexy/`): 7 hand-authored SVG files (tail, leg-back, leg-front, body, head, jaw, head-jaw fallback) — each in a 120×120 viewBox with anatomically positioned art
- **Eating animation helpers** (`src/render/eating.ts`): `triggerEating`/`updateEating`/`resetEating`/`activeProgress` — 400ms jaw-chomp sequence during win
- **Main loop wiring** (`src/main.ts`): `ArticulationState` construction from movement, signature, eating, and win states; phase dispatch drives per-part transform selection

**Quality metrics (post-review):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 231 passed (15 files) | — |
| Coverage | 90.63% lines | 80% lines |
| Typecheck | 0 errors | 0 |
| Lint | 0 warnings / 0 errors | 0 |
| Build size | ~47.7 KB total / 14.2 KB gzip | <500 KB |

**Review fixes applied (commit `860fa27`):**
- Critical: Phase dispatch gap — `phase` now derives from `eatingState.active`/`signatureState.active`/`showWin` instead of only `movement.animState`. Previously the `'signature'`, `'eating'`, and `'dizzy'` phases were never set in the game loop, making the track's core jaw articulation features dead code (tested in isolation but never dispatched at runtime)
- High: Pivot offset in `drawCompositeDino` — subtracted `s/2` from the pivot translate to account for centered `drawImage`. Parts were rotating around a point offset by half a tile from their anatomical joints
- Low: Preserved idle bob during signature phase in both render paths (regression prevention for non-rigged character rendering)

### 14.7 Track: `docker_deploy_20260623` — Docker & Docker Compose Deployment `[COMPLETE]`

**Status:** Complete, all verifications pass, and archived to `conductor/archive/docker_deploy_20260623/`. Infrastructure chore — no game-code changes.

**Systems implemented (all at repo root, no app source touched):**
- **`.dockerignore`** (59 lines) — trims the build context by excluding `node_modules/`, `dist/`, `test/`, `conductor/`, `*.md`, IDE/git/tooling caches, and logs. Keeps the Docker build context small and the dependency cache layer valid.
- **Multi-stage `Dockerfile`** (44 lines) — `node:22-alpine` builder (pnpm via corepack) runs `pnpm install --frozen-lockfile` and `pnpm build`; `fholzer/nginx-brotli:v1.31.1` runtime stage copies only `dist/` + `nginx.conf`. Exposes port 80.
- **`nginx.conf`** (66 lines) — SPA history fallback (`try_files $uri $uri/ /index.html;` with `/assets/*` having no fallback to avoid masking missing-asset errors as 200s), brotli + gzip compression (`brotli_comp_level 6` for `text/css`, `application/javascript`, `application/json`, `image/svg+xml`; gzip as fallback for clients without `Accept-Encoding: br`), immutable cache for `/assets/*` (`public, max-age=31536000, immutable`), `no-cache` for `index.html`, security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`), and `Vary: Accept-Encoding` on compressed responses.
- **`docker-compose.yml`** (30 lines) — single `web` service, port `8080:80` mapping (env-overridable), `restart: unless-stopped`, `wget` healthcheck every 30 s (3 retries, 5 s timeout, 5 s start period).
- **`pnpm-workspace.yaml`** (2 lines) — the existing `allowBuilds: { lefthook: true }` entry. Already present pre-track; the Docker track surfaced that pnpm 11 reads build-script approvals from this file (not `.npmrc` or `package.json`) and that the Dockerfile must copy it before the install step.
- **`package.json` / `pnpm-lock.yaml`** — promoted `vite` from transitive (via `vitest`) to a direct devDep so the build script's `vite build` resolves in a clean `pnpm install --frozen-lockfile`. Pre-existing project bug surfaced by the Docker build.

**Decisions / deviations from the spec (all documented in commit messages):**
1. **Brotli via `fholzer/nginx-brotli` base image** instead of stock `nginx:alpine` + module installation. The stock image doesn't include the brotli module; fholzer is a drop-in replacement with the module statically linked (compressed image size ~15.5 MB, essentially the same as stock).
2. **`wget` in healthcheck** instead of `curl`. The alpine base ships busybox `wget`, not `curl`. Functionally equivalent for a 200-OK check on the root path.
3. **Lefthook build script approval via `pnpm-workspace.yaml`** (canonical pnpm 11 location), not `.npmrc` or `package.json`. An early attempted `.npmrc` fix in this track was ineffective (pnpm 11 does not read `onlyBuiltDependencies` from `.npmrc`) and was deleted in a follow-up.

**Verifications (all passed via curl + docker build):**
| Check | Result |
|-------|--------|
| Image builds (`docker compose build --no-cache`) | success |
| Image size | 39.7 MB (target: well under 50 MB) |
| Container runs and is healthy | `dinosteps-web` on `0.0.0.0:8080->80/tcp` |
| `GET /` returns 200 with `<title>DinoSteps</title>` | yes |
| `/assets/*` `Cache-Control` | `public, max-age=31536000, immutable` |
| `index.html` `Cache-Control` | `no-cache` |
| Brotli `Content-Encoding: br` on JS/CSS | yes (JS: 37,213 → 11,009 bytes = 70% reduction) |
| Gzip fallback when client requests gzip only | yes |
| Security headers on every response | all three present |
| SPA fallback for deep client paths | 200 + `index.html` body |
| Dependency layer cached on source-only changes | manifest + install CACHED, `COPY . .` + `pnpm build` re-ran (5.4 s) |

**Quality metrics (no app-source changes; existing baseline preserved):**
| Metric | Result | Threshold |
|--------|--------|-----------|
| Tests | 231 passed (15 files) | — |
| Coverage | 90.25% lines / 90.12% statements | 80% lines |
| Typecheck | 0 errors | 0 |
| Lint | 0 warnings / 0 errors | 0 |
| Docker image size | 39.7 MB | <50 MB |
| Vite bundle size | 47.7 KB (unchanged from §14.6) | <500 KB |

### 14.8 Deferred Items (Future Tracks)

| Priority | Item | Rationale |
|----------|------|-----------|
| Medium | Trikey & Sera articulated character migration | Follow the Rexy pilot pattern: split into per-part SVGs with `CharacterPart` rigs, migrate from `drawSingleImageDino` to `drawCompositeDino` |
| Low | Thread `dizzyProgress` into `ArticulationState` | Intentionally deferred in pilot — `dizzyTransform` exists but `dizzyProgress` is hardcoded to `-1`. Existing `drawDizzyRings` overlay covers failure VFX for now |
| Low | Playtesting | Per §11.4: paper prototype → vertical slice → full progression with children ages 3–5 |
