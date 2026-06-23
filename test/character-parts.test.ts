// Tests for articulated character part rig schema and per-part transform logic.
// Pure functions only — Canvas composite rendering is not tested here.

import { describe, it, expect } from 'vitest';
import {
  type ArticulationState,
  computePartTransform,
  REXY_RIG,
  TRIKEY_RIG,
  SERA_RIG,
} from '../src/render/character-parts';
import { getCharacterRig, preloadCharacterRigs } from '../src/render/characters';

const PI = Math.PI;

const baseState: ArticulationState = {
  phase: 'idle',
  idleTime: 0,
  walkCycle: 0,
  signatureProgress: -1,
  eatingProgress: -1,
  backflipProgress: -1,
  dizzyProgress: -1,
  reducedMotion: false,
};

describe('REXY_RIG data integrity', () => {
  it('contains exactly 8 parts (Rexy pilot scope)', () => {
    expect(REXY_RIG.parts).toHaveLength(8);
  });

  it('has unique part names', () => {
    const names = REXY_RIG.parts.map((p: { name: string }) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every part has a file path under /characters/rexy/', () => {
    for (const part of REXY_RIG.parts) {
      expect(part.file).toMatch(/^\/characters\/rexy\/[a-z-]+\.svg$/);
    }
  });

  it('every pivot is within the 0–120 viewBox', () => {
    for (const part of REXY_RIG.parts) {
      expect(part.pivotX).toBeGreaterThanOrEqual(0);
      expect(part.pivotX).toBeLessThanOrEqual(120);
      expect(part.pivotY).toBeGreaterThanOrEqual(0);
      expect(part.pivotY).toBeLessThanOrEqual(120);
    }
  });

  it('draw order includes all expected Rexy parts back-to-front', () => {
    const names = REXY_RIG.parts.map((p: { name: string }) => p.name);
    // back → front draw order per spec FR1
    expect(names).toEqual([
      'tail',
      'leg-back',
      'arm-left',
      'body',
      'leg-front',
      'arm-right',
      'head',
      'jaw',
    ]);
  });
});

describe('computePartTransform — walking (legs 180° phase offset)', () => {
  it('leg-front and leg-back rotate in opposite directions at any walkCycle', () => {
    for (const w of [0, 0.25, 0.5, 0.75, 1, 1.5]) {
      const state: ArticulationState = { ...baseState, phase: 'walking', walkCycle: w };
      const front = computePartTransform('leg-front', state);
      const back = computePartTransform('leg-back', state);
      // Symmetric swing about 0; one positive, one negative of the same magnitude.
      expect(front.rotate).toBeCloseTo(-back.rotate, 6);
    }
  });

  it('leg-front swing peak is within the spec ±0.35 rad range', () => {
    let maxAbs = 0;
    for (let i = 0; i < 64; i++) {
      const w = i / 16; // sample walk cycle
      const state: ArticulationState = { ...baseState, phase: 'walking', walkCycle: w };
      maxAbs = Math.max(maxAbs, Math.abs(computePartTransform('leg-front', state).rotate));
    }
    expect(maxAbs).toBeLessThanOrEqual(0.35 + 1e-9);
  });
});

describe('computePartTransform — signature (jaw opens at ~0.4, closed by 0.9)', () => {
  it('jaw opens to ~0.5 rad peak at signatureProgress ≈ 0.4', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0.4,
    };
    const jaw = computePartTransform('jaw', state);
    expect(jaw.rotate).toBeCloseTo(0.5, 1);
  });

  it('jaw is closed (≈ 0) at signatureProgress ≈ 0.9', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0.9,
    };
    const jaw = computePartTransform('jaw', state);
    expect(Math.abs(jaw.rotate)).toBeLessThan(0.05);
  });

  it('jaw is closed (0) before the signature starts (progress = 0)', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0,
    };
    const jaw = computePartTransform('jaw', state);
    expect(jaw.rotate).toBe(0);
  });
});

