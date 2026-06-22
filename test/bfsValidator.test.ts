import { describe, it, expect } from 'vitest';
import { replaySolution, computeMinimum } from '../src/engine/bfsValidator';
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

// Level 2 test data
const level2: LevelData = {
  id: 2,
  title: 'Double Hop',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'berry'],
  ],
  start: { x: 0, y: 2 },
  startFacing: 'E',
  food: { x: 4, y: 2 },
  trackBudget: 6,
  verifiedSolution: ['F', 'F', 'F', 'F', 'A'],
};

// Level 3 test data
const level3: LevelData = {
  id: 3,
  title: 'The Great Rock',
  grid: [
    ['empty', 'rock', 'empty', 'empty', 'empty'],
    ['empty', 'berry', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 0 },
  startFacing: 'E',
  food: { x: 1, y: 1 },
  trackBudget: 6,
  verifiedSolution: ['R', 'F', 'L', 'F', 'A'],
};

// Level 4 test data
const level4: LevelData = {
  id: 4,
  title: 'Tiny Corner',
  grid: [
    ['empty', 'leaf', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 2 },
  startFacing: 'E',
  food: { x: 1, y: 0 },
  trackBudget: 6,
  verifiedSolution: ['F', 'L', 'F', 'F', 'A'],
};

// Level 5 test data
const level5: LevelData = {
  id: 5,
  title: 'S-Curve Path',
  grid: [
    ['rock', 'leaf', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'rock', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 2 },
  startFacing: 'E',
  food: { x: 1, y: 0 },
  trackBudget: 8,
  verifiedSolution: ['L', 'F', 'R', 'F', 'L', 'F', 'A'],
};

// Level 6 test data
const level6: LevelData = {
  id: 6,
  title: 'Around the Swamp',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'mud', 'leaf', 'empty'],
  ],
  start: { x: 1, y: 2 },
  startFacing: 'N',
  food: { x: 3, y: 2 },
  trackBudget: 8,
  verifiedSolution: ['F', 'R', 'F', 'F', 'R', 'F', 'F', 'A'],
};

// Level 7 test data (with interactable)
const level7: LevelData = {
  id: 7,
  title: 'Sleepy Turtle',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'turtle', 'empty', 'leaf'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 1 },
  startFacing: 'E',
  food: { x: 4, y: 1 },
  trackBudget: 8,
  verifiedSolution: ['F', 'F', 'A', 'F', 'F', 'A'],
};

// Level 8 test data (with interactable)
const level8: LevelData = {
  id: 8,
  title: 'Tall Grass Chomp',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['grass', 'empty', 'empty', 'empty', 'cookie'],
    ['empty', 'rock', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 2 },
  startFacing: 'E',
  food: { x: 4, y: 1 },
  trackBudget: 10,
  verifiedSolution: ['L', 'F', 'R', 'A', 'F', 'F', 'F', 'F', 'A'],
};

// Level 9 test data (no interactables)
const level9: LevelData = {
  id: 9,
  title: 'Twin Paths',
  grid: [
    ['empty', 'empty', 'empty', 'rock', 'cookie'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'rock'],
  ],
  start: { x: 2, y: 2 },
  startFacing: 'E',
  food: { x: 4, y: 0 },
  trackBudget: 10,
  verifiedSolution: ['F', 'L', 'F', 'R', 'F', 'L', 'F', 'A'],
};

// Level 10 test data (with interactable)
const level10: LevelData = {
  id: 10,
  title: 'Dino Master',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'turtle', 'rock', 'empty', 'empty'],
    ['rock', 'empty', 'empty', 'empty', 'cookie'],
  ],
  start: { x: 0, y: 1 },
  startFacing: 'E',
  food: { x: 4, y: 2 },
  trackBudget: 10,
  verifiedSolution: ['F', 'R', 'A', 'F', 'L', 'F', 'F', 'F', 'A'],
};

