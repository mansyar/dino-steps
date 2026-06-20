import { describe, it, expect } from "vitest";
import { replaySolution, computeMinimum } from "../src/engine/bfsValidator";
import type { LevelData } from "../src/engine/types";

// Level 1 test data
const level1: LevelData = {
  id: 1,
  title: "Hungry Steps",
  grid: [
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "food", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
  ],
  start: { x: 0, y: 1 },
  startFacing: "E",
  food: { x: 3, y: 1 },
  trackBudget: 6,
  verifiedSolution: ["F", "F", "F", "A"],
};

describe("BFS Level Validator", () => {
  describe("replaySolution", () => {
    it("should validate Level 1 solution [F,F,F,A] as winning", () => {
      const result = replaySolution(level1, ["F", "F", "F", "A"]);
      expect(result).toBe("win");
    });

    it("should fail when walking into boundary", () => {
      // Walk 4 steps east from (0,1) - hits boundary at x=5
      const result = replaySolution(level1, ["F", "F", "F", "F", "F"]);
      expect(result).toBe("fail");
    });

    it("should fail when walking into obstacle", () => {
      const levelWithObstacle: LevelData = {
        ...level1,
        grid: [
          ["empty", "empty", "empty", "empty", "empty"],
          ["empty", "obstacle", "empty", "food", "empty"],
          ["empty", "empty", "empty", "empty", "empty"],
        ],
      };
      // Walk into obstacle at (1,1)
      const result = replaySolution(levelWithObstacle, ["F", "F"]);
      expect(result).toBe("fail");
    });

    it("should return incomplete when not reaching food", () => {
      // Only 2 steps - doesn't reach food at (3,1)
      const result = replaySolution(level1, ["F", "F"]);
      expect(result).toBe("incomplete");
    });

    it("should return incomplete when on food but no action", () => {
      // Walk to food but don't use action
      const result = replaySolution(level1, ["F", "F", "F"]);
      expect(result).toBe("incomplete");
    });

    it("should handle turns correctly", () => {
      // Start (0,1)E → F,F → (2,1)E → R → (2,1)S → F → (2,2)S → R → (2,2)W → F → (1,2)W → R → (1,2)N → F → (1,1)N → R → (1,1)E → F → (2,1)E → F → (3,1)E → A (win)
      const result = replaySolution(level1, [
        "F",
        "F",
        "R",
        "F",
        "R",
        "F",
        "R",
        "F",
        "R",
        "F",
        "F",
        "A",
      ]);
      expect(result).toBe("win");
    });
  });

  describe("computeMinimum", () => {
    it("should compute minimum solution length for Level 1", () => {
      const min = computeMinimum(level1);
      // Minimum is 4: F, F, F, A
      expect(min).toBe(4);
    });

    it("should handle level with obstacles", () => {
      const levelWithObstacle: LevelData = {
        ...level1,
        grid: [
          ["empty", "empty", "empty", "empty", "empty"],
          ["empty", "obstacle", "empty", "food", "empty"],
          ["empty", "empty", "empty", "empty", "empty"],
        ],
      };
      // BFS finds shortest path: 8 moves + 1 action = 9 total
      const min = computeMinimum(levelWithObstacle);
      expect(min).toBe(9);
    });
  });
});
