// Confetti particle system for win celebration
// Procedurally generated multi-colored falling particles

import { getCanvasContext } from "./canvas";
import { lerp } from "./smoothstep";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

// Confetti theme colors — bright and cheerful for preschoolers
const CONFETTI_COLORS = [
  "#FF6B6B", // coral
  "#4ECDC4", // teal
  "#FFE66D", // yellow
  "#95E1D3", // mint
  "#F38181", // salmon
  "#AA96DA", // lavender
  "#FCBAD3", // pink
  "#A8E6CF", // light green
];

const GRAVITY = 180; // pixels per second²
const DRAG = 0.98;
const PARTICLE_COUNT = 40;

export interface ConfettiState {
  particles: Particle[];
  active: boolean;
}

export function createConfettiState(): ConfettiState {
  return { particles: [], active: false };
}

/**
 * Burst confetti from a center point
 */
export function burstConfetti(state: ConfettiState, cx: number, cy: number): void {
  state.active = true;
  state.particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
    const speed = 150 + Math.random() * 250;

    state.particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100, // bias upward
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life: 0,
      maxLife: 1.5 + Math.random() * 0.5,
    });
  }
}

/**
 * Burst confetti with reduced count (for prefers-reduced-motion)
 */
export function burstConfettiReduced(state: ConfettiState, cx: number, cy: number): void {
  state.active = true;
  state.particles = [];

  const count = Math.floor(PARTICLE_COUNT * 0.3);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const speed = 80 + Math.random() * 100;

    state.particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 4,
      size: 5 + Math.random() * 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life: 0,
      maxLife: 1.2 + Math.random() * 0.3,
    });
  }
}

/**
 * Update and draw confetti particles
 * Returns true if any particles are still alive
 */
export function updateConfetti(state: ConfettiState, dt: number): boolean {
  if (!state.active || state.particles.length === 0) return false;

  const { ctx } = getCanvasContext();
  let alive = false;

  for (const p of state.particles) {
    p.life += dt;
    if (p.life >= p.maxLife) continue;

    alive = true;

    // Physics
    p.vy += GRAVITY * dt;
    p.vx *= DRAG;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rotation += p.rotationSpeed * dt;

    // Fade out near end of life
    const lifeRatio = p.life / p.maxLife;
    const alpha = lifeRatio > 0.7 ? lerp(1, 0, (lifeRatio - 0.7) / 0.3) : 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    // Draw rectangular confetti piece
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);

    ctx.restore();
  }

  if (!alive) {
    state.active = false;
    state.particles = [];
  }

  return alive;
}
