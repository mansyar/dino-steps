import { describe, it, expect } from 'vitest';
import { isObstacle, isFood, isInteractable } from '../src/engine/tileUtils';

describe('Tile Classification Helpers', () => {
  describe('isObstacle', () => {
    it('should return true for rock', () => {
      expect(isObstacle('rock')).toBe(true);
    });

    it('should return true for mud', () => {
      expect(isObstacle('mud')).toBe(true);
    });

    it('should return false for empty', () => {
      expect(isObstacle('empty')).toBe(false);
    });

    it('should return false for berry', () => {
      expect(isObstacle('berry')).toBe(false);
    });

    it('should return false for leaf', () => {
      expect(isObstacle('leaf')).toBe(false);
    });

    it('should return false for cookie', () => {
      expect(isObstacle('cookie')).toBe(false);
    });

    it('should return false for turtle', () => {
      expect(isObstacle('turtle')).toBe(false);
    });

    it('should return false for grass', () => {
      expect(isObstacle('grass')).toBe(false);
    });
  });

  describe('isFood', () => {
    it('should return true for berry', () => {
      expect(isFood('berry')).toBe(true);
    });

    it('should return true for leaf', () => {
      expect(isFood('leaf')).toBe(true);
    });

    it('should return true for cookie', () => {
      expect(isFood('cookie')).toBe(true);
    });

    it('should return false for empty', () => {
      expect(isFood('empty')).toBe(false);
    });

    it('should return false for rock', () => {
      expect(isFood('rock')).toBe(false);
    });

    it('should return false for mud', () => {
      expect(isFood('mud')).toBe(false);
    });

    it('should return false for turtle', () => {
      expect(isFood('turtle')).toBe(false);
    });

    it('should return false for grass', () => {
      expect(isFood('grass')).toBe(false);
    });
  });

  describe('isInteractable', () => {
    it('should return true for turtle', () => {
      expect(isInteractable('turtle')).toBe(true);
    });

    it('should return true for grass', () => {
      expect(isInteractable('grass')).toBe(true);
    });

    it('should return false for empty', () => {
      expect(isInteractable('empty')).toBe(false);
    });

    it('should return false for rock', () => {
      expect(isInteractable('rock')).toBe(false);
    });

    it('should return false for mud', () => {
      expect(isInteractable('mud')).toBe(false);
    });

    it('should return false for berry', () => {
      expect(isInteractable('berry')).toBe(false);
    });

    it('should return false for leaf', () => {
      expect(isInteractable('leaf')).toBe(false);
    });

    it('should return false for cookie', () => {
      expect(isInteractable('cookie')).toBe(false);
    });
  });
});
