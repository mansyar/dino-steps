// Dino vector rendering — procedural Canvas2D drawing with animations
// Draws a side-profile dinosaur with neck, snout, long tail, and thick legs

import { getCanvasContext } from "./canvas";
import type { DinoCharacter, Facing } from "../engine/types";

const CHARACTER_COLORS: Record<DinoCharacter, string> = {
  Rexy: "#4caf50",
  Trikey: "#42a5f5",
  Sera: "#ef5350",
};

// Slightly darker shade for accents (belly, legs)
function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 1 - amount;
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
}

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
  const dark = darken(color, 0.15);
  const s = tileSize * 0.8;
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // Idle bob
  let bobY = 0;
  if (anim && animType === "idle") {
    bobY = Math.sin(anim.idleTime * 2) * s * 0.015;
  }
  ctx.translate(0, bobY);

  ctx.rotate(angleFromFacing(facing));

  // === TAIL (behind body) ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 0.28, -s * 0.06);
  ctx.bezierCurveTo(
    -s * 0.42, -s * 0.12,
    -s * 0.52, -s * 0.08,
    -s * 0.55, -s * 0.02,
  );
  ctx.bezierCurveTo(
    -s * 0.52, s * 0.04,
    -s * 0.42, s * 0.06,
    -s * 0.28, s * 0.06,
  );
  ctx.closePath();
  ctx.fill();

  // === BACK LEGS ===
  const legY = s * 0.14;
  const legH = s * 0.18;
  const legW = s * 0.1;
  let backLegOff = 0;
  let frontLegOff = 0;
  if (anim && animType === "walking") {
    backLegOff = Math.sin(anim.walkCycle * 8) * s * 0.04;
    frontLegOff = Math.sin(anim.walkCycle * 8 + Math.PI) * s * 0.04;
  }

  // Back leg (slightly behind)
  ctx.fillStyle = dark;
  roundRect(ctx, -s * 0.14, legY + backLegOff, legW, legH, s * 0.03);
  ctx.fill();

  // Front leg
  roundRect(ctx, s * 0.1, legY + frontLegOff, legW, legH, s * 0.03);
  ctx.fill();

  // === BODY ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.32, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly highlight
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.ellipse(s * 0.02, s * 0.06, s * 0.2, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // === NECK ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(s * 0.18, -s * 0.1);
  ctx.bezierCurveTo(
    s * 0.22, -s * 0.2,
    s * 0.26, -s * 0.28,
    s * 0.3, -s * 0.3,
  );
  ctx.lineTo(s * 0.38, -s * 0.26);
  ctx.bezierCurveTo(
    s * 0.34, -s * 0.22,
    s * 0.3, -s * 0.14,
    s * 0.26, -s * 0.06,
  );
  ctx.closePath();
  ctx.fill();

  // === HEAD ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(s * 0.36, -s * 0.3, s * 0.13, s * 0.1, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.beginPath();
  ctx.ellipse(s * 0.46, -s * 0.28, s * 0.07, s * 0.06, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.4, -s * 0.33, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(s * 0.41, -s * 0.33, s * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.42, -s * 0.34, s * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = darken(color, 0.3);
  ctx.lineWidth = s * 0.015;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(s * 0.43, -s * 0.27, s * 0.04, 0.1, Math.PI * 0.7);
  ctx.stroke();

  // === CHARACTER-SPECIFIC FEATURES ===
  if (character === "Rexy") {
    // Tiny arms
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.02);
    ctx.lineTo(s * 0.2, s * 0.04);
    ctx.lineTo(s * 0.17, s * 0.06);
    ctx.lineTo(s * 0.13, 0);
    ctx.closePath();
    ctx.fill();
  } else if (character === "Trikey") {
    // Three horns on head
    ctx.fillStyle = "#f5f5dc";
    // Brow horns
    ctx.beginPath();
    ctx.moveTo(s * 0.34, -s * 0.38);
    ctx.lineTo(s * 0.32, -s * 0.48);
    ctx.lineTo(s * 0.36, -s * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.38);
    ctx.lineTo(s * 0.42, -s * 0.47);
    ctx.lineTo(s * 0.42, -s * 0.38);
    ctx.closePath();
    ctx.fill();
    // Nose horn
    ctx.beginPath();
    ctx.moveTo(s * 0.48, -s * 0.3);
    ctx.lineTo(s * 0.54, -s * 0.34);
    ctx.lineTo(s * 0.5, -s * 0.28);
    ctx.closePath();
    ctx.fill();
    // Frill behind head
    ctx.fillStyle = darken(color, 0.1);
    ctx.beginPath();
    ctx.moveTo(s * 0.28, -s * 0.34);
    ctx.bezierCurveTo(
      s * 0.22, -s * 0.44,
      s * 0.18, -s * 0.42,
      s * 0.2, -s * 0.3,
    );
    ctx.closePath();
    ctx.fill();
  } else if (character === "Sera") {
    // Plates along the back (Stegosaurus-style)
    ctx.fillStyle = darken(color, 0.1);
    const platePositions = [
      { x: -s * 0.15, h: s * 0.12, w: s * 0.06 },
      { x: -s * 0.02, h: s * 0.15, w: s * 0.07 },
      { x: s * 0.1, h: s * 0.13, w: s * 0.06 },
      { x: s * 0.2, h: s * 0.09, w: s * 0.05 },
    ];
    for (const p of platePositions) {
      ctx.beginPath();
      ctx.moveTo(p.x - p.w / 2, -s * 0.15);
      ctx.lineTo(p.x, -s * 0.15 - p.h);
      ctx.lineTo(p.x + p.w / 2, -s * 0.15);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Draw a rounded rectangle */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
