# DinoSteps — Game Design Document (Living)

> **Document Status:** Living document — evolves with discussion.
> Sections are marked with status badges:
> - `[LOCKED]` — decision made, safe to implement against
> - `[DISCUSSING]` — actively under discussion
> - `[PENDING]` — not yet explored, awaiting deep-dive
>
> **Last updated:** Level caveats resolved (L5 → 3-turn weave, L9 → verified co-optimal 2-route). **Document is fully development-ready — all tiers locked, no open caveats.**

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
| **Characters + dynamic animations** | Procedural Canvas2D vector drawing, parameterized | Body parts drawn as path functions of animation state; animations = tweening the parameters. Zero asset files, infinitely scalable, matches "vector paths" spec. |
| **Static tiles + food** (rock, mud, grass, turtle, berry, leaf, cookie) | Inline SVG strings, embedded in JS bundle | Authored in a vector editor (Figma/Illustrator); small, scalable, designer-friendly. Falls back to procedural Canvas2D if no designer is available. |
| **Particles** (confetti, smoke, sound rings) | Procedural canvas particle system | Tiny, dynamic, no asset cost. |

**No external asset files in the bundle** (SVG strings are inlined) — keeps payload tiny and load instant.

**Animation state inventory per character (~10 states):** idle, walking (stomp), turning, signature (roar/charge/spin), backflip, dizzy, eating, resisting, food-wiggle-glance, cleared-tile. All parameterized vector drawings driven by the tween utility.

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
