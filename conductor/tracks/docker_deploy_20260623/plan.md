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

- [~] Task: Build the Docker image and verify success
    - [ ] Run `docker compose build`; confirm it completes without errors
    - [ ] Confirm the final image size is small (target: well under 50MB)
- [ ] Task: Run the container and verify the game is served
    - [ ] Run `docker compose up -d`; open the mapped host port in a browser
    - [ ] Confirm DinoSteps loads and is playable
- [ ] Task: Verify response headers (caching, compression, security)
    - [ ] Verify `/assets/*` responses include `Cache-Control: public, max-age=31536000, immutable`
    - [ ] Verify `index.html` includes `no-cache`
    - [ ] Verify brotli `Content-Encoding: br` and gzip `Content-Encoding: gzip` on compressed asset types
    - [ ] Verify security headers present (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- [ ] Task: Verify SPA history fallback
    - [ ] Request a deep client-side path; confirm it returns `index.html` (200) rather than a 404
- [ ] Task: Verify dependency layer caching on rebuild
    - [ ] Modify a source file, rebuild; confirm the `pnpm install` layer is cached (only the build step re-runs)
- [ ] Task: Conductor - User Manual Verification 'Build & Integration Verification' (Protocol in workflow.md)
