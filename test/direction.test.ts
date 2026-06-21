import { describe, it, expect } from "vitest";
import { DIRECTIONS, forward, turnLeft, turnRight, facingToVector } from "../src/engine/direction";
import type { Facing, Direction } from "../src/engine/types";

describe("Direction Module", () => {
  describe("DIRECTIONS map", () => {
    it("should have all four directions", () => {
      expect(DIRECTIONS.E).toEqual({ dx: 1, dy: 0 });
      expect(DIRECTIONS.S).toEqual({ dx: 0, dy: 1 });
      expect(DIRECTIONS.W).toEqual({ dx: -1, dy: 0 });
      expect(DIRECTIONS.N).toEqual({ dx: 0, dy: -1 });
    });
  });

  describe("facingToVector", () => {
    it("should convert facing to direction vector", () => {
      expect(facingToVector("E")).toEqual({ dx: 1, dy: 0 });
      expect(facingToVector("S")).toEqual({ dx: 0, dy: 1 });
      expect(facingToVector("W")).toEqual({ dx: -1, dy: 0 });
      expect(facingToVector("N")).toEqual({ dx: 0, dy: -1 });
    });
  });

  describe("forward", () => {
    it("should add direction vector to position", () => {
      const pos = { x: 2, y: 1 };
      const dir: Direction = { dx: 1, dy: 0 }; // East
      expect(forward(pos, dir)).toEqual({ x: 3, y: 1 });
    });

    it("should handle negative directions", () => {
      const pos = { x: 2, y: 1 };
      const dir: Direction = { dx: -1, dy: 0 }; // West
      expect(forward(pos, dir)).toEqual({ x: 1, y: 1 });
    });

    it("should handle vertical movement", () => {
      const pos = { x: 2, y: 1 };
      const dir: Direction = { dx: 0, dy: 1 }; // South
      expect(forward(pos, dir)).toEqual({ x: 2, y: 2 });
    });
  });

  describe("turnLeft (CCW)", () => {
    it("should turn left from East to North", () => {
      expect(turnLeft({ dx: 1, dy: 0 })).toEqual({ dx: 0, dy: -1 });
    });

    it("should turn left from North to West", () => {
      expect(turnLeft({ dx: 0, dy: -1 })).toEqual({ dx: -1, dy: 0 });
    });

    it("should turn left from West to South", () => {
      expect(turnLeft({ dx: -1, dy: 0 })).toEqual({ dx: 0, dy: 1 });
    });

    it("should turn left from South to East", () => {
      expect(turnLeft({ dx: 0, dy: 1 })).toEqual({ dx: 1, dy: 0 });
    });
  });

  describe("turnRight (CW)", () => {
    it("should turn right from East to South", () => {
      expect(turnRight({ dx: 1, dy: 0 })).toEqual({ dx: 0, dy: 1 });
    });

    it("should turn right from South to West", () => {
      expect(turnRight({ dx: 0, dy: 1 })).toEqual({ dx: -1, dy: 0 });
    });

    it("should turn right from West to North", () => {
      expect(turnRight({ dx: -1, dy: 0 })).toEqual({ dx: 0, dy: -1 });
    });

    it("should turn right from North to East", () => {
      expect(turnRight({ dx: 0, dy: -1 })).toEqual({ dx: 1, dy: 0 });
    });
  });

  describe("All starting orientations", () => {
    const orientations: Facing[] = ["E", "S", "W", "N"];

    orientations.forEach((facing) => {
      it(`should handle full rotation cycle starting from ${facing}`, () => {
        let dir = facingToVector(facing);
        // Four left turns should return to original
        dir = turnLeft(dir);
        dir = turnLeft(dir);
        dir = turnLeft(dir);
        dir = turnLeft(dir);
        expect(dir).toEqual(facingToVector(facing));
      });
    });
  });
});
