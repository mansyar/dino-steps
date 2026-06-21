// Direction Vector Module
// Handles movement directions and rotations using integer vectors

import type { Direction, Facing } from "./types";

// Direction vectors for each facing direction
export const DIRECTIONS: Record<Facing, Direction> = {
  E: { dx: 1, dy: 0 }, // East: right
  S: { dx: 0, dy: 1 }, // South: down
  W: { dx: -1, dy: 0 }, // West: left
  N: { dx: 0, dy: -1 }, // North: up
};

// Convert facing direction to direction vector
export function facingToVector(facing: Facing): Direction {
  return DIRECTIONS[facing];
}

// Move position forward in the given direction
export function forward(pos: { x: number; y: number }, dir: Direction): { x: number; y: number } {
  return {
    x: pos.x + dir.dx,
    y: pos.y + dir.dy,
  };
}

// Turn left (counter-clockwise): (dx, dy) → (dy, -dx)
// Explicit 0 guards prevent -0 (vitest toEqual treats -0 !== +0)
export function turnLeft(dir: Direction): Direction {
  return {
    dx: dir.dy === 0 ? 0 : dir.dy,
    dy: dir.dx === 0 ? 0 : -dir.dx,
  };
}

// Turn right (clockwise): (dx, dy) → (-dy, dx)
export function turnRight(dir: Direction): Direction {
  return {
    dx: dir.dy === 0 ? 0 : -dir.dy,
    dy: dir.dx === 0 ? 0 : dir.dx,
  };
}
