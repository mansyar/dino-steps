// Smoothstep tweening utility for movement interpolation

export function smoothstep(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return clamped * clamped * (3 - 2 * clamped);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
