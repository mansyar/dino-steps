# Project Tracks

This file tracks all major tracks for the project. Each track has its own detailed plan in its respective folder. Completed tracks are archived and removed from this registry.

---

## Active Tracks

(none)

---

## Archived Tracks

### articulated_characters_20260623 — Articulated Characters (Pilot: Rexy)
- **Type:** feature
- **Status:** archived (completed 2026-06-23)
- **Summary:** Per-part SVG rig with per-body-part animation, Rexy redraw, eating state + signature jaw articulation. Review fixes applied (phase dispatch gap, pivot offset bug). 231 tests pass, 90.63% coverage, build 47.72 kB.
- **Archive folder:** [../archive/articulated_characters_20260623/](../archive/articulated_characters_20260623/)

### docker_deploy_20260623 — Docker & Docker Compose Deployment
- **Type:** chore
- **Status:** archived (completed 2026-06-23)
- **Summary:** Multi-stage Dockerfile (`node:22-alpine` builder + `fholzer/nginx-brotli:v1.31.1` runtime), `nginx.conf` with SPA history fallback, brotli + gzip compression, immutable asset caching + no-cache `index.html`, security headers; `docker-compose.yml` for local deployment with `8080:80` mapping, `restart: unless-stopped`, `wget` healthcheck. Image size 39.7 MB. Verified: brotli reduces JS bundle 70% (37 KB → 11 KB); SPA fallback works; `pnpm install` layer cached on source-only changes. Three pre-existing project bugs surfaced and fixed: vite promoted to direct devDep, pnpm 11 `allowBuilds` configured in `pnpm-workspace.yaml` (not `.npmrc`/package.json), brotli enabled via `fholzer/nginx-brotli` base (not stock `nginx:alpine`).
- **Archive folder:** [../archive/docker_deploy_20260623/](../archive/docker_deploy_20260623/)

