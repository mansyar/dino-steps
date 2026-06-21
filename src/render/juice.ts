// Canvas juice — movement effects, signature moves, and feedback animations
// All effects follow the ctx.save() / ctx.translate() / draw / ctx.restore() pattern

import { getCanvasContext } from './canvas';
import { lerp } from './smoothstep';
import type { DinoCharacter, Facing } from '../engine/types';

// ─── Screen Shake ───────────────────────────────────────────────────────────

export interface ShakeState {
  intensity: number; // current shake magnitude in px
  elapsed: number; // time since shake started
  duration: number; // total shake duration in seconds
}

export function createShakeState(): ShakeState {
  return { intensity: 0, elapsed: 0, duration: 0 };
}

/** Trigger a screen shake (2–4 px for ~80 ms per GDD FR4) */
export function triggerShake(state: ShakeState, intensity = 3, duration = 0.08): void {
  state.intensity = intensity;
  state.elapsed = 0;
  state.duration = duration;
}

/** Update shake and return {x, y} offset to apply via ctx.translate() */
export function updateShake(
  state: ShakeState,
  dt: number,
  reducedMotion?: boolean,
): { x: number; y: number } {
  if (state.intensity <= 0 || state.elapsed >= state.duration) {
    state.intensity = 0;
    return { x: 0, y: 0 };
  }

  state.elapsed += dt;
  const t = state.elapsed / state.duration;
  // Linear decay
  const decay = 1 - t;
  const mag = reducedMotion ? state.intensity * 0.3 : state.intensity;

  // Pseudo-random jitter using sin — deterministic per frame
  const jitterX = Math.sin(state.elapsed * 137.5) * mag * decay;
  const jitterY = Math.cos(state.elapsed * 213.7) * mag * decay;

  return { x: jitterX, y: jitterY };
}

// ─── Dust / Smoke Puff ──────────────────────────────────────────────────────

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

export interface DustState {
  particles: DustParticle[];
}

export function createDustState(): DustState {
  return { particles: [] };
}

/** Spawn a small dust puff at a world position (under the dino's foot) */
export function spawnDust(
  state: DustState,
  wx: number,
  wy: number,
  tileSize: number,
  reducedMotion?: boolean,
): void {
  const count = reducedMotion ? 2 : 4;
  const baseSpeed = tileSize * 1.2;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const speed = baseSpeed * (0.5 + Math.random() * 0.5);
    state.particles.push({
      x: wx,
      y: wy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - tileSize * 0.5, // bias upward
      size: tileSize * (0.06 + Math.random() * 0.04),
      life: 0,
      maxLife: 0.3 + Math.random() * 0.15,
    });
  }
}