describe('BFS Level Validator', () => {
  describe('replaySolution', () => {
    it('should validate Level 1 solution [F,F,F,A] as winning', () => {
      const result = replaySolution(level1, ['F', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should soft-resist when walking into boundary (stays in place)', () => {
      // Walk 4 steps east from (0,1) - 5th step hits boundary at x=5, soft-resists
      const result = replaySolution(level1, ['F', 'F', 'F', 'F', 'F']);
      expect(result).toBe('incomplete');
    });

    it('should soft-resist when walking into obstacle (stays in place)', () => {
      const levelWithObstacle: LevelData = {
        ...level1,
        grid: [
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'rock', 'empty', 'berry', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
        ],
      };
      // Walk into obstacle at (1,1) - soft-resists, stays at (0,1)
      const result = replaySolution(levelWithObstacle, ['F', 'F']);
      expect(result).toBe('incomplete');
    });

    it('should return incomplete when not reaching food', () => {
      // Only 2 steps - doesn't reach food at (3,1)
      const result = replaySolution(level1, ['F', 'F']);
      expect(result).toBe('incomplete');
    });

    it('should return incomplete when on food but no action', () => {
      // Walk to food but don't use action
      const result = replaySolution(level1, ['F', 'F', 'F']);
      expect(result).toBe('incomplete');
    });

    it('should handle turns correctly', () => {
      // Start (0,1)E → F,F → (2,1)E → R → (2,1)S → F → (2,2)S → R → (2,2)W → F → (1,2)W → R → (1,2)N → F → (1,1)N → R → (1,1)E → F → (2,1)E → F → (3,1)E → A (win)
      const result = replaySolution(level1, [
        'F',
        'F',
        'R',
        'F',
        'R',
        'F',
        'R',
        'F',
        'R',
        'F',
        'F',
        'A',
      ]);
      expect(result).toBe('win');
    });

    it('should validate Level 2 solution [F,F,F,F,A] as winning', () => {
      const result = replaySolution(level2, ['F', 'F', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 3 solution [R,F,L,F,A] as winning', () => {
      const result = replaySolution(level3, ['R', 'F', 'L', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 4 solution [F,L,F,F,A] as winning', () => {
      const result = replaySolution(level4, ['F', 'L', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 5 solution [L,F,R,F,L,F,A] as winning', () => {
      const result = replaySolution(level5, ['L', 'F', 'R', 'F', 'L', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 6 solution [F,R,F,F,R,F,F,A] as winning', () => {
      const result = replaySolution(level6, ['F', 'R', 'F', 'F', 'R', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 7 solution [F,F,A,F,F,A] as winning (interactable)', () => {
      const result = replaySolution(level7, ['F', 'F', 'A', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 8 solution [L,F,R,A,F,F,F,F,A] as winning (interactable)', () => {
      const result = replaySolution(level8, ['L', 'F', 'R', 'A', 'F', 'F', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 9 solution [F,L,F,R,F,L,F,A] as winning', () => {
      const result = replaySolution(level9, ['F', 'L', 'F', 'R', 'F', 'L', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should validate Level 10 solution [F,R,A,F,L,F,F,F,A] as winning (interactable)', () => {
      const result = replaySolution(level10, ['F', 'R', 'A', 'F', 'L', 'F', 'F', 'F', 'A']);
      expect(result).toBe('win');
    });

    it('should return fail when trying to F out of uncleared interactable', () => {
      // Start at (0,1)E, walk into turtle at (2,1), try to F without clearing
      const result = replaySolution(level7, ['F', 'F', 'F']);
      expect(result).toBe('fail');
    });

    it('should clear interactable with A command', () => {
      // Walk to turtle, clear it with A, then continue
      const result = replaySolution(level7, ['F', 'F', 'A', 'F']);
      expect(result).toBe('incomplete');
    });
  });

  describe('computeMinimum', () => {
    it('should compute minimum solution length for Level 1', () => {
      const min = computeMinimum(level1);
      // Minimum is 4: F, F, F, A
      expect(min).toBe(4);
    });

    it('should handle level with obstacles', () => {
      const levelWithObstacle: LevelData = {
        ...level1,
        grid: [
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'rock', 'empty', 'berry', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
        ],
      };
      // BFS finds shortest path: 8 moves + 1 action = 9 total
      const min = computeMinimum(levelWithObstacle);
      expect(min).toBe(9);
    });

    it('should compute minimum for Level 2 (Double Hop)', () => {
      const min = computeMinimum(level2);
      expect(min).toBe(5);
    });

    it('should compute minimum for Level 3 (The Great Rock)', () => {
      const min = computeMinimum(level3);
      expect(min).toBe(5);
    });

    it('should compute minimum for Level 4 (Tiny Corner)', () => {
      const min = computeMinimum(level4);
      expect(min).toBe(5);
    });

    it('should compute minimum for Level 5 (S-Curve Path)', () => {
      const min = computeMinimum(level5);
      expect(min).toBe(7);
    });

    it('should compute minimum for Level 6 (Around the Swamp)', () => {
      const min = computeMinimum(level6);
      // Optimal path: F R F F R F A = 7 steps (verified solution has 8 with wasteful boundary soft-resist)
      expect(min).toBe(7);
    });

    it('should compute minimum for Level 7 (Sleepy Turtle)', () => {
      const min = computeMinimum(level7);
      // Optimal: F F A F F A = 6 steps (clear turtle then reach food)
      expect(min).toBe(6);
    });

    it('should compute minimum for Level 8 (Tall Grass Chomp)', () => {
      const min = computeMinimum(level8);
      // Optimal: L F R A F F F F A = 9 steps (clear grass then reach food)
      expect(min).toBe(9);
    });

    it('should compute minimum for Level 9 (Twin Paths)', () => {
      const min = computeMinimum(level9);
      // Optimal: F L F R F L F A = 8 steps (no interactables)
      expect(min).toBe(8);
    });

    it('should compute minimum for Level 10 (Dino Master)', () => {
      const min = computeMinimum(level10);
      // Optimal: F R A F L F F F A = 9 steps (clear turtle then reach food)
      expect(min).toBe(9);
    });
  });
});
