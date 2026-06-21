// Tests for tap input module
import { describe, it, expect } from 'vitest';
import { COMMAND_EMOJI, COMMAND_LABELS, animateLastSlot } from '../src/input/tap';
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

describe('animateLastSlot', () => {
  it('adds track-slot--add class to the last filled slot', () => {
    const track = document.createElement('div');
    track.className = 'track';

    // Create 3 slots, first 2 filled
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement('div');
      slot.className = i < 2 ? 'track-slot track-slot--filled' : 'track-slot';
      track.appendChild(slot);
    }

    animateLastSlot(track, 2);

    const slots = track.querySelectorAll('.track-slot');
    expect(slots[0].classList.contains('track-slot--add')).toBe(false);
    expect(slots[1].classList.contains('track-slot--add')).toBe(true);
    expect(slots[2].classList.contains('track-slot--add')).toBe(false);
  });

  it('does nothing when track has no filled slots', () => {
    const track = document.createElement('div');
    track.className = 'track';
    const slot = document.createElement('div');
    slot.className = 'track-slot';
    track.appendChild(slot);

    animateLastSlot(track, 0);

    expect(slot.classList.contains('track-slot--add')).toBe(false);
  });

  it('handles commandCount exceeding available slots', () => {
    const track = document.createElement('div');
    const slot = document.createElement('div');
    slot.className = 'track-slot';
    track.appendChild(slot);

    // Should not throw
    animateLastSlot(track, 5);
    expect(slot.classList.contains('track-slot--add')).toBe(false);
  });
});
