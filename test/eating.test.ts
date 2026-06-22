import { describe, it, expect } from 'vitest';
import {
  createEatingState,
  triggerEating,
  updateEating,
  resetEating,
  activeProgress,
} from '../src/render/juice';

describe('createEatingState', () => {
  it('starts inactive with zero progress', () => {
    const state = createEatingState();
    expect(state.active).toBe(false);
    expect(state.progress).toBe(0);
  });

  it('returns independent state instances', () => {
    const a = createEatingState();
    const b = createEatingState();
    triggerEating(a);
    expect(a.active).toBe(true);
    expect(b.active).toBe(false);
  });
});

describe('triggerEating', () => {
  it('activates the state and zeroes progress', () => {
    const state = createEatingState();
    state.progress = 0.7;
    triggerEating(state);
    expect(state.active).toBe(true);
    expect(state.progress).toBe(0);
  });

  it('is idempotent — re-triggering restarts from zero', () => {
    const state = createEatingState();
    triggerEating(state);
    updateEating(state, 0.1);
    updateEating(state, 0.1);
    expect(state.progress).toBeGreaterThan(0);
    triggerEating(state);
    expect(state.progress).toBe(0);
    expect(state.active).toBe(true);
  });
});

describe('updateEating', () => {
  it('advances progress 0→1 over the 0.4s duration', () => {
    const state = createEatingState();
    triggerEating(state);
    updateEating(state, 0.2);
    expect(state.progress).toBeCloseTo(0.5, 5);
    expect(state.active).toBe(true);
    updateEating(state, 0.2);
    expect(state.progress).toBe(1);
    expect(state.active).toBe(false);
  });

  it('clamps to 1 on overshoot', () => {
    const state = createEatingState();
    triggerEating(state);
    updateEating(state, 10); // way more than duration
    expect(state.progress).toBe(1);
    expect(state.active).toBe(false);
  });

  it('is a no-op when inactive', () => {
    const state = createEatingState();
    const ran = updateEating(state, 0.1);
    expect(ran).toBe(false);
    expect(state.progress).toBe(0);
  });

  it('returns false once it finishes', () => {
    const state = createEatingState();
    triggerEating(state);
    updateEating(state, 1);
    expect(state.active).toBe(false);
    const ran = updateEating(state, 0.1);
    expect(ran).toBe(false);
    expect(state.progress).toBe(1);
  });
});

describe('resetEating', () => {
  it('clears progress and deactivates', () => {
    const state = createEatingState();
    triggerEating(state);
    updateEating(state, 0.1);
    resetEating(state);
    expect(state.progress).toBe(0);
    expect(state.active).toBe(false);
  });
});

describe('activeProgress', () => {
  it('returns -1 when state is inactive', () => {
    const state = { active: false, progress: 0.5 };
    expect(activeProgress(state)).toBe(-1);
  });

  it('returns progress when state is active', () => {
    const state = { active: true, progress: 0.42 };
    expect(activeProgress(state)).toBe(0.42);
  });

  it('returns -1 for fresh state (matches drawDino no-op default)', () => {
    expect(activeProgress(createEatingState())).toBe(-1);
  });
});
