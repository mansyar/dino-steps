// Tests for canvas juice — pure animation math helpers
import { describe, it, expect } from 'vitest';
import {
  createShakeState,
  triggerShake,
  updateShake,
  createDustState,
  createSignatureState,
  triggerSignature,
  updateSignature,
  createSoftResistState,
  triggerSoftResist,
  updateSoftResist,
  getSoftResistOffset,
  createFoodGlanceState,
  triggerFoodGlance,
  updateFoodGlance,
} from '../src/render/juice';

describe('Screen Shake', () => {
  it('creates initial state with zero intensity', () => {
    const s = createShakeState();
    expect(s.intensity).toBe(0);
    expect(s.elapsed).toBe(0);
    expect(s.duration).toBe(0);
  });

  it('triggerShake sets intensity and duration', () => {
    const s = createShakeState();
    triggerShake(s, 4, 0.1);
    expect(s.intensity).toBe(4);
    expect(s.duration).toBe(0.1);
    expect(s.elapsed).toBe(0);
  });

  it('updateShake returns zero when inactive', () => {
    const s = createShakeState();
    const offset = updateShake(s, 0.016);
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
  });

  it('updateShake returns non-zero offset while active', () => {
    const s = createShakeState();
    triggerShake(s, 3, 0.08);
    const offset = updateShake(s, 0.01);
    expect(Math.abs(offset.x) + Math.abs(offset.y)).toBeGreaterThan(0);
  });

  it('updateShake decays to zero after duration', () => {
    const s = createShakeState();
    triggerShake(s, 3, 0.08);
    // Simulate enough frames to exceed duration
    for (let i = 0; i < 10; i++) {
      updateShake(s, 0.01);
    }
    const offset = updateShake(s, 0.01);
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
    expect(s.intensity).toBe(0);
  });

  it('reducedMotion scales down shake intensity', () => {
    const s1 = createShakeState();
    const s2 = createShakeState();
    triggerShake(s1, 3, 0.08);
    triggerShake(s2, 3, 0.08);
    const normal = updateShake(s1, 0.01);
    const reduced = updateShake(s2, 0.01, true);
    const normalMag = Math.abs(normal.x) + Math.abs(normal.y);
    const reducedMag = Math.abs(reduced.x) + Math.abs(reduced.y);
    expect(reducedMag).toBeLessThan(normalMag);
  });
});

describe('Dust State', () => {
  it('creates initial state with empty particles', () => {
    const s = createDustState();
    expect(s.particles).toHaveLength(0);
  });
});

describe('Signature Move', () => {
  it('creates initial inactive state', () => {
    const s = createSignatureState();
    expect(s.active).toBe(false);
    expect(s.progress).toBe(0);
  });

  it('triggerSignature activates and sets character', () => {
    const s = createSignatureState();
    triggerSignature(s, 'Sera');
    expect(s.active).toBe(true);
    expect(s.character).toBe('Sera');
    expect(s.progress).toBe(0);
  });

  it('updateSignature returns true while progressing', () => {
    const s = createSignatureState();
    triggerSignature(s, 'Rexy');
    const running = updateSignature(s, 0.1);
    expect(running).toBe(true);
    expect(s.progress).toBeGreaterThan(0);
  });

  it('updateSignature returns false when complete', () => {
    const s = createSignatureState();
    triggerSignature(s, 'Rexy');
    // Run past completion (>0.4s at 2.5x speed = 1.0)
    for (let i = 0; i < 30; i++) {
      updateSignature(s, 0.05);
    }
    expect(s.active).toBe(false);
    expect(s.progress).toBe(1);
  });

  it('updateSignature returns false when not active', () => {
    const s = createSignatureState();
    expect(updateSignature(s, 0.1)).toBe(false);
  });
});

describe('Soft Resist', () => {
  it('creates initial inactive state', () => {
    const s = createSoftResistState();
    expect(s.active).toBe(false);
    expect(s.progress).toBe(0);
  });

  it('triggerSoftResist activates', () => {
    const s = createSoftResistState();
    triggerSoftResist(s);
    expect(s.active).toBe(true);
    expect(s.progress).toBe(0);
  });

  it('updateSoftResist returns true while progressing', () => {
    const s = createSoftResistState();
    triggerSoftResist(s);
    const running = updateSoftResist(s, 0.05);
    expect(running).toBe(true);
  });

  it('updateSoftResist returns false when complete', () => {
    const s = createSoftResistState();
    triggerSoftResist(s);
    // 5x speed, >0.2s = complete
    for (let i = 0; i < 10; i++) {
      updateSoftResist(s, 0.05);
    }
    expect(s.active).toBe(false);
    expect(s.progress).toBe(1);
  });

  it('getSoftResistOffset returns zero when inactive', () => {
    const s = createSoftResistState();
    const offset = getSoftResistOffset(s, 64, 'E');
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
  });

  it('getSoftResistOffset returns non-zero when active', () => {
    const s = createSoftResistState();
    triggerSoftResist(s);
    updateSoftResist(s, 0.05); // advance a bit
    const offset = getSoftResistOffset(s, 64, 'E');
    expect(offset.x).toBeGreaterThan(0); // facing East = positive x
    expect(offset.y).toBe(0);
  });

  it('getSoftResistOffset respects facing direction', () => {
    const s1 = createSoftResistState();
    const s2 = createSoftResistState();
    triggerSoftResist(s1);
    triggerSoftResist(s2);
    updateSoftResist(s1, 0.05);
    updateSoftResist(s2, 0.05);
    const eastOffset = getSoftResistOffset(s1, 64, 'E');
    const westOffset = getSoftResistOffset(s2, 64, 'W');
    expect(eastOffset.x).toBeGreaterThan(0);
    expect(westOffset.x).toBeLessThan(0);
  });

  it('getSoftResistOffset scales with tileSize', () => {
    const s1 = createSoftResistState();
    const s2 = createSoftResistState();
    triggerSoftResist(s1);
    triggerSoftResist(s2);
    updateSoftResist(s1, 0.05);
    updateSoftResist(s2, 0.05);
    const small = getSoftResistOffset(s1, 32, 'E');
    const large = getSoftResistOffset(s2, 64, 'E');
    expect(large.x).toBeGreaterThan(small.x);
  });
});

describe('Food Glance', () => {
  it('creates initial inactive state', () => {
    const s = createFoodGlanceState();
    expect(s.active).toBe(false);
    expect(s.progress).toBe(0);
  });

  it('triggerFoodGlance activates and stores food position', () => {
    const s = createFoodGlanceState();
    triggerFoodGlance(s, 3, 1);
    expect(s.active).toBe(true);
    expect(s.foodX).toBe(3);
    expect(s.foodY).toBe(1);
  });

  it('updateFoodGlance returns true while progressing', () => {
    const s = createFoodGlanceState();
    triggerFoodGlance(s, 3, 1);
    const running = updateFoodGlance(s, 0.1);
    expect(running).toBe(true);
  });

  it('updateFoodGlance returns false when complete', () => {
    const s = createFoodGlanceState();
    triggerFoodGlance(s, 3, 1);
    // 2x speed, >0.5s = complete
    for (let i = 0; i < 10; i++) {
      updateFoodGlance(s, 0.1);
    }
    expect(s.active).toBe(false);
    expect(s.progress).toBe(1);
  });

  it('updateFoodGlance returns false when not active', () => {
    const s = createFoodGlanceState();
    expect(updateFoodGlance(s, 0.1)).toBe(false);
  });
});
