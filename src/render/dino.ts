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
  animType?: "idle" | "walking" | "turning",
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