/** Update and draw dust particles. Returns true if any are still alive. */
export function updateDust(state: DustState, dt: number): boolean {
  if (state.particles.length === 0) return false;

  const { ctx } = getCanvasContext();
  let alive = false;

  for (const p of state.particles) {
    p.life += dt;
    if (p.life >= p.maxLife) continue;

    alive = true;

    // Physics
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const lifeRatio = p.life / p.maxLife;
    const alpha = lifeRatio > 0.5 ? lerp(0.6, 0, (lifeRatio - 0.5) / 0.5) : 0.6;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#d4c5a9'; // warm sand color
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1 + lifeRatio * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Clean up dead particles
  state.particles = state.particles.filter((p) => p.life < p.maxLife);
  return alive;
}

// ─── Signature Moves ────────────────────────────────────────────────────────

export interface SignatureState {
  progress: number; // 0–1 animation progress
  active: boolean;
  character: DinoCharacter;
}

export function createSignatureState(): SignatureState {
  return { progress: 0, active: false, character: 'Rexy' };
}

/** Start a signature move animation */
export function triggerSignature(state: SignatureState, character: DinoCharacter): void {
  state.progress = 0;
  state.active = true;
  state.character = character;
}

/** Update signature progress. Returns true while animation is running. */
export function updateSignature(state: SignatureState, dt: number): boolean {
  if (!state.active) return false;
  state.progress += dt * 2.5; // ~400ms total
  if (state.progress >= 1) {
    state.progress = 1;
    state.active = false;
    return false;
  }
  return true;
}

/** Draw the signature move effect for the given character */
export function drawSignature(
  px: number,
  py: number,
  tileSize: number,
  state: SignatureState,
  reducedMotion?: boolean,
): void {
  if (!state.active || state.progress >= 1) return;

  const { ctx } = getCanvasContext();
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;
  const t = state.progress;

  switch (state.character) {
    case 'Rexy':
      drawRexyRings(ctx, cx, cy, tileSize, t, reducedMotion);
      break;
    case 'Trikey':
      drawTrikeyDip(ctx, cx, cy, tileSize, t, reducedMotion);
      break;
    case 'Sera':
      drawSeraFeathers(ctx, cx, cy, tileSize, t, reducedMotion);
      break;
  }
}

/** Rexy: expanding sound rings from the dino */
function drawRexyRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  tileSize: number,
  t: number,
  reducedMotion?: boolean,
): void {
  const ringCount = 3;
  const speed = reducedMotion ? 0.7 : 1;

  for (let i = 0; i < ringCount; i++) {
    const delay = i * 0.15;
    const rt = Math.max(0, Math.min(1, ((t - delay) * speed) / (1 - delay)));
    if (rt <= 0) continue;

    const radius = tileSize * 0.2 + rt * tileSize * 0.5;
    const alpha = 1 - rt;

    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = '#0b57d0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** Trikey: short forward head dip + dust kick */
function drawTrikeyDip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  tileSize: number,
  t: number,
  reducedMotion?: boolean,
): void {
  // Head dip: scale Y down briefly
  const dip = reducedMotion ? 0.05 : 0.1;
  const scaleY = t < 0.4 ? 1 - dip * (t / 0.4) : 1 + dip * ((t - 0.4) / 0.6);

  // Dust kick: small particles behind
  const kickAlpha = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.3) / 0.7);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, scaleY);
  ctx.translate(-cx, -cy);

  // Dust particles
  if (kickAlpha > 0) {
    ctx.globalAlpha = kickAlpha * 0.5;
    ctx.fillStyle = '#d4c5a9';
    for (let i = 0; i < 3; i++) {
      const dx = -tileSize * 0.3 + i * tileSize * 0.15;
      const dy = tileSize * 0.2 + t * tileSize * 0.2;
      ctx.beginPath();
      ctx.arc(cx + dx, dy, tileSize * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Sera: wing flap/spin with colored feather sparkles */
function drawSeraFeathers(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  tileSize: number,
  t: number,
  reducedMotion?: boolean,
): void {
  const featherCount = reducedMotion ? 4 : 6;
  const speed = reducedMotion ? 0.6 : 1;
  const sparkleColors = ['#ef5350', '#ff8a80', '#ff5252'];

  for (let i = 0; i < featherCount; i++) {
    const angle = (Math.PI * 2 * i) / featherCount + t * Math.PI * 2 * speed;
    const dist = tileSize * 0.15 + t * tileSize * 0.35;
    const fx = cx + Math.cos(angle) * dist;
    const fy = cy + Math.sin(angle) * dist;

    const alpha = t < 0.5 ? t * 2 : 2 - t * 2;
    const size = tileSize * 0.04 * (1 + Math.sin(t * 10 + i) * 0.3);

    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = sparkleColors[i % sparkleColors.length];
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Soft Resist ────────────────────────────────────────────────────────────

export interface SoftResistState {
  progress: number; // 0–1, 0.5 = max lean
  active: boolean;
}

export function createSoftResistState(): SoftResistState {
  return { progress: 0, active: false };
}

/** Start soft-resist animation (dino leans, tile bounces back) */
export function triggerSoftResist(state: SoftResistState): void {
  state.progress = 0;
  state.active = true;
}

/** Update soft-resist. Returns true while animation runs. */
export function updateSoftResist(state: SoftResistState, dt: number): boolean {
  if (!state.active) return false;
  state.progress += dt * 5; // ~200ms total
  if (state.progress >= 1) {
    state.progress = 1;
    state.active = false;
    return false;
  }
  return true;
}

/** Get the lean offset for the dino during soft-resist */
export function getSoftResistOffset(
  state: SoftResistState,
  tileSize: number,
  facing: Facing,
): { x: number; y: number } {
  if (!state.active) return { x: 0, y: 0 };

  const t = state.progress;
  // Triangle wave: lean forward then spring back
  const lean = (t < 0.5 ? t * 2 : (1 - t) * 2) * tileSize * 0.12;

  const dir = { dx: 0, dy: 0 };
  switch (facing) {
    case 'E':
      dir.dx = 1;
      break;
    case 'W':
      dir.dx = -1;
      break;
    case 'S':
      dir.dy = 1;
      break;
    case 'N':
      dir.dy = -1;
      break;
  }

  return { x: dir.dx * lean, y: dir.dy * lean };
}

// ─── Food Glance ────────────────────────────────────────────────────────────

export interface FoodGlanceState {
  progress: number; // 0–1
  active: boolean;
  foodX: number;
  foodY: number;
}

export function createFoodGlanceState(): FoodGlanceState {
  return { progress: 0, active: false, foodX: 0, foodY: 0 };
}

/** Start food-glance hint (dino turns head toward food) */
export function triggerFoodGlance(state: FoodGlanceState, foodX: number, foodY: number): void {
  state.progress = 0;
  state.active = true;
  state.foodX = foodX;
  state.foodY = foodY;
}

/** Update food-glance. Returns true while animation runs. */
export function updateFoodGlance(state: FoodGlanceState, dt: number): boolean {
  if (!state.active) return false;
  state.progress += dt * 2; // ~500ms total
  if (state.progress >= 1) {
    state.progress = 1;
    state.active = false;
    return false;
  }
  return true;
}

/** Draw a small gaze indicator showing the dino turning toward the food tile */
export function drawFoodGlance(
  dinoX: number,
  dinoY: number,
  foodX: number,
  foodY: number,
  tileSize: number,
  progress: number,
  reducedMotion?: boolean,
): void {
  if (progress <= 0 || progress >= 1) return;

  const { ctx } = getCanvasContext();
  const cx = dinoX + tileSize / 2;
  const cy = dinoY + tileSize / 2;
  const fcx = foodX + tileSize / 2;
  const fcy = foodY + tileSize / 2;

  // Fade in then out
  const alpha = progress < 0.5 ? progress * 2 : 2 - progress * 2;
  const scale = reducedMotion ? 0.7 : 1;
  const angle = Math.atan2(fcy - cy, fcx - cx);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = '#0b57d0'; // GDD primary

  // Draw a small triangular gaze indicator in front of the dino
  ctx.beginPath();
  ctx.moveTo(tileSize * 0.28 * scale, 0);
  ctx.lineTo(tileSize * 0.45 * scale, -tileSize * 0.1 * scale);
  ctx.lineTo(tileSize * 0.45 * scale, tileSize * 0.1 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
