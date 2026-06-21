// Web Audio API context — lazy-init on first user interaction
// Mobile browsers block AudioContext creation until a user gesture

let ctx: AudioContext | null = null;

/**
 * Get or create the AudioContext.
 * Only creates on first call (must be triggered by user gesture).
 * Resumes if suspended.
 */
export function getAudioContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (e.g., after mobile autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/**
 * Resume the AudioContext if it exists and is suspended.
 * Safe to call anytime — won't create a new context.
 */
export function resumeAudioContext(): void {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}
