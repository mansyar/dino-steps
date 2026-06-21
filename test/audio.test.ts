// Tests for audio system
// Web Audio API isn't available in vitest (Node.js), so we test structure and exports

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Web Audio API — AudioContext must be a constructor
const mockOscillator = {
  type: 'sine',
  frequency: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    value: 0,
  },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    value: 0,
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGainNode })),
};

// Use a class so `new AudioContext()` works
vi.stubGlobal(
  'AudioContext',
  class {
    constructor() {
      Object.assign(this, mockAudioContext);
    }
  },
);

describe('audio context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports getAudioContext', async () => {
    const mod = await import('../src/audio/context');
    expect(typeof mod.getAudioContext).toBe('function');
  });

  it('returns an AudioContext instance', async () => {
    vi.resetModules();
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          Object.assign(this, mockAudioContext);
        }
      },
    );
    const mod = await import('../src/audio/context');
    const ctx = mod.getAudioContext();
    expect(ctx).toBeDefined();
  });
});

describe('synth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports playTone and playArpeggio', async () => {
    const mod = await import('../src/audio/synth');
    expect(typeof mod.playTone).toBe('function');
    expect(typeof mod.playArpeggio).toBe('function');
  });
});

describe('sfx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports all sound effect functions', async () => {
    const mod = await import('../src/audio/sfx');
    expect(typeof mod.playStomp).toBe('function');
    expect(typeof mod.playBonk).toBe('function');
    expect(typeof mod.playSuccess).toBe('function');
    expect(typeof mod.playTurn).toBe('function');
    expect(typeof mod.playAction).toBe('function');
  });
});
