import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  addCommand,
  removeCommand,
  advanceIndex,
  clearInteractable,
  resetToStart,
  setExecuting,
} from '../src/engine/state';
import type { LevelData } from '../src/engine/types';

// Level 1 test data
const level1: LevelData = {
  id: 1,
  title: 'Hungry Steps',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'berry', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 1 },
  startFacing: 'E',
  food: { x: 3, y: 1 },
  trackBudget: 6,
  verifiedSolution: ['F', 'F', 'F', 'A'],
};

describe('State Module', () => {
  describe('createInitialState', () => {
    it('should create correct initial state for Level 1', () => {
      const state = createInitialState(level1, 'Rexy');
      expect(state.levelId).toBe(1);
      expect(state.character).toBe('Rexy');
      expect(state.dinoPos).toEqual({ x: 0, y: 1 });
      expect(state.dinoFacing).toBe('E');
      expect(state.commandQueue).toEqual([]);
      expect(state.activeCommandIndex).toBe(-1);
      expect(state.trackBudget).toBe(6);
      expect(state.clearedInteractables).toEqual([]);
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('addCommand', () => {
    it('should add command to empty queue', () => {
      const state = createInitialState(level1, 'Rexy');
      const newState = addCommand(state, 'F');
      expect(newState.commandQueue).toEqual(['F']);
    });

    it('should append commands to queue', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      state = addCommand(state, 'R');
      expect(state.commandQueue).toEqual(['F', 'L', 'R']);
    });

    it('should not exceed track budget', () => {
      let state = createInitialState(level1, 'Rexy');
      // Add 6 commands (budget limit)
      for (let i = 0; i < 6; i++) {
        state = addCommand(state, 'F');
      }
      // 7th command should not be added
      const newState = addCommand(state, 'A');
      expect(newState.commandQueue).toHaveLength(6);
    });
  });

  describe('removeCommand', () => {
    it('should remove command at index', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      state = addCommand(state, 'R');
      const newState = removeCommand(state, 1);
      expect(newState.commandQueue).toEqual(['F', 'R']);
    });

    it('should handle removing first command', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      const newState = removeCommand(state, 0);
      expect(newState.commandQueue).toEqual(['L']);
    });

    it('should handle removing last command', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      const newState = removeCommand(state, 1);
      expect(newState.commandQueue).toEqual(['F']);
    });
  });

  describe('advanceIndex', () => {
    it('should advance active command index', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      const newState = advanceIndex(state);
      expect(newState.activeCommandIndex).toBe(0);
    });

    it('should increment index on subsequent advances', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      state = advanceIndex(state);
      const newState = advanceIndex(state);
      expect(newState.activeCommandIndex).toBe(1);
    });
  });

  describe('clearInteractable', () => {
    it('should add cleared interactable to list', () => {
      const state = createInitialState(level1, 'Rexy');
      const newState = clearInteractable(state, { x: 1, y: 1 });
      expect(newState.clearedInteractables).toEqual([{ x: 1, y: 1 }]);
    });

    it('should not duplicate cleared interactables', () => {
      let state = createInitialState(level1, 'Rexy');
      state = clearInteractable(state, { x: 1, y: 1 });
      const newState = clearInteractable(state, { x: 1, y: 1 });
      expect(newState.clearedInteractables).toHaveLength(1);
    });
  });

  describe('resetToStart', () => {
    it('should reset dino position to start', () => {
      let state = createInitialState(level1, 'Rexy');
      state = addCommand(state, 'F');
      state = addCommand(state, 'L');
      state = advanceIndex(state);
      const newState = resetToStart(state, level1);
      expect(newState.dinoPos).toEqual({ x: 0, y: 1 });
      expect(newState.dinoFacing).toBe('E');
      expect(newState.commandQueue).toEqual([]);
      expect(newState.activeCommandIndex).toBe(-1);
      expect(newState.clearedInteractables).toEqual([]);
    });
  });

  describe('setExecuting', () => {
    it('should toggle isExecuting flag', () => {
      const state = createInitialState(level1, 'Rexy');
      expect(state.isExecuting).toBe(false);
      const newState = setExecuting(state, true);
      expect(newState.isExecuting).toBe(true);
    });
  });

  describe('gameComplete', () => {
    it('should have gameComplete as false by default', () => {
      const state = createInitialState(level1, 'Rexy');
      expect(state.gameComplete).toBe(false);
    });

    it('should track gameComplete flag', () => {
      const state = createInitialState(level1, 'Rexy');
      const newState = { ...state, gameComplete: true };
      expect(newState.gameComplete).toBe(true);
    });
  });
});