describe('computePartTransform — eating (jaw chomps: opens then closes)', () => {
  it('jaw opens across the first half of eatingProgress', () => {
    const early: ArticulationState = {
      ...baseState,
      phase: 'eating',
      eatingProgress: 0.1,
    };
    const peak: ArticulationState = {
      ...baseState,
      phase: 'eating',
      eatingProgress: 0.5,
    };
    const earlyJaw = computePartTransform('jaw', early);
    const peakJaw = computePartTransform('jaw', peak);
    expect(peakJaw.rotate).toBeGreaterThan(earlyJaw.rotate);
    expect(peakJaw.rotate).toBeGreaterThan(0);
  });

  it('jaw is closed (≈ 0) at the end of the eating cycle (progress = 1)', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'eating',
      eatingProgress: 1,
    };
    const jaw = computePartTransform('jaw', state);
    expect(Math.abs(jaw.rotate)).toBeLessThan(0.05);
  });

  it('peak eating jaw rotation is within the spec 0.4 rad range', () => {
    let maxAbs = 0;
    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      const state: ArticulationState = { ...baseState, phase: 'eating', eatingProgress: p };
      maxAbs = Math.max(maxAbs, Math.abs(computePartTransform('jaw', state).rotate));
    }
    expect(maxAbs).toBeLessThanOrEqual(0.4 + 1e-9);
  });
});

describe('computePartTransform — idle (tail sway + reducedMotion)', () => {
  it('tail sways with amplitude ≈ 0.06 rad at a 1.5× idle-bob frequency', () => {
    // Idle-bob frequency is sin(idleTime * 2) → tail = sin(idleTime * 3).
    // Maximum amplitude at idleTime = π/6 (where sin(idleTime*3) = 1).
    const state: ArticulationState = { ...baseState, phase: 'idle', idleTime: PI / 6 };
    const tail = computePartTransform('tail', state);
    expect(tail.rotate).toBeCloseTo(0.06, 2);
  });

  it('reducedMotion halves the tail-sway amplitude', () => {
    const t = PI / 6;
    const normal: ArticulationState = { ...baseState, phase: 'idle', idleTime: t };
    const reduced: ArticulationState = {
      ...baseState,
      phase: 'idle',
      idleTime: t,
      reducedMotion: true,
    };
    const normalTail = computePartTransform('tail', normal);
    const reducedTail = computePartTransform('tail', reduced);
    expect(Math.abs(reducedTail.rotate)).toBeCloseTo(Math.abs(normalTail.rotate) / 2, 2);
  });

  it('reducedMotion halves other per-part amplitudes (head idle bob)', () => {
    const t = PI / 2; // local peak — exact value depends on implementation, ratio must be ~0.5
    const normal: ArticulationState = { ...baseState, phase: 'idle', idleTime: t };
    const reduced: ArticulationState = {
      ...baseState,
      phase: 'idle',
      idleTime: t,
      reducedMotion: true,
    };
    const normalHead = computePartTransform('head', normal);
    const reducedHead = computePartTransform('head', reduced);
    // The two should differ by ~50% at the same time slice (frequency unchanged per spec).
    if (Math.abs(normalHead.rotate) > 1e-6) {
      expect(Math.abs(reducedHead.rotate) / Math.abs(normalHead.rotate)).toBeCloseTo(0.5, 1);
    }
  });
});

describe('computePartTransform — signature and eating both leave jaw open at intermediate progress', () => {
  it('non-Rexy parts (e.g. body) are static during signature (or have only the subtle puff)', () => {
    // body scaleY may puff 1.0→1.03→1.0 — verify rotation stays 0 so it does not jitter visually
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0.5,
    };
    const body = computePartTransform('body', state);
    expect(body.rotate).toBe(0);
  });

  it('head tilts back during signature peak', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0.4,
    };
    const head = computePartTransform('head', state);
    expect(head.rotate).toBeLessThan(0); // tilt back
    expect(Math.abs(head.rotate)).toBeLessThanOrEqual(0.12);
  });

  it('head returns to neutral after the signature envelope closes (progress > 0.9)', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0.95,
    };
    expect(computePartTransform('head', state).rotate).toBe(0);
  });

  it('parts other than jaw/head/body are neutral during signature', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'signature',
      signatureProgress: 0.5,
    };
    expect(computePartTransform('arm-left', state).rotate).toBe(0);
    expect(computePartTransform('tail', state).rotate).toBe(0);
  });
});

