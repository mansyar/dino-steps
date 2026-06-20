# DinoSteps — Tech Stack

## Runtime Stack

### Language
- **TypeScript** — type safety for the level schema, command union (`'F'|'L'|'R'|'A'`), direction vectors, and state tree. Strict mode enabled.

### Rendering
- **HTML5 Canvas2D API** — raw context, no rendering framework. `requestAnimationFrame` loop drives the render cycle.
- **No Phaser / no WebGL / no canvas libraries** — Phaser's strengths (physics, spritesheets, scene management, audio loader) are all unused by this design (GDD §9.1).

### Build Tooling
- **Vite** — hot-reload dev server, optimized production build. Minimal config; native TypeScript + ES module support.
- **pnpm** — package manager. Fast, disk-efficient (content-addressable store). Used for all dependency management, script running, and dev toolchain orchestration.

### Audio
- **Web Audio API** — all sound effects synthesized on the fly (oscillators, gain envelopes, frequency sweeps). Zero audio files in the bundle.

### Persistence
- **localStorage** — 3 keys only: `dinosteps:unlockedLevel`, `dinosteps:chosenCharacter`, `dinosteps:muted`. No backend, no accounts, no cross-device sync.

### Assets
- **Procedural Canvas2D vector drawing** — characters and dynamic animations drawn as parameterized path functions.
- **Inline SVG strings** — static tiles (rock, mud, grass, turtle, food) embedded in the JS bundle. No external asset files.
- **No raster spritesheets / Spine / Lottie** — vector-only (GDD §11.1).

### Tweening
- **Hand-rolled smoothstep utility** (~50 lines) — `3t² - 2t³` interpolation for render-position tweening only. No animation library.

---

## Development Toolchain

### Linting
- **oxlint** (Oxc) — fast Rust-based linter. Configured for TypeScript. Enforces code quality rules.

### Formatting
- **oxfmt** (Oxc) — fast Rust-based formatter. Enforces consistent code style. No Prettier.

### Testing
- **vitest** — used **for testable logic only** (not rendering or audio synthesis). Covers:
  - Grid logic: direction vectors, forward/turn operations, boundary/obstacle checks
  - Command execution: queue processing, contextual 🦕 resolution, two-tier failure model
  - Level data: BFS validator, solution verification, level loading/parsing
  - State management: runtime/persisted state transitions, localStorage hydration
  - Track budget logic, win-condition detection, interactable clearing
- **vitest coverage** — coverage collection scoped to the same testable logic modules.

### Type Checking
- **tsc (TypeScript compiler)** — `noEmit: true` and `incremental: true` in `tsconfig.json`. Type checking runs as a separate step from the Vite build.

### Git Hooks (lefthooks)
- **lefthook** — git hooks manager.
  - **pre-commit:** run `oxlint` and `oxfmt` on staged files only. Blocks commit on lint/format failure.
  - **pre-push:** run `vitest` coverage with an **80% threshold** check on testable logic. Blocks push if coverage drops below 80%.

---

## Package Summary

| Package | Purpose | Runtime or Dev |
|---------|---------|----------------|
| `pnpm` | Package manager | Dev |
| `typescript` | Language / type checking | Both |
| `vite` | Build & dev server | Dev |
| `vitest` | Testing & coverage | Dev |
| `oxlint` (via `oxc`) | Linting | Dev |
| `oxfmt` (via `oxc`) | Formatting | Dev |
| `lefthook` | Git hooks | Dev |

**Runtime dependencies: zero.** The game ships with no framework and no runtime libraries — only TypeScript compiled to JavaScript. Canvas2D, Web Audio API, and localStorage are browser-native.

---

## Configuration Notes

### tsconfig.json
- `strict: true`
- `noEmit: true` (Vite handles emission; tsc is type-check only)
- `incremental: true` (faster type-checking on CI and pre-push)

### lefthook.yml (sketch)
```yaml
pre-commit:
  commands:
    lint:
      glob: '*.{ts,tsx,js}'
      run: oxlint --fix {staged_files}
    format:
      glob: '*.{ts,tsx,js,json}'
      run: oxfmt --write {staged_files}
pre-push:
  commands:
    coverage:
      run: vitest run --coverage --coverage.thresholds.lines=80
    typecheck:
      run: tsc --noEmit
```

### Performance Budget Alignment
- Zero runtime deps → minimal bundle size → supports <500KB target (GDD §11.3).
- Rust-based dev tools (oxlint/oxfmt) → fast local dev & CI feedback.
- Incremental type-checking → fast pre-push gate.
