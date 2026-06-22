// SVG character loader — preloads character SVGs as Image objects for Canvas drawing
// Supports both single-image fallback (Trikey/Sera) and per-part rigs (Rexy)

import type { DinoCharacter } from '../engine/types';
import { type CharacterRig, REXY_RIG } from './character-parts';

const CHARACTER_FILES: Record<DinoCharacter, string> = {
  Rexy: '/characters/rexy.svg',
  Trikey: '/characters/trikey.svg',
  Sera: '/characters/sera.svg',
};

const singleImageCache = new Map<DinoCharacter, HTMLImageElement>();
const partImageCache = new Map<string, HTMLImageElement>();
const rigCache = new Map<DinoCharacter, CharacterRig>();

let singleLoaded = false;
let singleLoading = false;
let partsLoaded = false;
let partsLoading = false;

/**
 * Preload all single-image character SVGs (fallback for non-rigged characters). Call once at
 * startup. Returns a promise that resolves when all images are ready.
 */
export function preloadCharacters(): Promise<void> {
  if (singleLoaded) return Promise.resolve();
  if (singleLoading) return Promise.resolve();

  singleLoading = true;

  const promises = (Object.keys(CHARACTER_FILES) as DinoCharacter[]).map((char) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        singleImageCache.set(char, img);
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
    singleLoaded = true;
    singleLoading = false;
  });
}

/**
 * Preload all per-part images for known rigs. Call once at startup. Returns a promise that resolves
 * when all part images are ready.
 */
export function preloadCharacterRigs(): Promise<void> {
  if (partsLoaded) return Promise.resolve();
  if (partsLoading) return Promise.resolve();

  partsLoading = true;
  rigCache.set('Rexy', REXY_RIG);

  const rig = REXY_RIG;
  const promises = rig.parts.map((part) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        partImageCache.set(part.file, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load part SVG: ${part.file}`);
        resolve();
      };
      img.src = part.file;
    });
  });

  return Promise.all(promises).then(() => {
    partsLoaded = true;
    partsLoading = false;
  });
}

/** Get the preloaded Image for a character. Returns null if not yet loaded. */
export function getCharacterImage(char: DinoCharacter): HTMLImageElement | null {
  return singleImageCache.get(char) ?? null;
}

/** Get the rig for a character (currently only Rexy). Returns null if no rig. */
export function getCharacterRig(char: DinoCharacter): CharacterRig | null {
  return rigCache.get(char) ?? null;
}

/** Get the preloaded Image for a part file path. Returns null if not yet loaded. */
export function getPartImage(file: string): HTMLImageElement | null {
  return partImageCache.get(file) ?? null;
}