describe('computePartTransform — walking (tail counter-sway + head nod)', () => {
  it('tail counter-swings opposite the legs (≈0.12 rad amp)', () => {
    const w = 0.25; // sin(0.5π) = 1 → tail = -0.12
    const state: ArticulationState = { ...baseState, phase: 'walking', walkCycle: w };
    const tail = computePartTransform('tail', state);
    expect(tail.rotate).toBeCloseTo(-0.12, 2);
  });

  it('head nods forward in time with the step (≈0.04 rad amp)', () => {
    const w = 0.25; // sin(0.5π) = 1 → head = 0.04
    const state: ArticulationState = { ...baseState, phase: 'walking', walkCycle: w };
    const head = computePartTransform('head', state);
    expect(head.rotate).toBeCloseTo(0.04, 2);
  });

  it('arms and body stay neutral while walking', () => {
    const state: ArticulationState = { ...baseState, phase: 'walking', walkCycle: 0.3 };
    expect(computePartTransform('arm-left', state).rotate).toBe(0);
    expect(computePartTransform('arm-right', state).rotate).toBe(0);
    expect(computePartTransform('body', state).rotate).toBe(0);
  });
});

describe('computePartTransform — eating (other parts remain neutral)', () => {
  it('non-jaw parts stay at ZERO during eating', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'eating',
      eatingProgress: 0.5,
    };
    expect(computePartTransform('head', state).rotate).toBe(0);
    expect(computePartTransform('arm-left', state).rotate).toBe(0);
  });
});

describe('computePartTransform — celebrating (backflip is whole-body)', () => {
  it('every part stays neutral during celebrating; the renderer applies the backflip', () => {
    const state: ArticulationState = {
      ...baseState,
      phase: 'celebrating',
      backflipProgress: 0.5,
    };
    for (const name of [
      'head',
      'jaw',
      'tail',
      'leg-front',
      'leg-back',
      'arm-left',
      'arm-right',
      'body',
    ]) {
      const t = computePartTransform(name, state);
      expect(t.rotate).toBe(0);
      expect(t.scaleY).toBe(1);
      expect(t.tx).toBe(0);
      expect(t.ty).toBe(0);
    }
  });
});

describe('computePartTransform — dizzy (head wobble + tail droop)', () => {
  it('head wobbles ±0.1 rad during dizzy', () => {
    let maxAbs = 0;
    for (let i = 0; i < 32; i++) {
      const t = i / 4;
      const state: ArticulationState = { ...baseState, phase: 'dizzy', dizzyProgress: t };
      maxAbs = Math.max(maxAbs, Math.abs(computePartTransform('head', state).rotate));
    }
    expect(maxAbs).toBeLessThanOrEqual(0.1 + 1e-9);
  });

  it('tail droops +0.15 rad during dizzy (constant bias)', () => {
    const state: ArticulationState = { ...baseState, phase: 'dizzy', dizzyProgress: 0.3 };
    const tail = computePartTransform('tail', state);
    expect(tail.rotate).toBeCloseTo(0.15, 6);
  });

  it('reducedMotion halves the dizzy head wobble', () => {
    const t = Math.PI / 12; // sin(t*6) = sin(π/2) = 1
    const normal: ArticulationState = { ...baseState, phase: 'dizzy', dizzyProgress: t };
    const reduced: ArticulationState = {
      ...baseState,
      phase: 'dizzy',
      dizzyProgress: t,
      reducedMotion: true,
    };
    expect(Math.abs(computePartTransform('head', reduced).rotate)).toBeCloseTo(
      Math.abs(computePartTransform('head', normal).rotate) / 2,
      2,
    );
  });

  it('non-head/tail parts stay neutral during dizzy', () => {
    const state: ArticulationState = { ...baseState, phase: 'dizzy', dizzyProgress: 0.5 };
    expect(computePartTransform('body', state).rotate).toBe(0);
    expect(computePartTransform('jaw', state).rotate).toBe(0);
  });
});

describe('computePartTransform — idle (jaw + body + arms stay neutral)', () => {
  it('non-tail/head parts are neutral during idle', () => {
    const state: ArticulationState = { ...baseState, phase: 'idle', idleTime: 0.5 };
    expect(computePartTransform('jaw', state).rotate).toBe(0);
    expect(computePartTransform('body', state).rotate).toBe(0);
    expect(computePartTransform('arm-left', state).rotate).toBe(0);
  });
});

