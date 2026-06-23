// Articulated character part rig schema and per-part transform logic.
// Pure data + pure functions — no Canvas, no DOM. Composited in `dino.ts`.

import type { DinoCharacter } from '../engine/types';

export interface CharacterPart {
  name: string;
  file: string;
  pivotX: number;
  pivotY: number;
}

export interface CharacterRig {
  character: DinoCharacter;
  parts: CharacterPart[];
}

export type ArticulationPhase =
  | 'idle'
  | 'walking'
  | 'turning'
  | 'signature'
  | 'eating'
  | 'celebrating'
  | 'dizzy';

export interface ArticulationState {
  phase: ArticulationPhase;
  idleTime: number;
  walkCycle: number;
  /** 0..1 progress through the signature move. Negative when not active. */
  signatureProgress: number;
  /** 0..1 progress through one chomp cycle. Negative when not active. */
  eatingProgress: number;
  /** 0..1 progress through the backflip spin. Negative when not active. */
  backflipProgress: number;
  /** Seconds elapsed in the dizzy state. Negative when not active. */
  dizzyProgress: number;
  reducedMotion: boolean;
}

export interface PartTransform {
  /** Rotation in radians (pivot-anchored when applied in the renderer). */
  rotate: number;
  tx: number;
  ty: number;
  /** Vertical scale. 1.0 = no change. */
  scaleY: number;
}

const ZERO: PartTransform = { rotate: 0, tx: 0, ty: 0, scaleY: 1 };

/** Apply reduced-motion halving to a base amplitude. Frequency is preserved. */
function amp(a: number, reduced: boolean): number {
  return reduced ? a / 2 : a;
}

/**
 * Compute the per-part transform for a character part given the current articulation state. Pure
 * function — no side effects, deterministic.
 */
export function computePartTransform(partName: string, state: ArticulationState): PartTransform {
  const reduced = state.reducedMotion;
  switch (state.phase) {
    case 'walking':
      return walkingTransform(partName, state.walkCycle, reduced);
    case 'signature':
      return signatureTransform(partName, state.signatureProgress, reduced);
    case 'eating':
      return eatingTransform(partName, state.eatingProgress, reduced);
    case 'celebrating':
      return celebrateTransform(partName, state.backflipProgress);
    case 'dizzy':
      return dizzyTransform(partName, state.dizzyProgress, reduced);
    case 'idle':
    case 'turning':
      return idleTransform(partName, state.idleTime, reduced);
  }
}

// ─── per-phase helpers ──────────────────────────────────────────────────────

function idleTransform(name: string, t: number, reduced: boolean): PartTransform {
  if (name === 'tail') {
    // 1.5× idle-bob frequency (bob is sin(t * 2) → tail uses sin(t * 3))
    return { ...ZERO, rotate: amp(0.06, reduced) * Math.sin(t * 3) };
  }
  if (name === 'head') {
    // Phase-offset gentle nod (~0.03 rad)
    return { ...ZERO, rotate: amp(0.03, reduced) * Math.sin(t * 2 + Math.PI / 2) };
  }
  return ZERO;
}

function walkingTransform(name: string, w: number, reduced: boolean): PartTransform {
  const legAmp = amp(0.35, reduced);
  const swing = Math.sin(w * 2 * Math.PI); // one full leg cycle per integer walk step
  if (name === 'leg-front') {
    return { ...ZERO, rotate: legAmp * swing };
  }
  if (name === 'leg-back') {
    return { ...ZERO, rotate: -legAmp * swing };
  }
  if (name === 'tail') {
    // Counter-sway so the tail moves opposite the legs
    return { ...ZERO, rotate: amp(0.12, reduced) * -swing };
  }
  if (name === 'head') {
    // Slight forward nod in time with the step
    return { ...ZERO, rotate: amp(0.04, reduced) * swing };
  }
  return ZERO;
}

function signatureTransform(name: string, p: number, reduced: boolean): PartTransform {
  if (p < 0) return ZERO;
  if (name === 'jaw') {
    // Triangular envelope: 0 → 0.5 (peak at p=0.4) → 0 (closed by p=0.9) → 0
    let r: number;
    if (p < 0.4) r = 0.5 * (p / 0.4);
    else if (p < 0.9) r = 0.5 * ((0.9 - p) / 0.5);
    else r = 0;
    return { ...ZERO, rotate: amp(r, reduced) };
  }
  if (name === 'head') {
    // Tilts back ~0.12 rad in the same envelope
    let r: number;
    if (p < 0.4) r = -0.12 * (p / 0.4);
    else if (p < 0.9) r = -0.12 * ((0.9 - p) / 0.5);
    else r = 0;
    return { ...ZERO, rotate: amp(r, reduced) };
  }
  if (name === 'body') {
    // Subtle scaleY puff 1.0 → 1.03 → 1.0
    let s = 1;
    if (p < 0.5) s = 1 + 0.03 * (p / 0.5);
    else if (p < 1) s = 1.03 - 0.03 * ((p - 0.5) / 0.5);
    return { ...ZERO, scaleY: s };
  }
  return ZERO;
}

