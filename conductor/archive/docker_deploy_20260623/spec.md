# Spec — Docker & Docker Compose Deployment

**Track Type:** Chore
**Track ID:** `docker_deploy_20260623`

## Overview

Containerize the DinoSteps static web game for production deployment using Docker and Docker Compose, following Dockerfile best practices. The Vite build produces static assets (`dist/`) with zero runtime dependencies, so the deployment uses a **multi-stage build**: a Node/pnpm stage to install dependencies and build the production bundle, followed by a lightweight `nginx:alpine` stage to serve the static assets.

A `docker-compose.yml` orchestrates the single service, and a `.dockerignore` keeps the build context lean.

## Functional Requirements

### FR-1: Multi-Stage Dockerfile
- **Stage 1 (`builder`):** Use a Node image with pnpm available. Copy `package.json` + `pnpm-lock.yaml` first (layer caching for dependencies), run `pnpm install --frozen-lockfile`, then copy source and run `pnpm build` (executes `tsc -b && vite build`).
- **Stage 2 (`runtime`):** Start from `nginx:alpine`. Copy only the built `dist/` output into the nginx html root. Copy a custom `nginx.conf` into the image.
- The final image contains **no source code, no node_modules, and no build tooling** — only nginx + static assets.

### FR-2: nginx Configuration
A custom `nginx.conf` (or `default.conf`) configured with the following best practices:
- **SPA history fallback:** `try_files $uri $uri/ /index.html;` so client-side routes resolve to `index.html` (required for a Vite SPA).
- **Gzip compression:** enabled for `text/css`, `application/javascript`, `application/json`, `image/svg+xml`, `text/html`.
- **Brotli compression:** enabled (via `nginx:alpine` brotli support) for the same content types, with `brotli_static` where applicable.
- **Long-term asset caching:** Files under `/assets/` (Vite's content-hashed output) get `Cache-Control: public, max-age=31536000, immutable`. `index.html` is served with `no-cache` to ensure users always get the latest entry point.
- **Security headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### FR-3: Docker Compose
- A `docker-compose.yml` defines a single service (`dinosteps` or `web`) that builds from the local Dockerfile and maps host port to container port 80.
- The compose file allows overriding the host port via an environment variable (defaulting to a sensible value like 8080).
- Service is configured to restart unless stopped (`restart: unless-stopped`).

### FR-4: .dockerignore
- A `.dockerignore` file excludes `node_modules`, `.git`, `dist`, test files, conductor docs, and other non-build-essential files to keep the build context small and avoid invalidating the dependency cache layer.

## Non-Functional Requirements

- **NFR-1: Image size** — The final runtime image should be small (target: nginx:alpine base ~7MB + static assets, well under 50MB total). Achieved by multi-stage build discarding all build tooling.
- **NFR-2: Layer caching** — Dependencies are installed in a layer before source code is copied, so source changes don't invalidate the `pnpm install` layer.
- **NFR-3: Reproducibility** — `pnpm install --frozen-lockfile` ensures dependency versions are locked.
- **NFR-4: Non-root execution** — nginx worker processes run as a non-root user where feasible (nginx:alpine defaults).
- **NFR-5: No tech-stack changes** — This track adds deployment tooling only; it does not alter the runtime stack defined in `tech-stack.md`.

## Acceptance Criteria

- [ ] `docker compose build` succeeds and produces a final image containing only nginx + static assets (no `node_modules`, no source).
- [ ] `docker compose up` serves the game at the mapped host port; opening the URL in a browser loads DinoSteps and the game is playable.
- [ ] A direct navigation to a client-side route (e.g. refreshing a deep path) resolves to `index.html` rather than a 404 (SPA fallback works).
- [ ] Response headers on `/assets/*` include a 1-year immutable cache directive; `index.html` includes `no-cache`.
- [ ] Response headers include gzip/brotli `Content-Encoding` for compressed asset types.
- [ ] Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are present on responses.
- [ ] Changing a source file and rebuilding reuses the cached dependency layer (only the build step re-runs).

## Out of Scope

- Development container / hot-reload environment (production-only scope).
- CI pipeline integration / automated registry pushes.
- HTTPS/TLS certificate provisioning (handled by a reverse proxy/load balancer in front, not this container).
- Multi-environment compose overrides (staging/prod) — a single production compose file.
- Health check endpoints (static site has no backend; optional `HEALTHCHECK` using `wget` may be included but is not a requirement).
- Changes to the application code or build configuration (`vite.config`, `tsconfig`).
