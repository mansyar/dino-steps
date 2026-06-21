// Base synthesizer helpers for Web Audio API oscillators + gain envelopes

import { getAudioContext } from './context';

export interface SynthOptions {
  type: OscillatorType;
  frequencyStart: number;
  frequencyEnd: number;
  duration: number;
  gainStart: number;
  gainEnd: number;
  /** Optional vibrato: { depth, rate } in Hz */
  vibrato?: { depth: number; rate: number };
}

/**
 * Play a single synthesized tone with frequency sweep and gain envelope.
 */
export function playTone(opts: SynthOptions): void {
  const ac = getAudioContext();
  const now = ac.currentTime;

  // Oscillator
  const osc = ac.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.frequencyStart, now);
  if (opts.frequencyEnd !== opts.frequencyStart) {
    osc.frequency.linearRampToValueAtTime(opts.frequencyEnd, now + opts.duration);
  }

  // Vibrato (LFO on frequency)
  if (opts.vibrato) {
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = opts.vibrato.rate;
    lfoGain.gain.value = opts.vibrato.depth;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + opts.duration);
  }

  // Gain envelope
  const gain = ac.createGain();
  gain.gain.setValueAtTime(opts.gainStart, now);
  if (opts.gainEnd !== opts.gainStart) {
    gain.gain.exponentialRampToValueAtTime(Math.max(opts.gainEnd, 0.001), now + opts.duration);
  }

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + opts.duration);
}

/**
 * Play a rapid arpeggio of notes.
 */
export function playArpeggio(
  notes: number[],
  noteDuration: number,
  type: OscillatorType,
  gainValue: number,
): void {
  const ac = getAudioContext();
  const now = ac.currentTime;

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(gainValue, now + i * noteDuration);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * noteDuration + noteDuration);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now + i * noteDuration);
    osc.stop(now + i * noteDuration + noteDuration);
  });
}
