// BFS Level Validator
// Validates solutions and computes minimum solution lengths using BFS

import type { LevelData, Command, TileType } from './types';
import { DIRECTIONS, forward, turnLeft, turnRight } from './direction';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';
import {
  isObstacle as isObstacleTile,
  isFood as isFoodTile,
  isInteractable as isInteractableTile,
} from './tileUtils';

// Result types for solution replay
export type ReplayResult = 'win' | 'fail' | 'incomplete';

// State for BFS
interface BFSState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  cleared: string[]; // Track cleared interactable coordinates
}

/** Check if a position is within grid bounds */
function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

/** Check if a tile is an obstacle */
function isObstacle(grid: string[][], x: number, y: number): boolean {
  return isObstacleTile(grid[y][x] as TileType);
}

/** Check if a tile is food */
function isFood(grid: string[][], x: number, y: number): boolean {
  return isFoodTile(grid[y][x] as TileType);
}

/** Check if a tile is an interactable */
function isInteractable(grid: string[][], x: number, y: number): boolean {
  return isInteractableTile(grid[y][x] as TileType);
}

/** Check if an interactable tile has been cleared */
function isCleared(clearedInteractables: string[], x: number, y: number): boolean {
  return clearedInteractables.includes(`${x},${y}`);
}

/** Check if the current tile is an uncleared interactable */
function isUnclearedInteractable(
  grid: string[][],
  clearedInteractables: string[],
  x: number,
  y: number,
): boolean {
  return isInteractable(grid, x, y) && !isCleared(clearedInteractables, x, y);
}

/** Replay a solution and determine the result */
export function replaySolution(level: LevelData, commands: Command[]): ReplayResult {
  let x = level.start.x;
  let y = level.start.y;
  let dir = DIRECTIONS[level.startFacing];
  const clearedInteractables: string[] = [];

  for (const cmd of commands) {
    switch (cmd) {
      case 'F': {
        const next = forward({ x, y }, dir);
        // Check bounds — soft-resist (stay in place, consume command)
        if (!isInBounds(next.x, next.y)) {
          break;
        }
        // Check obstacle — soft-resist (stay in place, consume command)
        if (isObstacle(level.grid, next.x, next.y)) {
          break;
        }
        // Check uncleared interactable at CURRENT position (exiting) — fail (invalid solution)
        if (isUnclearedInteractable(level.grid, clearedInteractables, x, y)) {
          return 'fail';
        }
        // Move forward
        x = next.x;
        y = next.y;
        break;
      }
      case 'L': {
        dir = turnLeft(dir);
        break;
      }
      case 'R': {
        dir = turnRight(dir);
        break;
      }
      case 'A': {
        // On food → win
        if (isFood(level.grid, x, y)) {
          return 'win';
        }
        // On uncleared interactable → clear it
        if (isUnclearedInteractable(level.grid, clearedInteractables, x, y)) {
          clearedInteractables.push(`${x},${y}`);
        }
        // On cleared interactable or empty → no-op
        break;
      }
    }
  }

  // After all commands, not on food with action → incomplete
  return 'incomplete';
}

/** Compute minimum solution length using BFS */
export function computeMinimum(level: LevelData): number {
  // BFS to find shortest path to food
  const queue: { state: BFSState; steps: number }[] = [];
  const visited = new Set<string>();

  const startState: BFSState = {
    x: level.start.x,
    y: level.start.y,
    dx: DIRECTIONS[level.startFacing].dx,
    dy: DIRECTIONS[level.startFacing].dy,
    cleared: [],
  };

  const startKey = `${startState.x},${startState.y},${startState.dx},${startState.dy},`;
  queue.push({ state: startState, steps: 0 });
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { state, steps } = current;

    // Check if on food (need to add action step)
    if (isFood(level.grid, state.x, state.y)) {
      return steps + 1; // +1 for the action command
    }

    // Try all possible commands: F, L, R, A
    const commands: Command[] = ['F', 'L', 'R', 'A'];

    for (const cmd of commands) {
      let newState = { ...state, cleared: [...state.cleared] };

      switch (cmd) {
        case 'F': {
          // Can't move forward from uncleared interactable
          if (isUnclearedInteractable(level.grid, newState.cleared, state.x, state.y)) {
            continue; // Soft-resist: skip this move
          }
          const next = forward({ x: state.x, y: state.y }, { dx: state.dx, dy: state.dy });
          if (isInBounds(next.x, next.y) && !isObstacle(level.grid, next.x, next.y)) {
            newState.x = next.x;
            newState.y = next.y;
          } else {
            continue; // Skip invalid moves
          }
          break;
        }
        case 'L': {
          const turned = turnLeft({ dx: state.dx, dy: state.dy });
          newState.dx = turned.dx;
          newState.dy = turned.dy;
          break;
        }
        case 'R': {
          const turned = turnRight({ dx: state.dx, dy: state.dy });
          newState.dx = turned.dx;
          newState.dy = turned.dy;
          break;
        }
        case 'A': {
          // On food → win (handled by the check at the top of the loop)
          // On uncleared interactable → clear it
          if (isUnclearedInteractable(level.grid, newState.cleared, state.x, state.y)) {
            newState.cleared.push(`${state.x},${state.y}`);
          }
          // On cleared interactable or empty → no-op (advance step)
          break;
        }
      }

      // Include cleared state in visited key to avoid infinite loops
      const clearedKey = [...newState.cleared].sort().join(';');
      const key = `${newState.x},${newState.y},${newState.dx},${newState.dy},${clearedKey}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ state: newState, steps: steps + 1 });
      }
    }
  }

  // No path found (shouldn't happen for valid levels)
  return -1;
}
