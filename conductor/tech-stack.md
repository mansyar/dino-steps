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
- **Articulated per-part character SVGs** — each character is split into named body parts (tail, legs, body, arms, head, jaw) under `public/characters/<character>/`, one SVG per part, all sharing a `viewBox="0 0 120 120"`. Parts are preloaded and composited on Canvas2D with independent transforms pivoted at each part's anatomical joint. Rexy is the pilot (8 parts); Trikey and Sera retain the single-image fallback path until a later track migrates them via the same pattern. See `conductor/tracks/articulated_characters_20260623/`.
- **Procedural Canvas2D vector drawing** — dynamic animations (dizzy rings, bump lean, confetti particles, signature FX overlays) drawn as parameterized path functions.
- **Emoji overlays** — food (🍎) and obstacle (🪨) tiles rendered as emoji on grid.
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

---

## Deployment

Local production deployment via Docker. The runtime image is a static-file nginx server; the source bundle comes from a Node + pnpm build stage. See `conductor/tracks/docker_deploy_20260623/` for the full track record.

### Container
- **Runtime:** [`fholzer/nginx-brotli:v1.31.1`](https://hub.docker.com/r/fholzer/nginx-brotli) — a drop-in replacement for `nginx:alpine` with the Google brotli module statically linked. Compressed image size is ~15.5 MB, essentially the same as stock `nginx:alpine`. **Not** the official `nginx:alpine` because that image does not include the brotli module; switching to it would have required either a custom module build or accepting text-only gzip compression.
- **Builder:** `node:22-alpine` (matches the project's `engines` constraint). pnpm is provided by corepack (built into Node 16.10+).
- **Final image size:** ~40 MB (well under the 50 MB target). Contains only `nginx` + `dist/` + `nginx.conf`; no source, no `node_modules`.

### Build
- **Multi-stage Dockerfile** (`Dockerfile`):
  - **Stage 1 (`builder`)** — copies `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` first, then runs `pnpm install --frozen-lockfile`. Only after that copies the rest of the source, then runs `pnpm build`. The manifest + install layer is independent of source code, so source-only changes do not invalidate the dependency cache.
  - **Stage 2 (`runtime`)** — copies the custom `nginx.conf` and the built `dist/` from the builder stage. Exposes port 80.
- **pnpm 11 build-script approval** is configured in `pnpm-workspace.yaml` (`allowBuilds: { lefthook: true }`), not `.npmrc`. pnpm 11 deprecated the `pnpm.onlyBuiltDependencies` field in `package.json` and does not read the equivalent `.npmrc` key; `pnpm-workspace.yaml` is the canonical location. The builder stage must copy this file before the install step — see `Dockerfile` for the correct `COPY` order.
- **vite is a direct devDependency** — required for the build script (`tsc -b && vite build`) to resolve. (Was previously only a transitive dep of `vitest`; promoted to direct when the Docker build surfaced the issue.)

### Serve
- **nginx** (`nginx.conf`) is the single static-file server in the runtime image.
  - **SPA history fallback** — `try_files $uri $uri/ /index.html;` so deep client-side paths (e.g. `/level/3`) return `index.html` rather than 404. The `/assets/` location uses an internal-only `try_files` (no fallback to `/index.html`) so missing asset files return 404 instead of masking errors.
  - **Brotli compression** — `brotli on; brotli_comp_level 6;` for `text/css`, `application/javascript`, `application/json`, `image/svg+xml`. Reduces the JS bundle from ~37 KB to ~11 KB (70% reduction).
  - **Gzip fallback** — gzip is enabled for the same content types as a fallback for clients that do not send `Accept-Encoding: br`. `text/html` is compressed by default in nginx and must NOT be re-listed in `gzip_types` / `brotli_types`.
  - **Caching** — `/assets/*` responses carry `Cache-Control: public, max-age=31536000, immutable` (one year; safe because Vite content-hashes asset filenames). `index.html` carries `Cache-Control: no-cache` so updates are picked up on next load.
  - **Security headers** on every response: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - **`Vary: Accept-Encoding`** on compressed responses so CDNs and proxies serve the correct encoding to each client.

### Orchestration
- **`docker-compose.yml`** — single `web` service, port mapping `8080:80` (host port env-overridable), `restart: unless-stopped`, healthcheck every 30 s.
  - **Healthcheck** uses `wget -qO- http://localhost/ >/dev/null || exit 1` rather than `curl`. The stock alpine images (official and fholzer's) ship busybox `wget`, not `curl`. Functionally equivalent for a 200-OK check on the root path.

### Local commands
```bash
# Build the image (uses cache on second run; --no-cache for a clean rebuild)
docker compose build

# Run the container in the background
docker compose up -d

# Tail logs
docker compose logs -f web

# Stop and remove
docker compose down
```

Game is served on `http://localhost:8080/` once the container is up.
