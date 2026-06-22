// Tile Classification Helpers
// Utility functions to classify tile sub-types into categories

import type { TileType } from './types';

/** Check if a tile is an obstacle (rock or mud) */
export function isObstacle(tile: TileType): boolean {
  return tile === 'rock' || tile === 'mud';
}

/** Check if a tile is food (berry, leaf, or cookie) */
export function isFood(tile: TileType): boolean {
  return tile === 'berry' || tile === 'leaf' || tile === 'cookie';
}

/** Check if a tile is an interactable (turtle or grass) */
export function isInteractable(tile: TileType): boolean {
  return tile === 'turtle' || tile === 'grass';
}
