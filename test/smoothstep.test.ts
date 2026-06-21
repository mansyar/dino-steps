// Smoothstep tweening utility for movement interpolation

import { describe, it, expect } from "vitest";

import { smoothstep, lerp } from "../src/render/smoothstep";

describe("smoothstep", () => {
  it("returns 0 at t=0", () => {
    expect(smoothstep(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(smoothstep(1)).toBe(1);
  });

  it("returns 0.5 at t=0.5", () => {
    expect(smoothstep(0.5)).toBe(0.5);
  });

  it("returns 0.15625 at t=0.25 (3t² - 2t³)", () => {
    expect(smoothstep(0.25)).toBeCloseTo(0.15625, 5);
  });

  it("is monotonically increasing", () => {
    let prev = -1;
    for (let i = 0; i <= 1; i += 0.05) {
      const v = smoothstep(i);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("clamps values outside 0-1", () => {
    expect(smoothstep(-0.5)).toBe(0);
    expect(smoothstep(1.5)).toBe(1);
  });
});

describe("lerp", () => {
  it("interpolates between two values", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});
