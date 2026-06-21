// requestAnimationFrame render loop with delta-time and start/stop controls

export type RenderCallback = (dt: number) => void;

let rafId = 0;
let lastTime = 0;
let running = false;
let renderFn: RenderCallback | null = null;

export function startLoop(callback: RenderCallback): void {
  if (running) return;
  renderFn = callback;
  running = true;
  lastTime = performance.now();
  rafId = requestAnimationFrame(tick);
}

export function stopLoop(): void {
  if (!running) return;
  cancelAnimationFrame(rafId);
  running = false;
  renderFn = null;
}

export function isRunning(): boolean {
  return running;
}

function tick(now: number): void {
  if (!running || !renderFn) return;

  const dt = Math.min((now - lastTime) / 1000, 0.1); // cap at 100ms
  lastTime = now;

  renderFn(dt);

  rafId = requestAnimationFrame(tick);
}
