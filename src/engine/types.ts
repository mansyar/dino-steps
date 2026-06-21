// DinoSteps Core Types
// Type definitions for the game engine

// Command types for the track
export type Command = 'F' | 'L' | 'R' | 'A';

// Direction vectors for movement
export interface Direction {
  dx: number;
  dy: number;
}

// Facing directions
export type Facing = 'E' | 'S' | 'W' | 'N';

// Tile types on the grid
export type TileType = 'empty' | 'obstacle' | 'food' | 'interactable';

// Dino character selection
export type DinoCharacter = 'Rexy' | 'Trikey' | 'Sera';

// Level data structure
export interface LevelData {
  id: number;
  title: string;
  grid: TileType[][];
  start: { x: number; y: number };
  startFacing: Facing;
  food: { x: number; y: number };
  trackBudget: number;
  verifiedSolution: Command[];
}

// Runtime game state (per-level, ephemeral)
export interface GameState {
  levelId: number;
  character: DinoCharacter;
  dinoPos: { x: number; y: number };
  dinoFacing: Facing;
  commandQueue: Command[];
  activeCommandIndex: number;
  trackBudget: number;
  clearedInteractables: { x: number; y: number }[];
  isExecuting: boolean;
}

// Persisted state (cross-session, mirrors localStorage)
export interface PersistedState {
  unlockedLevel: number;
  chosenCharacter: DinoCharacter;
  muted: boolean;
}
