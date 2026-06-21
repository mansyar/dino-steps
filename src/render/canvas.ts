// Canvas2D context setup with DPI scaling and resize handling

export interface CanvasContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}

let canvasCtx: CanvasContext | null = null;

export function initCanvas(canvasId = 'gameCanvas'): CanvasContext {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) throw new Error(`Canvas element #${canvasId} not found`);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');

  canvasCtx = { canvas, ctx, width: 0, height: 0, dpr: 1 };
  handleResize();

  window.addEventListener('resize', handleResize);

  return canvasCtx;
}

export function getCanvasContext(): CanvasContext {
  if (!canvasCtx) throw new Error('Canvas not initialized. Call initCanvas() first.');
  return canvasCtx;
}

function handleResize(): void {
  if (!canvasCtx) return;

  const { canvas, ctx } = canvasCtx;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  canvasCtx.width = rect.width;
  canvasCtx.height = rect.height;
  canvasCtx.dpr = dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
