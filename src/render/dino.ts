// Dino rendering — draws preloaded SVG character images onto Canvas
// Supports idle bob and walk/turn animations via position interpolation

import { getCanvasContext } from "./canvas";
import { getCharacterImage } from "./characters";
import type { DinoCharacter, Facing } from "../engine/types";

export interface DinoAnimState {
  idleTime: number;
  walkCycle: number;
  turnProgress: number;
}

export function createDinoAnimState(): DinoAnimState {
  return { idleTime: 0, walkCycle: 0, turnProgress: 0 };
}

export function drawDino(
  px: number,
  py: number,
  tileSize: number,
  character: DinoCharacter,
  facing: Facing,
  anim?: DinoAnimState,
  animType?: "idle" | "walking" | "turning" | "celebrating",
  backflipProgress?: number, // 0-1 for backflip rotation
): void {
  const { ctx } = getCanvasContext();
  const img = getCharacterImage(character);
  if (!img) return;

  const s = tileSize * 0.85;
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // Idle bob
  let bobY = 0;
  if (anim && animType === "idle") {
    bobY = Math.sin(anim.idleTime * 2) * s * 0.02;
  }
  ctx.translate(0, bobY);

  // Walk bounce
  if (anim && animType === "walking") {
    const bounce = Math.abs(Math.sin(anim.walkCycle * 8)) * s * 0.02;
    ctx.translate(0, -bounce);
  }

  ctx.rotate(angleFromFacing(facing));

  // Backflip rotation (during win celebration)
  if (backflipProgress !== undefined && backflipProgress > 0) {
    // Ease in-out: spin 360° with acceleration
    const t = backflipProgress;
    const rotation = t * Math.PI * 2;
    ctx.rotate(rotation);
    // Slight jump upward at peak
    const jump = Math.sin(t * Math.PI) * s * 0.3;
    ctx.translate(0, -jump);
  }

  // Draw the SVG centered at origin
  ctx.drawImage(img, -s / 2, -s / 2, s, s);

  ctx.restore();
}

function angleFromFacing(facing: Facing): number {
  switch (facing) {
    case "E":
      return 0;
    case "S":
      return Math.PI / 2;
    case "W":
      return Math.PI;
    case "N":
      return -Math.PI / 2;
  }
}

/**
 * Draw dizzy rings spinning above dino's head (failure animation)
 * @param progress 0-1 progress through the dizzy animation
 * @param reducedMotion If true, spin slower
 */
export function drawDizzyRings(
  px: number,
  py: number,
  tileSize: number,
  progress: number,
  reducedMotion?: boolean,
): void {
  const { ctx } = getCanvasContext();
  const cx = px + tileSize / 2;
  const cy = py + tileSize * 0.15; // above dino head

  const speed = reducedMotion ? 2 : 5; // Hz → rad/s (kept < 3Hz visual)
  const angle = progress * Math.PI * 2 * speed;
  const radius = tileSize * 0.2;

  ctx.save();
  ctx.translate(cx, cy);

  // Draw 3 stars orbiting
  for (let i = 0; i < 3; i++) {
    const a = angle + (Math.PI * 2 * i) / 3;
    const sx = Math.cos(a) * radius;
    const sy = Math.sin(a) * radius * 0.5; // elliptical orbit

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(a * 2);

    // Star shape
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const starAngle = (j * Math.PI * 2) / 5 - Math.PI / 2;
      const outerR = tileSize * 0.06;
      const innerR = outerR * 0.4;
      if (j === 0) {
        ctx.moveTo(Math.cos(starAngle) * outerR, Math.sin(starAngle) * outerR);
      } else {
        ctx.lineTo(Math.cos(starAngle) * outerR, Math.sin(starAngle) * outerR);
      }
      const midAngle = starAngle + Math.PI / 5;
      ctx.lineTo(Math.cos(midAngle) * innerR, Math.sin(midAngle) * innerR);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw bump effect — dino leans into obstacle
 * @param progress 0-1, where 0.5 is max lean
 * @param facing Direction of impact
 */
export function drawBump(
  px: number,
  py: number,
  tileSize: number,
  progress: number,
  facing: Facing,
): { x: number; y: number } {
  // Bump offset: lean forward then spring back
  const t = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
  const lean = t * tileSize * 0.15;

  const dir = { dx: 0, dy: 0 };
  switch (facing) {
    case "E":
      dir.dx = 1;
      break;
    case "W":
      dir.dx = -1;
      break;
    case "S":
      dir.dy = 1;
      break;
    case "N":
      dir.dy = -1;
      break;
  }

  return {
    x: px + dir.dx * lean,
    y: py + dir.dy * lean,
  };
}
