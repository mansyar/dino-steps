// SVG character loader — preloads character SVGs as Image objects for Canvas drawing

import type { DinoCharacter } from "../engine/types";

const CHARACTER_FILES: Record<DinoCharacter, string> = {
  Rexy: "/characters/rexy.svg",
  Trikey: "/characters/trikey.svg",
  Sera: "/characters/sera.svg",
};

const cache = new Map<DinoCharacter, HTMLImageElement>();
let loading = false;
let loaded = false;

/**
 * Preload all character SVGs. Call once at startup.
 * Returns a promise that resolves when all images are ready.
 */
export function preloadCharacters(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loading) return Promise.resolve();

  loading = true;

  const promises = (Object.keys(CHARACTER_FILES) as DinoCharacter[]).map((char) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        cache.set(char, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load character SVG: ${char}`);
        resolve();
      };
      img.src = CHARACTER_FILES[char];
    });
  });

  return Promise.all(promises).then(() => {
    loaded = true;
    loading = false;
  });
}

/**
 * Get the preloaded Image for a character.
 * Returns null if not yet loaded.
 */
export function getCharacterImage(char: DinoCharacter): HTMLImageElement | null {
  return cache.get(char) ?? null;
}
