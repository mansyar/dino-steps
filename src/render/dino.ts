// Dino vector rendering — procedural Canvas2D drawing with animations

import { getCanvasContext } from "./canvas";
import type { DinoCharacter, Facing } from "../engine/types";

const CHARACTER_COLORS: Record<DinoCharacter, string> = {
  Rexy: "#4caf50",
  Trikey: "#42a5f5",
  Sera: "#ef5350",
};

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
  const color = CHARACTER_COLORS[character];
  const s = tileSize * 0.8;
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

  ctx.rotate(angleFromFacing(facing));

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.4, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(s * 0.3, -s * 0.1, s * 0.18, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.38, -s * 0.14, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(s * 0.4, -s * 0.14, s * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Legs with walk animation
  ctx.fillStyle = color;
  const legY = s * 0.22;
  let leftLegOffset = 0;
  let rightLegOffset = 0;
  if (anim && animType === "walking") {
    leftLegOffset = Math.sin(anim.walkCycle * 8) * s * 0.04;
    rightLegOffset = Math.sin(anim.walkCycle * 8 + Math.PI) * s * 0.04;
  }
  ctx.fillRect(-s * 0.15, legY + leftLegOffset, s * 0.08, s * 0.12);
  ctx.fillRect(s * 0.08, legY + rightLegOffset, s * 0.08, s * 0.12);

  // Tail
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, 0);
  ctx.lineTo(-s * 0.5, -s * 0.08);
  ctx.lineTo(-s * 0.45, s * 0.05);
  ctx.closePath();
  ctx.fill();

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
