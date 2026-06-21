// Sound effects for DinoSteps
// All sounds are procedurally generated via Web Audio API

import { playTone, playArpeggio } from "./synth";

// Note frequencies (Hz)
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

/**
 * Stomp sound — sine wave sweep 120Hz→20Hz, fast attack, exponential decay.
 * Played on Forward command.
 */
export function playStomp(): void {
  playTone({
    type: "sine",
    frequencyStart: 120,
    frequencyEnd: 20,
    duration: 0.15,
    gainStart: 0.4,
    gainEnd: 0.001,
  });
}

/**
 * Bonk/dizzy sound — triangle wave with vibrato 400→800Hz.
 * Played on hard failure.
 */
export function playBonk(): void {
  playTone({
    type: "triangle",
    frequencyStart: 400,
    frequencyEnd: 800,
    duration: 0.3,
    gainStart: 0.4,
    gainEnd: 0.001,
    vibrato: { depth: 100, rate: 12 },
  });
}

/**
 * Success chime — square wave arpeggio C5→E5→G5→C6.
 * Played on level win.
 */
export function playSuccess(): void {
  playArpeggio([C5, E5, G5, C6], 0.1, "square", 0.15);
}

/**
 * Turn sound — quick sine chirp.
 * Played on Left/Right commands.
 */
export function playTurn(): void {
  playTone({
    type: "sine",
    frequencyStart: 300,
    frequencyEnd: 500,
    duration: 0.08,
    gainStart: 0.2,
    gainEnd: 0.001,
  });
}

/**
 * Action/no-op sound — soft "boop".
 * Played on Action command (clear/no-op).
 */
export function playAction(): void {
  playTone({
    type: "sine",
    frequencyStart: 600,
    frequencyEnd: 400,
    duration: 0.1,
    gainStart: 0.2,
    gainEnd: 0.001,
  });
}

/**
 * Clear sound — rising tone.
 * Played when interactable is cleared.
 */
export function playClear(): void {
  playTone({
    type: "triangle",
    frequencyStart: 300,
    frequencyEnd: 800,
    duration: 0.15,
    gainStart: 0.3,
    gainEnd: 0.001,
  });
}

/**
 * Signature sound per character.
 * Rexy: low growl sweep. Trikey: snort + horn click. Sera: high chirp.
 */
export function playSignature(character: "Rexy" | "Trikey" | "Sera"): void {
  switch (character) {
    case "Rexy":
      // Low growl sweep 80→150Hz
      playTone({
        type: "sawtooth",
        frequencyStart: 80,
        frequencyEnd: 150,
        duration: 0.25,
        gainStart: 0.15,
        gainEnd: 0.001,
      });
      break;
    case "Trikey": {
      // Snort + horn click
      playTone({
        type: "triangle",
        frequencyStart: 200,
        frequencyEnd: 100,
        duration: 0.15,
        gainStart: 0.3,
        gainEnd: 0.001,
      });
      // Horn click — short high ping
      setTimeout(() => {
        playTone({
          type: "sine",
          frequencyStart: 1200,
          frequencyEnd: 800,
          duration: 0.05,
          gainStart: 0.2,
          gainEnd: 0.001,
        });
      }, 80);
      break;
    }
    case "Sera": {
      // High chirp 1000→1500Hz
      playTone({
        type: "sine",
        frequencyStart: 1000,
        frequencyEnd: 1500,
        duration: 0.12,
        gainStart: 0.2,
        gainEnd: 0.001,
      });
      // Wing woosh — filtered noise-like sweep
      setTimeout(() => {
        playTone({
          type: "triangle",
          frequencyStart: 600,
          frequencyEnd: 200,
          duration: 0.1,
          gainStart: 0.15,
          gainEnd: 0.001,
        });
      }, 60);
      break;
    }
  }
}