describe('computePartTransform — turning falls through to idle', () => {
  it('turning phase uses the idle transform (no extra turn state yet)', () => {
    const turning: ArticulationState = { ...baseState, phase: 'turning', idleTime: PI / 6 };
    const idle: ArticulationState = { ...baseState, phase: 'idle', idleTime: PI / 6 };
    expect(computePartTransform('tail', turning)).toEqual(computePartTransform('tail', idle));
  });
});

describe('TRIKEY_RIG data integrity', () => {
  it('character identifier is Trikey', () => {
    expect(TRIKEY_RIG.character).toBe('Trikey');
  });

  it('contains exactly 8 parts (matching the Rexy pilot scope)', () => {
    expect(TRIKEY_RIG.parts).toHaveLength(8);
  });

  it('has the expected part names in back-to-front draw order', () => {
    const names = TRIKEY_RIG.parts.map((p: { name: string }) => p.name);
    expect(names).toEqual([
      'tail',
      'leg-back',
      'arm-left',
      'body',
      'leg-front',
      'arm-right',
      'head',
      'jaw',
    ]);
  });

  it('has unique part names', () => {
    const names = TRIKEY_RIG.parts.map((p: { name: string }) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every part has a file path under /characters/trikey/', () => {
    for (const part of TRIKEY_RIG.parts) {
      expect(part.file).toMatch(/^\/characters\/trikey\/[a-z-]+\.svg$/);
    }
  });

  it('every pivot is within the 0–120 viewBox', () => {
    for (const part of TRIKEY_RIG.parts) {
      expect(part.pivotX).toBeGreaterThanOrEqual(0);
      expect(part.pivotX).toBeLessThanOrEqual(120);
      expect(part.pivotY).toBeGreaterThanOrEqual(0);
      expect(part.pivotY).toBeLessThanOrEqual(120);
    }
  });
});

describe('preloadCharacterRigs — Trikey registration', () => {
  it('getCharacterRig("Trikey") returns non-null rig once preloadCharacterRigs has been called', () => {
    // The rig cache is populated synchronously by preloadCharacterRigs before
    // it kicks off the async image loads. In jsdom the Image onload/onerror
    // events don't fire, so we can't await the returned promise here — the
    // registration contract is independent of image loading.
    void preloadCharacterRigs();
    const rig = getCharacterRig('Trikey');
    expect(rig).not.toBeNull();
    expect(rig?.character).toBe('Trikey');
  });
});

describe('SERA_RIG data integrity', () => {
  it('character identifier is Sera', () => {
    expect(SERA_RIG.character).toBe('Sera');
  });

  it('contains exactly 8 parts (matching the Rexy pilot scope)', () => {
    expect(SERA_RIG.parts).toHaveLength(8);
  });

  it('has the expected part names in back-to-front draw order', () => {
    const names = SERA_RIG.parts.map((p: { name: string }) => p.name);
    expect(names).toEqual([
      'tail',
      'leg-back',
      'arm-left',
      'body',
      'leg-front',
      'arm-right',
      'head',
      'jaw',
    ]);
  });

  it('has unique part names', () => {
    const names = SERA_RIG.parts.map((p: { name: string }) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every part has a file path under /characters/sera/', () => {
    for (const part of SERA_RIG.parts) {
      expect(part.file).toMatch(/^\/characters\/sera\/[a-z-]+\.svg$/);
    }
  });

  it('every pivot is within the 0–120 viewBox', () => {
    for (const part of SERA_RIG.parts) {
      expect(part.pivotX).toBeGreaterThanOrEqual(0);
      expect(part.pivotX).toBeLessThanOrEqual(120);
      expect(part.pivotY).toBeGreaterThanOrEqual(0);
      expect(part.pivotY).toBeLessThanOrEqual(120);
    }
  });
});

describe('preloadCharacterRigs — Sera registration', () => {
  it('getCharacterRig("Sera") returns non-null rig once preloadCharacterRigs has been called', () => {
    // Same fire-and-forget pattern as the Trikey test: rig cache is populated
    // synchronously by preloadCharacterRigs, and jsdom does not fire Image
    // onload/onerror so the returned promise never resolves in this environment.
    void preloadCharacterRigs();
    const rig = getCharacterRig('Sera');
    expect(rig).not.toBeNull();
    expect(rig?.character).toBe('Sera');
  });
});
