// Command Execution Engine
// Processes command queue with two-tier failure model and win detection

import type { GameState, LevelData, Facing } from './types';
import { forward, turnLeft, turnRight, DIRECTIONS } from './direction';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

// Execution result types
export type CommandResult =
  | { type: 'continue' }
  | { type: 'win' }
  | { type: 'hardFail' }
  | { type: 'softResist' };

// Terminal state result
export type TerminalResult = { type: 'win' } | { type: 'idle' } | { type: 'hint' };

/**
 * Check if a position is within grid bounds
 */
function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

/**
 * Check if a tile is an obstacle
 */
function isObstacle(grid: string[][], x: number, y: number): boolean {
  return grid[y][x] === 'obstacle';
}

/**
 * Check if a tile is food
 */
function isFood(grid: string[][], x: number, y: number): boolean {
  return grid[y][x] === 'food';
}

/**
 * Check if a tile is an interactable
 */
function isInteractable(grid: string[][], x: number, y: number): boolean {
  return grid[y][x] === 'interactable';
}

/**
 * Check if an interactable tile has been cleared
 */
function isCleared(
  clearedInteractables: { x: number; y: number }[],
  x: number,
  y: number,
): boolean {
  return clearedInteractables.some((t) => t.x === x && t.y === y);
}

/**
 * Check if the current tile is an uncleared interactable
 */
function isUnclearedInteractable(
  grid: string[][],
  clearedInteractables: { x: number; y: number }[],
  x: number,
  y: number,
): boolean {
  return isInteractable(grid, x, y) && !isCleared(clearedInteractables, x, y);
}

/**
 * Process Forward command
 */
export function forwardCommand(state: GameState, level: LevelData): CommandResult {
  const dir = DIRECTIONS[state.dinoFacing];
  const next = forward(state.dinoPos, dir);

  // Check bounds
  if (!isInBounds(next.x, next.y)) {
    return { type: 'hardFail' };
  }

  // Check obstacle
  if (isObstacle(level.grid, next.x, next.y)) {
    return { type: 'hardFail' };
  }

  // Check uncleared interactable at CURRENT position (exiting)
  if (
    isUnclearedInteractable(
      level.grid,
      state.clearedInteractables,
      state.dinoPos.x,
      state.dinoPos.y,
    )
  ) {
    return { type: 'softResist' };
  }

  // Valid move
  return { type: 'continue' };
}

/**
 * Apply Forward command to state (after validation)
 */
export function applyForward(state: GameState): GameState {
  const dir = DIRECTIONS[state.dinoFacing];
  const next = forward(state.dinoPos, dir);
  return {
    ...state,
    dinoPos: next,
    activeCommandIndex: state.activeCommandIndex + 1,
  };
}

/**
 * Process Left command
 */
export function leftCommand(): CommandResult {
  return { type: 'continue' };
}

/**
 * Apply Left command to state
 */
export function applyLeft(state: GameState): GameState {
  const newFacing = facingToDirection(turnLeft(DIRECTIONS[state.dinoFacing]));
  return {
    ...state,
    dinoFacing: newFacing,
    activeCommandIndex: state.activeCommandIndex + 1,
  };
}

/**
 * Process Right command
 */
export function rightCommand(): CommandResult {
  return { type: 'continue' };
}

/**
 * Apply Right command to state
 */
export function applyRight(state: GameState): GameState {
  const newFacing = facingToDirection(turnRight(DIRECTIONS[state.dinoFacing]));
  return {
    ...state,
    dinoFacing: newFacing,
    activeCommandIndex: state.activeCommandIndex + 1,
  };
}

/**
 * Process Action (🦕) command
 */
export function actionCommand(state: GameState, level: LevelData): CommandResult {
  const { x, y } = state.dinoPos;

  // On food → win
  if (isFood(level.grid, x, y)) {
    return { type: 'win' };
  }

  // On uncleared interactable → clear (continue)
  if (isUnclearedInteractable(level.grid, state.clearedInteractables, x, y)) {
    return { type: 'continue' };
  }

  // On cleared interactable or empty → no-op (continue)
  return { type: 'continue' };
}

