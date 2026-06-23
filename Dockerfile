# syntax=docker/dockerfile:1.7
# Multi-stage build for DinoSteps (Vite SPA)
# - Stage 1 builds the static bundle with Node + pnpm
# - Stage 2 serves the bundle with nginx:alpine (no source, no node_modules)

# ---------- Stage 1: builder ----------
FROM node:22-alpine AS builder

# pnpm ships with corepack in Node 16.10+; enable it
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy only the lockfile, manifest, and workspace config first so the install layer
# is cached and not invalidated by source-code changes. pnpm-workspace.yaml is
# required for pnpm 11's strict build-script policy — its `allowBuilds: lefthook: true`
# entry approves lefthook's postinstall (which downloads the native git-hooks binary).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Frozen lockfile → reproducible builds
RUN pnpm install --frozen-lockfile

# Now copy the rest of the source (includes index.html, src/, public/, vite.config.ts, etc.)
COPY . .

# Build: tsc -b (type-check) && vite build (bundle)
RUN pnpm build

# ---------- Stage 2: runtime ----------
# Use fholzer/nginx-brotli — the official nginx:alpine does NOT include
# the brotli module. fholzer/nginx-brotli is a drop-in replacement with
# the Google brotli module statically linked (compressed size is ~15.5 MB,
# essentially the same as stock nginx:alpine).
FROM fholzer/nginx-brotli:v1.31.1 AS runtime

# Custom nginx configuration with SPA fallback, gzip, caching, and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build output → nginx html root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine default CMD starts nginx in the foreground
