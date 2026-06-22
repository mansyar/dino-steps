// Sound effects for DinoSteps
// All sounds are procedurally generated via Web Audio API

import { playTone, playArpeggio } from './synth';
import { getAudioContext } from './context';
import type { DinoCharacter } from '../engine/types';

// Note frequencies (Hz)
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

/**
 * Stomp sound — sine wave sweep 120Hz→20Hz, fast attack, exponential decay. Played on Forward
 * command.
 */
export function playStomp(): void {
  playTone({
    type: 'sine',
    frequencyStart: 120,
    frequencyEnd: 20,
    duration: 0.15,
    gainStart: 0.4,
    gainEnd: 0.001,
  });
}

/** Bonk/dizzy sound — triangle wave with vibrato 400→800Hz. Played on hard failure. */
export function playBonk(): void {
  playTone({
    type: 'triangle',
    frequencyStart: 400,
    frequencyEnd: 800,
    duration: 0.3,
    gainStart: 0.4,
    gainEnd: 0.001,
    vibrato: { depth: 100, rate: 12 },
  });
}

/** Success chime — square wave arpeggio C5→E5→G5→C6. Played on level win. */
export function playSuccess(): void {
  playArpeggio([C5, E5, G5, C6], 0.1, 'square', 0.15);
}

/** Turn sound — quick sine chirp. Played on Left/Right commands. */
export function playTurn(): void {
  playTone({
    type: 'sine',
    frequencyStart: 300,
    frequencyEnd: 500,
    duration: 0.08,
    gainStart: 0.2,
    gainEnd: 0.001,
  });
}

/**
 * Soft resist sound — low muted thud for forgotten 🦕 on interactable exit. Distinct from
 * hard-failure playBonk().
 */
export function playSoftResist(): void {
  playTone({
    type: 'sine',
    frequencyStart: 150,
    frequencyEnd: 100,
    duration: 0.2,
    gainStart: 0.3,
    gainEnd: 0.001,
  });
}

/**
 * Hint sound — ascending two-note chime C5→E5 for food-wiggle hint. Character-agnostic, plays when
 * sequence ends on food without 🦕.
 */
export function playHint(): void {
  playArpeggio([C5, E5], 0.15, 'sine', 0.2);
}

/**
 * Nom-nom eating sound — universal cartoon chomping/chewing sound. Character-agnostic, plays
 * immediately before the success chime in the win sequence (per GDD §8.2). Synthesized as 3 rapid
 * percussive bursts using sine waves.
 */
export function playNomNom(): void {
  const ac = getAudioContext();
  const now = ac.currentTime;

  // 3 quick chomps with slight pitch variation
  const chompFreqs = [180, 220, 200];
  const chompDuration = 0.06;
  const chompGap = 0.08;

  chompFreqs.forEach((freq, i) => {
    const startTime = now + i * (chompDuration + chompGap);

    // Oscillator — quick downward sweep for chomp effect
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + chompDuration);

    // Gain envelope — sharp attack, fast decay
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.35, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + chompDuration);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(startTime);
    osc.stop(startTime + chompDuration);
  });
}

/**
 * Character signature sound — unique per character with two variants: - action variant (clearing
 * interactable): stronger, longer - idle variant (no-op): softer, shorter
 *
 * @param character - The active dinosaur character
 * @param isClearing - True when clearing an interactable, false for no-op
 */
export function playSignature(character: DinoCharacter, isClearing: boolean): void {
  switch (character) {
    case 'Rexy':
      // Rexy: squeaky growls — sawtooth sweep 200→80Hz with vibrato
      if (isClearing) {
        // Action variant: 0.3s, gain 0.4
        playTone({
          type: 'sawtooth',
          frequencyStart: 200,
          frequencyEnd: 80,
          duration: 0.3,
          gainStart: 0.4,
          gainEnd: 0.001,
          vibrato: { depth: 30, rate: 8 },
        });
      } else {
        // Idle variant: 0.15s, gain 0.2
        playTone({
          type: 'sawtooth',
          frequencyStart: 200,
          frequencyEnd: 80,
          duration: 0.15,
          gainStart: 0.2,
          gainEnd: 0.001,
          vibrato: { depth: 30, rate: 8 },
        });
      }
      break;

    case 'Trikey':
      // Trikey: horn-clicking sounds — triangle 400Hz fixed, fast decay
      if (isClearing) {
        // Action variant: 0.2s, gain 0.4
        playTone({
          type: 'triangle',
          frequencyStart: 400,
          frequencyEnd: 400, // Fixed frequency, no sweep
          duration: 0.2,
          gainStart: 0.4,
          gainEnd: 0.001,
        });
      } else {
        // Idle variant: 0.1s, gain 0.2
        playTone({
          type: 'triangle',
          frequencyStart: 400,
          frequencyEnd: 400, // Fixed frequency, no sweep
          duration: 0.1,
          gainStart: 0.2,
          gainEnd: 0.001,
        });
      }
      break;

    case 'Sera':
      // Sera: high-pitched cheerful chirps — ascending sine arpeggios
      if (isClearing) {
        // Action variant: 3-note ascending 800→1000→1200Hz, 0.1s per note, gain 0.3
        playArpeggio([800, 1000, 1200], 0.1, 'sine', 0.3);
      } else {
        // Idle variant: 2-note ascending 800→1000Hz, 0.075s per note, gain 0.15
        playArpeggio([800, 1000], 0.075, 'sine', 0.15);
      }
      break;
  }
}
