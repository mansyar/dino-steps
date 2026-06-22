# Implementation Plan — Docker & Docker Compose Deployment

**Track:** `docker_deploy_20260623`
**Spec:** [./spec.md](./spec.md)

> Note: This is an infrastructure chore (config files, not application logic). Per the workflow, TDD maps to *define expected behavior → implement config → verify via build/serve commands*. Phase 2 performs all acceptance verification.

---

## Phase 1: Docker & nginx Configuration

- [ ] Task: Create `.dockerignore`
    - [ ] Define exclusions: `node_modules`, `.git`, `dist`, `test/`, `conductor/`, `docs/`, `.opencode`, `*.md`, editor configs, build artifacts
    - [ ] Verify the file excludes build-irrelevant paths so the build context stays lean and the dependency cache layer is not invalidated
- [ ] Task: Create multi-stage `Dockerfile`
    - [ ] Stage 1 (`builder`): Node base image with pnpm enabled (`corepack enable`); copy `package.json` + `pnpm-lock.yaml` first; run `pnpm install --frozen-lockfile`; copy source; run `pnpm build`
    - [ ] Stage 2 (`runtime`): `nginx:alpine`; copy only `dist/` to the nginx html root; copy `nginx.conf` into the image
    - [ ] Verify the final image contains no `node_modules`/source (only nginx + static assets)
- [ ] Task: Create `nginx.conf` with best-practice serving config
    - [ ] SPA history fallback (`try_files $uri $uri/ /index.html;`)
    - [ ] Gzip compression for JS/CSS/JSON/SVG/HTML
    - [ ] Brotli compression for the same content types
    - [ ] Long-term cache headers for `/assets/*` (`Cache-Control: public, max-age=31536000, immutable`); `no-cache` for `index.html`
    - [ ] Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- [ ] Task: Create `docker-compose.yml`
    - [ ] Single service building from the local Dockerfile
    - [ ] Port mapping: host port (env-overridable, default `8080`) → container `80`
    - [ ] `restart: unless-stopped`
- [ ] Task: Conductor - User Manual Verification 'Docker & nginx Configuration' (Protocol in workflow.md)

## Phase 2: Build & Integration Verification

- [ ] Task: Build the Docker image and verify success
    - [ ] Run `docker compose build`; confirm it completes without errors
    - [ ] Confirm the final image size is small (target: well under 50MB)
- [ ] Task: Run the container and verify the game is served
    - [ ] Run `docker compose up -d`; open the mapped host port in a browser
    - [ ] Confirm DinoSteps loads and is playable
- [ ] Task: Verify response headers (caching, compression, security)
    - [ ] Verify `/assets/*` responses include `Cache-Control: public, max-age=31536000, immutable`
    - [ ] Verify `index.html` includes `no-cache`
    - [ ] Verify gzip/brotli `Content-Encoding` on compressed asset types
    - [ ] Verify security headers present (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- [ ] Task: Verify SPA history fallback
    - [ ] Request a deep client-side path; confirm it returns `index.html` (200) rather than a 404
- [ ] Task: Verify dependency layer caching on rebuild
    - [ ] Modify a source file, rebuild; confirm the `pnpm install` layer is cached (only the build step re-runs)
- [ ] Task: Conductor - User Manual Verification 'Build & Integration Verification' (Protocol in workflow.md)
