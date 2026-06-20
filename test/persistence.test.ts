import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadPersisted,
  saveUnlockedLevel,
  saveCharacter,
  saveMuted,
  resetProgress,
  STORAGE_KEYS,
} from "../src/engine/persistence";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("STORAGE_KEYS", () => {
    it("has correct key values", () => {
      expect(STORAGE_KEYS.UNLOCKED_LEVEL).toBe("dinosteps:unlockedLevel");
      expect(STORAGE_KEYS.CHOSEN_CHARACTER).toBe("dinosteps:chosenCharacter");
      expect(STORAGE_KEYS.MUTED).toBe("dinosteps:muted");
    });
  });

  describe("loadPersisted", () => {
    it("returns defaults when localStorage is empty", () => {
      const result = loadPersisted();
      expect(result).toEqual({
        unlockedLevel: 1,
        chosenCharacter: "Rexy",
        muted: false,
      });
    });

    it("hydrates unlockedLevel from localStorage", () => {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVEL, "3");
      const result = loadPersisted();
      expect(result.unlockedLevel).toBe(3);
    });

    it("hydrates chosenCharacter from localStorage", () => {
      localStorage.setItem(STORAGE_KEYS.CHOSEN_CHARACTER, "Trikey");
      const result = loadPersisted();
      expect(result.chosenCharacter).toBe("Trikey");
    });

    it("hydrates muted from localStorage", () => {
      localStorage.setItem(STORAGE_KEYS.MUTED, "true");
      const result = loadPersisted();
      expect(result.muted).toBe(true);
    });

    it("hydrates all 3 keys", () => {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVEL, "5");
      localStorage.setItem(STORAGE_KEYS.CHOSEN_CHARACTER, "Sera");
      localStorage.setItem(STORAGE_KEYS.MUTED, "true");
      const result = loadPersisted();
      expect(result).toEqual({
        unlockedLevel: 5,
        chosenCharacter: "Sera",
        muted: true,
      });
    });
  });

  describe("saveUnlockedLevel", () => {
    it("writes key dinosteps:unlockedLevel", () => {
      saveUnlockedLevel(4);
      expect(localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL)).toBe("4");
    });
  });

  describe("saveCharacter", () => {
    it("writes key dinosteps:chosenCharacter", () => {
      saveCharacter("Sera");
      expect(localStorage.getItem(STORAGE_KEYS.CHOSEN_CHARACTER)).toBe("Sera");
    });
  });

  describe("saveMuted", () => {
    it("writes key dinosteps:muted", () => {
      saveMuted(true);
      expect(localStorage.getItem(STORAGE_KEYS.MUTED)).toBe("true");
    });
  });

  describe("resetProgress", () => {
    it("clears all 3 keys", () => {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVEL, "5");
      localStorage.setItem(STORAGE_KEYS.CHOSEN_CHARACTER, "Trikey");
      localStorage.setItem(STORAGE_KEYS.MUTED, "true");

      resetProgress();

      expect(localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.CHOSEN_CHARACTER)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.MUTED)).toBeNull();
    });
  });
});
