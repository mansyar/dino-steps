import type { PersistedState } from './types';

export const STORAGE_KEYS = {
  UNLOCKED_LEVEL: 'dinosteps:unlockedLevel',
  CHOSEN_CHARACTER: 'dinosteps:chosenCharacter',
  MUTED: 'dinosteps:muted',
} as const;

const DEFAULTS: PersistedState = {
  unlockedLevel: 1,
  chosenCharacter: 'Rexy',
  muted: false,
};

export function loadPersisted(): PersistedState {
  return {
    unlockedLevel: parseInt(localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL) ?? String(DEFAULTS.unlockedLevel), 10),
    chosenCharacter: (localStorage.getItem(STORAGE_KEYS.CHOSEN_CHARACTER) as PersistedState['chosenCharacter']) ?? DEFAULTS.chosenCharacter,
    muted: localStorage.getItem(STORAGE_KEYS.MUTED) === 'true',
  };
}

export function saveUnlockedLevel(n: number): void {
  localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVEL, String(n));
}

export function saveCharacter(c: PersistedState['chosenCharacter']): void {
  localStorage.setItem(STORAGE_KEYS.CHOSEN_CHARACTER, c);
}

export function saveMuted(b: boolean): void {
  localStorage.setItem(STORAGE_KEYS.MUTED, String(b));
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.UNLOCKED_LEVEL);
  localStorage.removeItem(STORAGE_KEYS.CHOSEN_CHARACTER);
  localStorage.removeItem(STORAGE_KEYS.MUTED);
}
