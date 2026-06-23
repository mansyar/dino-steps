# Implementation Plan — Docker & Docker Compose Deployment

**Track:** `docker_deploy_20260623`
**Spec:** [./spec.md](./spec.md)

> Note: This is an infrastructure chore (config files, not application logic). Per the workflow, TDD maps to *define expected behavior → implement config → verify via build/serve commands*. Phase 2 performs all acceptance verification.

---

## Phase 1: Docker & nginx Configuration

- [x] Task: Create `.dockerignore` `6cb2012`
    - [x] Define exclusions: `node_modules`, `.git`, `dist`, `test/`, `conductor/`, `docs/`, `.opencode`, `*.md`, editor configs, build artifacts
    - [x] Verify the file excludes build-irrelevant paths so the build context stays lean and the dependency cache layer is not invalidated
- [x] Task: Create multi-stage `Dockerfile` `d073d2b` (`667aa78` — switched runtime base to `fholzer/nginx-brotli:v1.31.1` for brotli support)
    - [x] Stage 1 (`builder`): Node base image with pnpm enabled (`corepack enable`); copy `package.json` + `pnpm-lock.yaml` first; run `pnpm install --frozen-lockfile`; copy source; run `pnpm build`
    - [x] Stage 2 (`runtime`): `fholzer/nginx-brotli:v1.31.1` (drop-in replacement for `nginx:alpine` with brotli module statically linked); copy only `dist/` to the nginx html root; copy `nginx.conf` into the image
    - [x] Verify the final image contains no `node_modules`/source (only nginx + static assets)
- [x] Task: Create `nginx.conf` with best-practice serving config `e85bee5` (`667aa78` — added brotli directives)
    - [x] SPA history fallback (`try_files $uri $uri/ /index.html;`)
    - [x] Brotli compression for text/css, application/javascript, application/json, image/svg+xml (brotli_comp_level 6)
    - [x] Gzip compression for the same content types as a fallback for clients without `Accept-Encoding: br` (text/html compressed by default)
    - [x] Cache `index.html` with `no-cache`; cache `/assets/*` with `public, max-age=31536000, immutable`
    - [x] Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` on every response
    - [x] Validate syntax via `docker run --rm --entrypoint= fholzer/nginx-brotli:v1.31.1 sh -c 'nginx -t'` — passes with no warnings
- [x] Task: Create `docker-compose.yml` `e143d67`
    - [x] Single service building from the local Dockerfile
    - [x] Port mapping: host port (env-overridable, default `8080`) → container `80`
    - [x] `restart: unless-stopped`
    - [x] Healthcheck: `wget -qO- http://localhost/ >/dev/null || exit 1` every 30s (3 retries, 5s timeout, 5s start_period) — deviation: spec called for `curl` but stock nginx/alpine ships busybox `wget`
    - [x] Validate syntax via `docker compose config` — resolves cleanly
- [x] Task: Conductor - User Manual Verification 'Docker & nginx Configuration' (Protocol in workflow.md)
    - User approved Phase 1 deliverables and asked for brotli to be added via a custom image; that was resolved in commit `667aa78` (switched runtime base to `fholzer/nginx-brotli:v1.31.1`). One deviation remains: `wget` vs `curl` in healthcheck.

## Phase 2: Build & Integration Verification

- [x] Task: Build the Docker image and verify success `e44ded8` `ad99ac5`
    - [x] Run `docker compose build --no-cache`; completes without errors
    - [x] Image size: 39.7 MB (well under 50 MB target); `dinosteps:local`
- [x] Task: Run the container and verify the game is served
    - [x] `docker compose up -d`; container `dinosteps-web` healthy, `0.0.0.0:8080->80/tcp`
    - [x] `curl -s http://localhost:8080/` returns 200 with body containing `<title>DinoSteps</title>`
    - (Note: live browser-playability check requires manual user verification — see UMV below)
- [x] Task: Verify response headers (caching, compression, security)
    - [x] `/assets/*.js` and `/assets/*.css` include `Cache-Control: public, max-age=31536000, immutable`
    - [x] `index.html` includes `Cache-Control: no-cache`
    - [x] `Content-Encoding: br` (brotli) returned when client sends `Accept-Encoding: br` (JS: 37,213 -> 11,009 bytes = 70% reduction)
    - [x] `Content-Encoding: gzip` returned when client sends `Accept-Encoding: gzip` only (fallback path)
    - [x] `index.html` (text/html) is compressed by default - `Content-Encoding: br` present with brotli request
    - [x] Security headers on every response: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
    - [x] `Vary: Accept-Encoding` on compressed responses (CDN/proxy correctness)
- [x] Task: Verify SPA history fallback
    - [x] `GET /some/deep/client/path` returns 200 with `Content-Type: text/html`, `Content-Length: 928` (matches index.html), body contains `<title>DinoSteps</title>`
- [x] Task: Verify dependency layer caching on rebuild
    - [x] Touched `src/main.ts` (added comment), rebuilt via `docker build`:
        - Manifest copy step: CACHED
        - `pnpm install --frozen-lockfile`: CACHED
        - `COPY . .`: re-ran (DONE 0.0s)
        - `pnpm build`: re-ran (5.4s, vite transformed 28 modules)
    - [x] Final image content-addressed: a comment-only change produces an identical bundle, so the final image SHA is reused. This is the correct outcome - proves the install layer is genuinely cached, not just that the build was skipped.
- [x] Task: Conductor - User Manual Verification 'Build & Integration Verification' (Protocol in workflow.md)
    - User approved Phase 2 (automated verifications all pass; user opened the live game in a browser to confirm playability).
