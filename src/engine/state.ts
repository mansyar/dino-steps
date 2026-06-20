// State Tree Module
// Manages runtime game state and state transitions

import type { GameState, LevelData, Command, DinoCharacter, Facing } from "./types";
import { DIRECTIONS } from "./direction";

/**
 * Create initial game state for a level
 */
export function createInitialState(level: LevelData, character: DinoCharacter): GameState {
  return {
    levelId: level.id,
    dinoPos: { x: level.start.x, y: level.start.y },
    dinoFacing: level.startFacing,
    commandQueue: [],
    activeCommandIndex: -1,
    trackBudget: level.trackBudget,
    clearedInteractables: [],
    isExecuting: false,
  };
}

/**
 * Add a command to the queue if there's budget remaining
 */
export function addCommand(state: GameState, cmd: Command): GameState {
  if (state.commandQueue.length >= state.trackBudget) {
    return state; // Budget exceeded, return unchanged
  }

  return {
    ...state,
    commandQueue: [...state.commandQueue, cmd],
  };
}

/**
 * Remove a command at the specified index
 */
export function removeCommand(state: GameState, index: number): GameState {
  if (index < 0 || index >= state.commandQueue.length) {
    return state; // Invalid index, return unchanged
  }

  const newQueue = [...state.commandQueue];
  newQueue.splice(index, 1);

  return {
    ...state,
    commandQueue: newQueue,
  };
}

/**
 * Advance the active command index
 */
export function advanceIndex(state: GameState): GameState {
  return {
    ...state,
    activeCommandIndex: state.activeCommandIndex + 1,
  };
}

/**
 * Mark an interactable as cleared
 */
export function clearInteractable(state: GameState, tile: { x: number; y: number }): GameState {
  // Check if already cleared
  const alreadyCleared = state.clearedInteractables.some((t) => t.x === tile.x && t.y === tile.y);

  if (alreadyCleared) {
    return state;
  }

  return {
    ...state,
    clearedInteractables: [...state.clearedInteractables, tile],
  };
}

/**
 * Reset dino to start position and clear queue
 */
export function resetToStart(state: GameState, level: LevelData): GameState {
  return {
    ...state,
    dinoPos: { x: level.start.x, y: level.start.y },
    dinoFacing: level.startFacing,
    commandQueue: [],
    activeCommandIndex: -1,
    clearedInteractables: [],
  };
}

/**
 * Set the executing flag
 */
export function setExecuting(state: GameState, executing: boolean): GameState {
  return {
    ...state,
    isExecuting: executing,
  };
}