function eatingTransform(name: string, p: number, reduced: boolean): PartTransform {
  if (p < 0) return ZERO;
  if (name === 'jaw') {
    // Chomp: opens 0 → 0.4 across 0..0.5, snaps closed across 0.5..0.7, stays closed
    let r: number;
    if (p < 0.5) r = 0.4 * (p / 0.5);
    else if (p < 0.7) r = 0.4 * ((0.7 - p) / 0.2);
    else r = 0;
    return { ...ZERO, rotate: amp(r, reduced) };
  }
  return ZERO;
}

function celebrateTransform(name: string, p: number): PartTransform {
  // Whole-body backflip is applied at drawDino level; per-part stays neutral so
  // the composite rotates as a single unit.
  void name;
  void p;
  return ZERO;
}

function dizzyTransform(name: string, p: number, reduced: boolean): PartTransform {
  if (name === 'head') {
    return { ...ZERO, rotate: amp(0.1, reduced) * Math.sin(p * 6) };
  }
  if (name === 'tail') {
    // Droop (positive bias, no oscillation)
    return { ...ZERO, rotate: amp(0.15, reduced) };
  }
  return ZERO;
}

// ─── REXY_RIG (pilot) ────────────────────────────────────────────────────────
// Pivots are anchored at the joint a part rotates around (hip, shoulder, neck
// base, snout hinge, etc.) and finalised against the real part art in
// public/characters/rexy/*.svg.
export const REXY_RIG: CharacterRig = {
  character: 'Rexy',
  parts: [
    { name: 'tail', file: '/characters/rexy/tail.svg', pivotX: 72, pivotY: 72 },
    { name: 'leg-back', file: '/characters/rexy/leg-back.svg', pivotX: 49, pivotY: 78 },
    { name: 'arm-left', file: '/characters/rexy/arm-left.svg', pivotX: 42, pivotY: 64 },
    { name: 'body', file: '/characters/rexy/body.svg', pivotX: 56, pivotY: 68 },
    { name: 'leg-front', file: '/characters/rexy/leg-front.svg', pivotX: 67, pivotY: 78 },
    { name: 'arm-right', file: '/characters/rexy/arm-right.svg', pivotX: 66, pivotY: 62 },
    { name: 'head', file: '/characters/rexy/head.svg', pivotX: 54, pivotY: 50 },
    { name: 'jaw', file: '/characters/rexy/jaw.svg', pivotX: 64, pivotY: 34 },
  ],
};

// ─── TRIKEY_RIG ──────────────────────────────────────────────────────────────
// Pivots mirror REXY_RIG (same anatomy, same 8 part names) so the shared
// `computePartTransform()` applies unchanged. Pivots are anchored at each
// part's anatomical joint for the Triceratops art in
// public/characters/trikey/*.svg.
export const TRIKEY_RIG: CharacterRig = {
  character: 'Trikey',
  parts: [
    { name: 'tail', file: '/characters/trikey/tail.svg', pivotX: 74, pivotY: 72 },
    { name: 'leg-back', file: '/characters/trikey/leg-back.svg', pivotX: 49, pivotY: 78 },
    { name: 'arm-left', file: '/characters/trikey/arm-left.svg', pivotX: 42, pivotY: 64 },
    { name: 'body', file: '/characters/trikey/body.svg', pivotX: 58, pivotY: 68 },
    { name: 'leg-front', file: '/characters/trikey/leg-front.svg', pivotX: 67, pivotY: 78 },
    { name: 'arm-right', file: '/characters/trikey/arm-right.svg', pivotX: 66, pivotY: 62 },
    { name: 'head', file: '/characters/trikey/head.svg', pivotX: 56, pivotY: 50 },
    { name: 'jaw', file: '/characters/trikey/jaw.svg', pivotX: 66, pivotY: 34 },
  ],
};

// ─── SERA_RIG ────────────────────────────────────────────────────────────────
// Same 8 part names, same draw order, but pivots differ from REXY/TRIKEY
// because Sera's original art has the head on the right of the viewBox
// (Stegosaurus-style chibi with a Pterodactyl tail). Pivots are anchored at
// each part's anatomical joint for the art in public/characters/sera/*.svg.
export const SERA_RIG: CharacterRig = {
  character: 'Sera',
  parts: [
    { name: 'tail', file: '/characters/sera/tail.svg', pivotX: 72, pivotY: 60 },
    { name: 'leg-back', file: '/characters/sera/leg-back.svg', pivotX: 51, pivotY: 89 },
    { name: 'arm-left', file: '/characters/sera/arm-left.svg', pivotX: 42, pivotY: 56 },
    { name: 'body', file: '/characters/sera/body.svg', pivotX: 56, pivotY: 66 },
    { name: 'leg-front', file: '/characters/sera/leg-front.svg', pivotX: 69, pivotY: 87 },
    { name: 'arm-right', file: '/characters/sera/arm-right.svg', pivotX: 66, pivotY: 56 },
    { name: 'head', file: '/characters/sera/head.svg', pivotX: 82, pivotY: 28 },
    { name: 'jaw', file: '/characters/sera/jaw.svg', pivotX: 98, pivotY: 32 },
  ],
};
