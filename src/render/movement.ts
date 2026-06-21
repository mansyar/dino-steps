// Movement interpolation — smoothstep tweening between grid cells

import { smoothstep, lerp } from './smoothstep';

export type AnimationState = 'idle' | 'walking' | 'turning';

export interface MovementState {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  elapsed: number;
  duration: number;
  animState: AnimationState;
}

const WALK_DURATION = 0.2; // 200ms per step

export function createMovementState(startX: number, startY: number): MovementState {
  return {
    fromX: startX,
    fromY: startY,
    toX: startX,
    toY: startY,
    elapsed: 0,
    duration: WALK_DURATION,
    animState: 'idle',
  };
}

export function startWalk(state: MovementState, toX: number, toY: number): void {
  state.fromX = state.toX;
  state.fromY = state.toY;
  state.toX = toX;
  state.toY = toY;
  state.elapsed = 0;
  state.duration = WALK_DURATION;
  state.animState = 'walking';
}

export function startTurn(state: MovementState): void {
  state.elapsed = 0;
  state.duration = 0.15; // 150ms for turn
  state.animState = 'turning';
}

export function updateMovement(state: MovementState, dt: number): { x: number; y: number } {
  if (state.animState === 'idle') {
    return { x: state.toX, y: state.toY };
  }

  state.elapsed = Math.min(state.elapsed + dt, state.duration);
  const t = smoothstep(state.elapsed / state.duration);

  if (state.animState === 'walking') {
    if (state.elapsed >= state.duration) {
      state.animState = 'idle';
    }
    return {
      x: lerp(state.fromX, state.toX, t),
      y: lerp(state.fromY, state.toY, t),
    };
  }

  // turning — stay at current position
  if (state.elapsed >= state.duration) {
    state.animState = 'idle';
  }
  return { x: state.toX, y: state.toY };
}

export function isIdle(state: MovementState): boolean {
  return state.animState === 'idle';
}
