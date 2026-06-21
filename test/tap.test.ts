// Tests for tap input module
import { describe, it, expect } from 'vitest';
import { COMMAND_EMOJI, COMMAND_LABELS } from '../src/input/tap';
import type { Command } from '../src/engine/types';

describe('COMMAND_EMOJI', () => {
  it('maps all 4 commands to emoji', () => {
    const commands: Command[] = ['F', 'L', 'R', 'A'];
    for (const cmd of commands) {
      expect(COMMAND_EMOJI[cmd]).toBeTruthy();
      expect(typeof COMMAND_EMOJI[cmd]).toBe('string');
    }
  });

  it('maps F to paw prints', () => {
    expect(COMMAND_EMOJI.F).toBe('🐾');
  });

  it('maps L to left arrow', () => {
    expect(COMMAND_EMOJI.L).toBe('↩️');
  });

  it('maps R to right arrow', () => {
    expect(COMMAND_EMOJI.R).toBe('↪️');
  });

  it('maps A to dino', () => {
    expect(COMMAND_EMOJI.A).toBe('🦕');
  });
});

describe('COMMAND_LABELS', () => {
  it('maps all 4 commands to labels', () => {
    const commands: Command[] = ['F', 'L', 'R', 'A'];
    for (const cmd of commands) {
      expect(COMMAND_LABELS[cmd]).toBeTruthy();
      expect(typeof COMMAND_LABELS[cmd]).toBe('string');
    }
  });

  it('maps F to Forward', () => {
    expect(COMMAND_LABELS.F).toBe('Forward');
  });

  it('maps L to Turn Left', () => {
    expect(COMMAND_LABELS.L).toBe('Turn Left');
  });

  it('maps R to Turn Right', () => {
    expect(COMMAND_LABELS.R).toBe('Turn Right');
  });

  it('maps A to Action', () => {
    expect(COMMAND_LABELS.A).toBe('Action');
  });
});
