import { describe, it, expect } from 'vitest';
import { parseLevel, parseLevels } from '../src/engine/levelData';

describe('Level Data', () => {
  describe('parseLevel', () => {
    it('should parse valid level JSON', () => {
      const validLevel = {
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

    it('should parse all 10 levels (L1-L10) without error', () => {
      const allLevels = [
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
      ];

      const parsed = parseLevels(allLevels);
      expect(parsed).toHaveLength(10);

      // Verify grid dimensions
      for (const level of parsed) {
        expect(level.grid).toHaveLength(3);
        for (const row of level.grid) {
          expect(row).toHaveLength(5);
        }
      }

      // Verify specific level properties (L1-L6)
      expect(parsed[0].title).toBe('Hungry Steps');
      expect(parsed[0].start).toEqual({ x: 0, y: 1 });
      expect(parsed[0].food).toEqual({ x: 3, y: 1 });

      expect(parsed[1].title).toBe('Double Hop');
      expect(parsed[1].start).toEqual({ x: 0, y: 2 });
      expect(parsed[1].food).toEqual({ x: 4, y: 2 });
      expect(parsed[1].trackBudget).toBe(6);

      expect(parsed[2].title).toBe('The Great Rock');
      expect(parsed[2].grid[0][1]).toBe('rock');
      expect(parsed[2].grid[1][1]).toBe('berry');

      expect(parsed[3].title).toBe('Tiny Corner');
      expect(parsed[3].grid[0][1]).toBe('leaf');
      expect(parsed[3].food).toEqual({ x: 1, y: 0 });

      expect(parsed[4].title).toBe('S-Curve Path');
      expect(parsed[4].grid[0][0]).toBe('rock');
      expect(parsed[4].grid[2][1]).toBe('rock');
      expect(parsed[4].trackBudget).toBe(8);

      expect(parsed[5].title).toBe('Around the Swamp');
      expect(parsed[5].grid[2][2]).toBe('mud');
      expect(parsed[5].grid[2][3]).toBe('leaf');
      expect(parsed[5].startFacing).toBe('N');

      // Verify L7-L10 (interactable levels)
      expect(parsed[6].title).toBe('Sleepy Turtle');
      expect(parsed[6].grid[1][2]).toBe('turtle');
      expect(parsed[6].grid[1][4]).toBe('leaf');
      expect(parsed[6].trackBudget).toBe(8);

      expect(parsed[7].title).toBe('Tall Grass Chomp');
      expect(parsed[7].grid[1][0]).toBe('grass');
      expect(parsed[7].grid[1][4]).toBe('cookie');
      expect(parsed[7].grid[2][1]).toBe('rock');
      expect(parsed[7].trackBudget).toBe(10);

      expect(parsed[8].title).toBe('Twin Paths');
      expect(parsed[8].grid[0][3]).toBe('rock');
      expect(parsed[8].grid[0][4]).toBe('cookie');
      expect(parsed[8].grid[2][4]).toBe('rock');
      expect(parsed[8].trackBudget).toBe(10);

      expect(parsed[9].title).toBe('Dino Master');
      expect(parsed[9].grid[1][1]).toBe('turtle');
      expect(parsed[9].grid[1][2]).toBe('rock');
      expect(parsed[9].grid[2][0]).toBe('rock');
      expect(parsed[9].grid[2][4]).toBe('cookie');
      expect(parsed[9].trackBudget).toBe(10);
    });
  });
});