/**
 * Apply Action command to state (after validation)
 */
export function applyAction(state: GameState, level: LevelData): GameState {
  const { x, y } = state.dinoPos;

  // On uncleared interactable → clear it
  if (isUnclearedInteractable(level.grid, state.clearedInteractables, x, y)) {
    return {
      ...state,
      clearedInteractables: [...state.clearedInteractables, { x, y }],
      activeCommandIndex: state.activeCommandIndex + 1,
    };
  }

  // All other cases → advance index
  return {
    ...state,
    activeCommandIndex: state.activeCommandIndex + 1,
  };
}

/**
 * Process a single command and return the result type
 */
export function processNextCommand(state: GameState, level: LevelData): CommandResult {
  const cmd = state.commandQueue[state.activeCommandIndex];
  if (!cmd) {
    return { type: 'continue' };
  }

  switch (cmd) {
    case 'F':
      return forwardCommand(state, level);
    case 'L':
      return leftCommand();
    case 'R':
      return rightCommand();
    case 'A':
      return actionCommand(state, level);
  }
}

/**
 * Apply a command to state (after validation passes)
 */
export function applyCommand(state: GameState, level: LevelData): GameState {
  const cmd = state.commandQueue[state.activeCommandIndex];
  if (!cmd) {
    return state;
  }

  switch (cmd) {
    case 'F':
      return applyForward(state);
    case 'L':
      return applyLeft(state);
    case 'R':
      return applyRight(state);
    case 'A':
      return applyAction(state, level);
  }
}

/**
 * Reset dino to start position (hard failure)
 */
export function hardFail(state: GameState, level: LevelData): GameState {
  return {
    ...state,
    dinoPos: { x: level.start.x, y: level.start.y },
    dinoFacing: level.startFacing,
    commandQueue: [],
    activeCommandIndex: -1,
    clearedInteractables: [],
    isExecuting: false,
  };
}

/**
 * Check terminal state after queue exhaustion
 */
export function checkTerminalState(state: GameState, level: LevelData): TerminalResult {
  const { x, y } = state.dinoPos;

  // On food without action → hint
  if (isFood(level.grid, x, y)) {
    return { type: 'hint' };
  }

  // Not on food → idle
  return { type: 'idle' };
}

/**
 * Execute the full command queue (called by GO button)
 * Returns the final state and terminal result
 */
export function executeQueue(
  state: GameState,
  level: LevelData,
): { state: GameState; result: TerminalResult } {
  let current = { ...state, isExecuting: true, activeCommandIndex: 0 };

  while (
    current.activeCommandIndex >= 0 &&
    current.activeCommandIndex < current.commandQueue.length
  ) {
    const result = processNextCommand(current, level);

    switch (result.type) {
      case 'win': {
        // Win → return immediately
        return {
          state: { ...current, isExecuting: false },
          result: { type: 'win' },
        };
      }
      case 'hardFail': {
        // Hard failure → reset
        return {
          state: hardFail(current, level),
          result: { type: 'idle' },
        };
      }
      case 'softResist': {
        // Soft resist → advance index, continue
        current = {
          ...current,
          activeCommandIndex: current.activeCommandIndex + 1,
        };
        break;
      }
      case 'continue': {
        // Continue → apply command, advance index
        current = applyCommand(current, level);
        break;
      }
    }
  }

  // Queue exhausted → check terminal state
  return {
    state: { ...current, isExecuting: false },
    result: checkTerminalState(current, level),
  };
}

/**
 * Helper: convert Direction to Facing
 */
function facingToDirection(dir: { dx: number; dy: number }): Facing {
  if (dir.dx === 1) return 'E';
  if (dir.dy === 1) return 'S';
  if (dir.dx === -1) return 'W';
  return 'N';
}
