// Dino rendering — draws preloaded SVG character images onto Canvas
// Supports idle bob and walk/turn animations via position interpolation
// Articulated characters (Rexy pilot) composite 8 parts with per-part transforms

import { getCanvasContext } from './canvas';
import { getCharacterImage, getCharacterRig, getPartImage } from './characters';
import type { DinoCharacter, Facing } from '../engine/types';
import {
  type ArticulationState,
  type CharacterPart,
  computePartTransform,
} from './character-parts';

export interface DinoAnimState {
  idleTime: number;
  walkCycle: number;
  turnProgress: number;
}

export function createDinoAnimState(): DinoAnimState {
  return { idleTime: 0, walkCycle: 0, turnProgress: 0 };
}

/**
 * Build a default idle ArticulationState from a DinoAnimState. Used for the home-screen /
 * level-select idle dino.
 */
export function buildIdleState(anim: DinoAnimState, reducedMotion: boolean): ArticulationState {
  return {
    phase: 'idle',
    idleTime: anim.idleTime,
    walkCycle: 0,
    signatureProgress: -1,
    eatingProgress: -1,
    backflipProgress: -1,
    dizzyProgress: -1,
    reducedMotion,
  };
}

/**
 * Draw a dino character. The caller supplies the full ArticulationState for this frame; drawDino
 * composes whole-body transforms (facing, bob, walk bounce, backflip) and per-part transforms (idle
 * tail/head sway, walking legs, signature jaw, eating jaw, dizzy head/tail) on top.
 *
 * @param state The articulation state for this frame. Use `buildIdleState` for a minimal idle dino,
 *   or construct one in the game loop.
 */
export function drawDino(
  px: number,
  py: number,
  tileSize: number,
  character: DinoCharacter,
  facing: Facing,
  state: ArticulationState,
): void {
  const rig = getCharacterRig(character);
  if (rig) {
    drawCompositeDino(px, py, tileSize, rig.parts, facing, state);
    return;
  }
  drawSingleImageDino(px, py, tileSize, character, facing, state);
}

function drawSingleImageDino(
  px: number,
  py: number,
  tileSize: number,
  character: DinoCharacter,
  facing: Facing,
  state: ArticulationState,
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
  if (state.phase === 'idle') {
    const bobY = Math.sin(state.idleTime * 2) * s * 0.02;
    ctx.translate(0, bobY);
  }

  // Walk bounce
  if (state.phase === 'walking') {
    const bounce = Math.abs(Math.sin(state.walkCycle * 8)) * s * 0.02;
    ctx.translate(0, -bounce);
  }

  ctx.rotate(angleFromFacing(facing));

  // Backflip rotation (during win celebration)
  if (state.phase === 'celebrating' && state.backflipProgress > 0) {
    const t = state.backflipProgress;
    ctx.rotate(t * Math.PI * 2);
    const jump = Math.sin(t * Math.PI) * s * 0.3;
    ctx.translate(0, -jump);
  }

  // Draw the SVG centered at origin
  ctx.drawImage(img, -s / 2, -s / 2, s, s);

  ctx.restore();
}

function drawCompositeDino(
  px: number,
  py: number,
  tileSize: number,
  parts: readonly CharacterPart[],
  facing: Facing,
  state: ArticulationState,
): void {
  const { ctx } = getCanvasContext();
  const s = tileSize * 0.85;
  const scale = s / 120; // 120×120 viewBox → s×s on screen

  ctx.save();
  ctx.translate(px + tileSize / 2, py + tileSize / 2);

  // Idle bob
  if (state.phase === 'idle') {
    const bobY = Math.sin(state.idleTime * 2) * s * 0.02;
    ctx.translate(0, bobY);
  }

  // Walk bounce
  if (state.phase === 'walking') {
    const bounce = Math.abs(Math.sin(state.walkCycle * 8)) * s * 0.02;
    ctx.translate(0, -bounce);
  }

  ctx.rotate(angleFromFacing(facing));

  // Backflip rotation (during win celebration) — applied as a wrapper so the
  // whole composite spins as a unit. Per-part transforms apply within this frame.
  if (state.phase === 'celebrating' && state.backflipProgress > 0) {
    const t = state.backflipProgress;
    ctx.rotate(t * Math.PI * 2);
    const jump = Math.sin(t * Math.PI) * s * 0.3;
    ctx.translate(0, -jump);
  }

  // Composite parts in back-to-front draw order
  for (const part of parts) {
    const img = getPartImage(part.file);
    if (!img) continue;

    const t = computePartTransform(part.name, state);

    ctx.save();
    // Move to pivot (in part's 120×120 viewBox space, scaled to s×s)
    ctx.translate(part.pivotX * scale, part.pivotY * scale);
    ctx.rotate(t.rotate);
    ctx.scale(1, t.scaleY);
    ctx.translate(-part.pivotX * scale, -part.pivotY * scale);
    ctx.translate(t.tx, t.ty);
    ctx.drawImage(img, -s / 2, -s / 2, s, s);
    ctx.restore();
  }

  ctx.restore();
}

function angleFromFacing(facing: Facing): number {
  switch (facing) {
    case 'E':
      return 0;
    case 'S':
      return Math.PI / 2;
    case 'W':
      return Math.PI;
    case 'N':
      return -Math.PI / 2;
  }
}

/**
 * Draw dizzy rings spinning above dino's head (failure animation)
 *
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

  const speed = reducedMotion ? 1.5 : 2.5; // Hz — both under 3Hz accessibility cap
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
    ctx.fillStyle = '#FFD700';
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
 *
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

  return {
    x: px + dir.dx * lean,
    y: py + dir.dy * lean,
  };
}
