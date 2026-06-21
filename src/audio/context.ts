// Web Audio API context — lazy-init on first user interaction
// Mobile browsers block AudioContext creation until a user gesture

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (e.g., after mobile autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function isAudioMuted(): boolean {
  // Checked at call site; this module doesn't hold mute state
  return false;
}
