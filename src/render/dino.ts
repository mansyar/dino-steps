// Dino vector rendering — procedural Canvas2D drawing with animations
// Draws a side-profile dinosaur with big head, elongated body, thick tail

import { getCanvasContext } from "./canvas";
import type { DinoCharacter, Facing } from "../engine/types";

const CHARACTER_COLORS: Record<DinoCharacter, string> = {
  Rexy: "#4caf50",
  Trikey: "#42a5f5",
  Sera: "#ef5350",
};

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

  // === TAIL (thick, extends behind) ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 0.25, -s * 0.08);
  ctx.bezierCurveTo(
    -s * 0.35, -s * 0.14,
    -s * 0.50, -s * 0.10,
    -s * 0.55, -s * 0.04,
  );
  ctx.bezierCurveTo(
    -s * 0.52, s * 0.02,
    -s * 0.40, s * 0.06,
    -s * 0.25, s * 0.06,
  );
  ctx.closePath();
  ctx.fill();

  // Tail stripe (darker tip)
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, -s * 0.06);
  ctx.bezierCurveTo(
    -s * 0.50, -s * 0.09,
    -s * 0.55, -s * 0.06,
    -s * 0.55, -s * 0.02,
  );
  ctx.bezierCurveTo(
    -s * 0.53, s * 0.01,
    -s * 0.48, s * 0.02,
    -s * 0.45, 0,
  );
  ctx.closePath();
  ctx.fill();

  // === LEGS (thick, columnar) ===
  const legBottom = s * 0.32;
  const legH = s * 0.16;
  const legW = s * 0.1;
  let backLegOff = 0;
  let frontLegOff = 0;
  if (anim && animType === "walking") {
    backLegOff = Math.sin(anim.walkCycle * 8) * s * 0.03;
    frontLegOff = Math.sin(anim.walkCycle * 8 + Math.PI) * s * 0.03;
  }

  ctx.fillStyle = dark;
  // Back leg
  roundRect(ctx, -s * 0.12, legBottom + backLegOff - legH, legW, legH, s * 0.03);
  ctx.fill();
  // Front leg
  roundRect(ctx, s * 0.1, legBottom + frontLegOff - legH, legW, legH, s * 0.03);
  ctx.fill();

  // Feet (round)
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(-s * 0.07 + legW / 2, legBottom + backLegOff, s * 0.06, s * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 0.15 + legW / 2, legBottom + frontLegOff, s * 0.06, s * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // === BODY (elongated horizontal oval) ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.30, s * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly lighter patch
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(s * 0.02, s * 0.06, s * 0.18, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // === NECK (thick, short) ===
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(s * 0.18, -s * 0.08);
  ctx.bezierCurveTo(
    s * 0.20, -s * 0.18,
    s * 0.22, -s * 0.24,
    s * 0.26, -s * 0.26,
  );
  ctx.lineTo(s * 0.36, -s * 0.22);
  ctx.bezierCurveTo(
    s * 0.32, -s * 0.18,
    s * 0.28, -s * 0.10,
    s * 0.24, -s * 0.02,
  );
  ctx.closePath();
  ctx.fill();

  // === HEAD (big, prominent) ===
  ctx.fillStyle = color;
  // Main head shape — big oval
  ctx.beginPath();
  ctx.ellipse(s * 0.36, -s * 0.28, s * 0.16, s * 0.12, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Snout — extends forward, rounded
  ctx.beginPath();
  ctx.ellipse(s * 0.50, -s * 0.25, s * 0.09, s * 0.07, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Top of head bump
  ctx.beginPath();
  ctx.ellipse(s * 0.34, -s * 0.38, s * 0.10, s * 0.05, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Jaw line (lower jaw slightly darker)
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(s * 0.44, -s * 0.20, s * 0.10, s * 0.04, -0.05, 0, Math.PI);
  ctx.fill();

  // === EYE (large, expressive) ===
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.38, -s * 0.32, s * 0.055, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(s * 0.395, -s * 0.32, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.405, -s * 0.335, s * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // === NOSTRIL ===
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(s * 0.55, -s * 0.26, s * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // === SMILE ===
  ctx.strokeStyle = darken(color, 0.3);
  ctx.lineWidth = s * 0.015;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(s * 0.46, -s * 0.22, s * 0.04, 0.2, Math.PI * 0.6);
  ctx.stroke();

  // === CHARACTER-SPECIFIC FEATURES ===
  if (character === "Rexy") {
    // Tiny T-Rex arms
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(s * 0.16, -s * 0.02);
    ctx.quadraticCurveTo(s * 0.22, s * 0.04, s * 0.18, s * 0.08);
    ctx.lineTo(s * 0.14, s * 0.06);
    ctx.quadraticCurveTo(s * 0.16, s * 0.02, s * 0.14, -s * 0.02);
    ctx.closePath();
    ctx.fill();
  } else if (character === "Trikey") {
    // Three horns (Triceratops)
    ctx.fillStyle = "#f5f5dc";
    // Left brow horn
    ctx.beginPath();
    ctx.moveTo(s * 0.30, -s * 0.38);
    ctx.lineTo(s * 0.26, -s * 0.50);
    ctx.lineTo(s * 0.34, -s * 0.38);
    ctx.closePath();
    ctx.fill();
    // Right brow horn
    ctx.beginPath();
    ctx.moveTo(s * 0.38, -s * 0.38);
    ctx.lineTo(s * 0.40, -s * 0.50);
    ctx.lineTo(s * 0.42, -s * 0.38);
    ctx.closePath();
    ctx.fill();
    // Nose horn
    ctx.beginPath();
    ctx.moveTo(s * 0.54, -s * 0.28);
    ctx.lineTo(s * 0.60, -s * 0.32);
    ctx.lineTo(s * 0.56, -s * 0.24);
    ctx.closePath();
    ctx.fill();
    // Frill behind head
    ctx.fillStyle = darken(color, 0.08);
    ctx.beginPath();
    ctx.moveTo(s * 0.24, -s * 0.30);
    ctx.bezierCurveTo(
      s * 0.16, -s * 0.42,
      s * 0.12, -s * 0.38,
      s * 0.16, -s * 0.24,
    );
    ctx.closePath();
    ctx.fill();
  } else if (character === "Sera") {
    // Plates along the back (Stegosaurus)
    ctx.fillStyle = darken(color, 0.08);
    const plates = [
      { x: -s * 0.14, h: s * 0.14, w: s * 0.07 },
      { x: -s * 0.01, h: s * 0.18, w: s * 0.08 },
      { x: s * 0.11, h: s * 0.15, w: s * 0.07 },
      { x: s * 0.21, h: s * 0.10, w: s * 0.06 },
    ];
    for (const p of plates) {
      ctx.beginPath();
      ctx.moveTo(p.x - p.w / 2, -s * 0.14);
      ctx.lineTo(p.x, -s * 0.14 - p.h);
      ctx.lineTo(p.x + p.w / 2, -s * 0.14);
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
