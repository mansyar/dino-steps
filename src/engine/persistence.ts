import type { PersistedState, DinoCharacter } from './types';

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

function isValidCharacter(value: string): value is DinoCharacter {
  return value === 'Rexy' || value === 'Trikey' || value === 'Sera';
}

export function loadPersisted(): PersistedState {
  const rawChar = localStorage.getItem(STORAGE_KEYS.CHOSEN_CHARACTER);
  const chosenCharacter =
    rawChar !== null && isValidCharacter(rawChar) ? rawChar : DEFAULTS.chosenCharacter;

  return {
    unlockedLevel: parseInt(
      localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL) ?? String(DEFAULTS.unlockedLevel),
      10,
    ),
    chosenCharacter,
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
