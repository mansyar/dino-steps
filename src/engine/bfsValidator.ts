// BFS Level Validator
// Validates solutions and computes minimum solution lengths using BFS

import type { LevelData, Command, Direction } from "./types";
import { DIRECTIONS, forward, turnLeft, turnRight } from "./direction";

// Result types for solution replay
export type ReplayResult = "win" | "fail" | "incomplete";

// Grid dimensions
const GRID_WIDTH = 5;
const GRID_HEIGHT = 3;

// State for BFS
interface BFSState {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

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
  return grid[y][x] === "obstacle";
}

/**
 * Check if a tile is food
 */
function isFood(grid: string[][], x: number, y: number): boolean {
  return grid[y][x] === "food";
}

/**
 * Replay a solution and determine the result
 */
export function replaySolution(level: LevelData, commands: Command[]): ReplayResult {
  let x = level.start.x;
  let y = level.start.y;
  let dir = DIRECTIONS[level.startFacing];

  for (const cmd of commands) {
    switch (cmd) {
      case "F": {
        const next = forward({ x, y }, dir);
        // Check bounds
        if (!isInBounds(next.x, next.y)) {
          return "fail";
        }
        // Check obstacle
        if (isObstacle(level.grid, next.x, next.y)) {
          return "fail";
        }
        // Move forward
        x = next.x;
        y = next.y;
        break;
      }
      case "L": {
        dir = turnLeft(dir);
        break;
      }
      case "R": {
        dir = turnRight(dir);
        break;
      }
      case "A": {
        // Action: check if on food
        if (isFood(level.grid, x, y)) {
          return "win";
        }
        // Otherwise no-op
        break;
      }
    }
  }

  // After all commands, check if on food (incomplete - no action used)
  if (isFood(level.grid, x, y)) {
    return "incomplete";
  }

  return "incomplete";
}

/**
 * Compute minimum solution length using BFS
 */
export function computeMinimum(level: LevelData): number {
  // BFS to find shortest path to food
  const queue: { state: BFSState; steps: number }[] = [];
  const visited = new Set<string>();

  const startState: BFSState = {
    x: level.start.x,
    y: level.start.y,
    dx: DIRECTIONS[level.startFacing].dx,
    dy: DIRECTIONS[level.startFacing].dy,
  };

  queue.push({ state: startState, steps: 0 });
  visited.add(`${startState.x},${startState.y},${startState.dx},${startState.dy}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { state, steps } = current;

    // Check if on food (need to add action step)
    if (isFood(level.grid, state.x, state.y)) {
      return steps + 1; // +1 for the action command
    }

    // Try all possible commands
    const commands: Command[] = ["F", "L", "R"];

    for (const cmd of commands) {
      let newState = { ...state };

      switch (cmd) {
        case "F": {
          const next = forward({ x: state.x, y: state.y }, { dx: state.dx, dy: state.dy });
          if (isInBounds(next.x, next.y) && !isObstacle(level.grid, next.x, next.y)) {
            newState.x = next.x;
            newState.y = next.y;
          } else {
            continue; // Skip invalid moves
          }
          break;
        }
        case "L": {
          const turned = turnLeft({ dx: state.dx, dy: state.dy });
          newState.dx = turned.dx;
          newState.dy = turned.dy;
          break;
        }
        case "R": {
          const turned = turnRight({ dx: state.dx, dy: state.dy });
          newState.dx = turned.dx;
          newState.dy = turned.dy;
          break;
        }
      }

      const key = `${newState.x},${newState.y},${newState.dx},${newState.dy}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ state: newState, steps: steps + 1 });
      }
    }
  }

  // No path found (shouldn't happen for valid levels)
  return -1;
}
