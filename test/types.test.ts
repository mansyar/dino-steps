import { describe, it, expect } from "vitest";
import type { Command, Facing, TileType, DinoCharacter } from "../src/engine/types";

describe("Types", () => {
  describe("Command type", () => {
    it("should accept valid command values", () => {
      // Type-level assertions - these should compile
      const commands: Command[] = ["F", "L", "R", "A"];
      expect(commands).toHaveLength(4);
      expect(commands).toContain("F");
      expect(commands).toContain("L");
      expect(commands).toContain("R");
      expect(commands).toContain("A");
    });
  });

  describe("Facing type", () => {
    it("should accept valid facing values", () => {
      const facings: Facing[] = ["E", "S", "W", "N"];
      expect(facings).toHaveLength(4);
    });
  });

  describe("TileType type", () => {
    it("should accept valid tile type values", () => {
      const tileTypes: TileType[] = ["empty", "obstacle", "food", "interactable"];
      expect(tileTypes).toHaveLength(4);
    });
  });

  describe("DinoCharacter type", () => {
    it("should accept valid character values", () => {
      const characters: DinoCharacter[] = ["rexy", "trikey", "sera"];
      expect(characters).toHaveLength(3);
    });
  });
});
