import { describe, it, expect } from 'vitest';
import { parseLevel, parseLevels } from '../src/engine/levelData';
import type { LevelData } from '../src/engine/types';

describe('Level Data', () => {
  describe('parseLevel', () => {
    it('should parse valid level JSON', () => {
      const validLevel = {
        id: 1,
        title: 'Hungry Steps',
        grid: [
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'food', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
        ],
        start: { x: 0, y: 1 },
        startFacing: 'E',
        food: { x: 3, y: 1 },
        trackBudget: 6,
        verifiedSolution: ['F', 'F', 'F', 'A'],
      };

      const level = parseLevel(validLevel);
      expect(level.id).toBe(1);
      expect(level.title).toBe('Hungry Steps');
      expect(level.grid).toHaveLength(3);
      expect(level.grid[0]).toHaveLength(5);
      expect(level.start).toEqual({ x: 0, y: 1 });
      expect(level.startFacing).toBe('E');
      expect(level.food).toEqual({ x: 3, y: 1 });
      expect(level.trackBudget).toBe(6);
      expect(level.verifiedSolution).toEqual(['F', 'F', 'F', 'A']);
    });

    it('should throw on invalid JSON (missing required fields)', () => {
      const invalidLevel = {
        id: 1,
        // Missing title, grid, start, etc.
      };

      expect(() => parseLevel(invalidLevel)).toThrow();
    });

    it('should throw on invalid grid dimensions', () => {
      const invalidGrid = {
        id: 1,
        title: 'Test',
        grid: [
          ['empty', 'empty'], // Wrong width (should be 5)
          ['empty', 'empty'],
        ],
        start: { x: 0, y: 0 },
        startFacing: 'E',
        food: { x: 1, y: 0 },
        trackBudget: 6,
        verifiedSolution: ['F', 'A'],
      };

      expect(() => parseLevel(invalidGrid)).toThrow();
    });

    it('should throw on invalid start position', () => {
      const invalidStart = {
        id: 1,
        title: 'Test',
        grid: [
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
        ],
        start: { x: 5, y: 1 }, // Out of bounds
        startFacing: 'E',
        food: { x: 3, y: 1 },
        trackBudget: 6,
        verifiedSolution: ['F', 'F', 'F', 'A'],
      };

      expect(() => parseLevel(invalidStart)).toThrow();
    });

    it('should map command strings to Command type', () => {
      const level = {
        id: 1,
        title: 'Test',
        grid: [
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
          ['empty', 'empty', 'empty', 'empty', 'empty'],
        ],
        start: { x: 0, y: 1 },
        startFacing: 'E',
        food: { x: 3, y: 1 },
        trackBudget: 6,
        verifiedSolution: ['F', 'L', 'R', 'A'],
      };

      const parsed = parseLevel(level);
      expect(parsed.verifiedSolution).toEqual(['F', 'L', 'R', 'A']);
    });
  });

  describe('parseLevels', () => {
    it('should parse array of valid levels', () => {
      const levels = [
        {
          id: 1,
          title: 'Level 1',
          grid: [
            ['empty', 'empty', 'empty', 'empty', 'empty'],
            ['empty', 'empty', 'empty', 'empty', 'empty'],
            ['empty', 'empty', 'empty', 'empty', 'empty'],
          ],
          start: { x: 0, y: 1 },
          startFacing: 'E',
          food: { x: 3, y: 1 },
          trackBudget: 6,
          verifiedSolution: ['F', 'F', 'F', 'A'],
        },
        {
          id: 2,
          title: 'Level 2',
          grid: [
            ['empty', 'empty', 'empty', 'empty', 'empty'],
            ['empty', 'empty', 'empty', 'empty', 'empty'],
            ['empty', 'empty', 'empty', 'empty', 'empty'],
          ],
          start: { x: 0, y: 0 },
          startFacing: 'E',
          food: { x: 4, y: 2 },
          trackBudget: 8,
          verifiedSolution: ['F', 'F', 'R', 'F', 'F', 'A'],
        },
      ];

      const parsed = parseLevels(levels);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe(1);
      expect(parsed[1].id).toBe(2);
    });

    it('should throw on empty array', () => {
      expect(() => parseLevels([])).toThrow();
    });
  });
});
