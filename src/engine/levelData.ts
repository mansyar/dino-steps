// Level Data Schema and Loader
// Handles parsing and validation of level data

import type { LevelData, Command, Facing, TileType } from './types';

// Valid tile types
const VALID_TILE_TYPES: TileType[] = ['empty', 'obstacle', 'food', 'interactable'];

// Valid commands
const VALID_COMMANDS: Command[] = ['F', 'L', 'R', 'A'];

// Valid facing directions
const VALID_FACINGS: Facing[] = ['E', 'S', 'W', 'N'];

// Grid dimensions
const GRID_WIDTH = 5;
const GRID_HEIGHT = 3;

/**
 * Validate that a value is a valid Command
 */
function isValidCommand(value: unknown): value is Command {
  return typeof value === 'string' && VALID_COMMANDS.includes(value as Command);
}

/**
 * Validate that a value is a valid Facing
 */
function isValidFacing(value: unknown): value is Facing {
  return typeof value === 'string' && VALID_FACINGS.includes(value as Facing);
}

/**
 * Validate that a value is a valid TileType
 */
function isValidTileType(value: unknown): value is TileType {
  return typeof value === 'string' && VALID_TILE_TYPES.includes(value as TileType);
}

/**
 * Parse and validate a single level from JSON data
 */
export function parseLevel(data: unknown): LevelData {
  if (!data || typeof data !== 'object') {
    throw new Error('Level data must be an object');
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (typeof obj.id !== 'number') {
    throw new Error('Level must have a numeric id');
  }
  if (typeof obj.title !== 'string') {
    throw new Error('Level must have a string title');
  }
  if (!Array.isArray(obj.grid) || obj.grid.length !== GRID_HEIGHT) {
    throw new Error(`Level grid must have ${GRID_HEIGHT} rows`);
  }

  // Validate grid dimensions and tile types
  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row = obj.grid[y];
    if (!Array.isArray(row) || row.length !== GRID_WIDTH) {
      throw new Error(`Grid row ${y} must have ${GRID_WIDTH} columns`);
    }
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (!isValidTileType(row[x])) {
        throw new Error(`Invalid tile type at (${x}, ${y}): ${row[x]}`);
      }
    }
  }

  // Validate start position
  if (!obj.start || typeof obj.start !== 'object') {
    throw new Error('Level must have a start position');
  }
  const start = obj.start as { x?: unknown; y?: unknown };
  if (typeof start.x !== 'number' || typeof start.y !== 'number') {
    throw new Error('Start position must have x and y coordinates');
  }
  if (start.x < 0 || start.x >= GRID_WIDTH || start.y < 0 || start.y >= GRID_HEIGHT) {
    throw new Error('Start position is out of grid bounds');
  }

  // Validate start facing
  if (!isValidFacing(obj.startFacing)) {
    throw new Error(`Invalid start facing: ${obj.startFacing}`);
  }

  // Validate food position
  if (!obj.food || typeof obj.food !== 'object') {
    throw new Error('Level must have a food position');
  }
  const food = obj.food as { x?: unknown; y?: unknown };
  if (typeof food.x !== 'number' || typeof food.y !== 'number') {
    throw new Error('Food position must have x and y coordinates');
  }
  if (food.x < 0 || food.x >= GRID_WIDTH || food.y < 0 || food.y >= GRID_HEIGHT) {
    throw new Error('Food position is out of grid bounds');
  }

  // Validate track budget
  if (typeof obj.trackBudget !== 'number' || obj.trackBudget < 1) {
    throw new Error('Level must have a positive track budget');
  }

  // Validate verified solution
  if (!Array.isArray(obj.verifiedSolution) || obj.verifiedSolution.length === 0) {
    throw new Error('Level must have a non-empty verified solution');
  }
  for (const cmd of obj.verifiedSolution) {
    if (!isValidCommand(cmd)) {
      throw new Error(`Invalid command in verified solution: ${cmd}`);
    }
  }

  return {
    id: obj.id,
    title: obj.title,
    grid: obj.grid as TileType[][],
    start: { x: start.x, y: start.y },
    startFacing: obj.startFacing,
    food: { x: food.x, y: food.y },
    trackBudget: obj.trackBudget,
    verifiedSolution: obj.verifiedSolution as Command[],
  };
}

/**
 * Parse and validate an array of levels
 */
export function parseLevels(data: unknown[]): LevelData[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Levels data must be a non-empty array');
  }

  return data.map((item, index) => {
    try {
      return parseLevel(item);
    } catch (error) {
      throw new Error(`Error parsing level at index ${index}: ${error}`);
    }
  });
}
