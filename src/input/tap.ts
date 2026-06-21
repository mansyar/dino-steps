// Tap Input Module
// Handles Pointer Events for command buttons and track interactions

import type { Command, DinoCharacter } from '../engine/types';

// Command to emoji mapping (render-time only)
export const COMMAND_EMOJI: Record<Command, string> = {
  F: '🐾',
  L: '↩️',
  R: '↪️',
  A: '🦕',
};

// Command display names for accessibility
export const COMMAND_LABELS: Record<Command, string> = {
  F: 'Forward',
  L: 'Turn Left',
  R: 'Turn Right',
  A: 'Action',
};

// Shared character definitions (single source of truth)
export const CHARACTERS: { name: DinoCharacter; color: string; emoji: string }[] = [
  { name: 'Rexy', color: '#4caf50', emoji: '🦖' },
  { name: 'Trikey', color: '#42a5f5', emoji: '🦕' },
  { name: 'Sera', color: '#ef5350', emoji: '🦕' },
];

export interface TapHandler {
  onCommandTap: (cmd: Command) => void;
  onTrackTap: (index: number) => void;
  onGoTap: () => void;
  onSwapTap: () => void;
  onMuteTap: () => void;
}

/** Create a button element with proper touch target sizing */
function createButton(
  label: string,
  ariaLabel: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.setAttribute('aria-label', ariaLabel);
  btn.className = `btn ${className}`;
  btn.style.fontSize = '24px';

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onClick();
  });

  return btn;
}

/** Render the action menu with 4 command buttons */
export function renderActionMenu(
  container: HTMLElement,
  handler: TapHandler,
  enabled: boolean,
): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'action-menu';

  const commands: Command[] = ['F', 'L', 'R', 'A'];
  for (const cmd of commands) {
    const btn = createButton(COMMAND_EMOJI[cmd], COMMAND_LABELS[cmd], `cmd-btn cmd-${cmd}`, () =>
      handler.onCommandTap(cmd),
    );
    if (!enabled) {
      btn.disabled = true;
      btn.classList.add('btn--disabled');
    }
    menu.appendChild(btn);
  }

  container.appendChild(menu);
  return menu;
}

/** Render the track slots display */
export function renderTrack(
  container: HTMLElement,
  budget: number,
  commands: Command[],
  enabled: boolean,
  onSlotTap: (index: number) => void,
): HTMLElement {
  const track = document.createElement('div');
  track.className = 'track';

  for (let i = 0; i < budget; i++) {
    const slot = document.createElement('div');
    slot.className = 'track-slot';
    slot.style.fontSize = '24px';

    if (i < commands.length) {
      slot.textContent = COMMAND_EMOJI[commands[i]];
      slot.classList.add('track-slot--filled');
      slot.style.borderColor = 'var(--color-go)';
      slot.style.backgroundColor = 'var(--color-secondary)';
      slot.setAttribute('aria-label', `Step ${i + 1}: ${COMMAND_LABELS[commands[i]]}`);
    } else {
      slot.setAttribute('aria-label', `Step ${i + 1}: empty`);
    }

    if (enabled && i < commands.length) {
      slot.style.cursor = 'pointer';
      slot.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onSlotTap(i);
      });
    }

    track.appendChild(slot);
  }

  container.appendChild(track);
  return track;
}

/** Render the GO button */
export function renderGoButton(
  container: HTMLElement,
  enabled: boolean,
  onGo: () => void,
): HTMLButtonElement {
  const btn = createButton('▶️', 'Go', 'btn-go', onGo);
  btn.style.fontSize = '28px';
  btn.style.fontWeight = 'bold';

  if (!enabled) {
    btn.disabled = true;
    btn.classList.add('btn--disabled');
  }

  container.appendChild(btn);
  return btn;
}

/** Render the character swap button */
export function renderSwapButton(
  container: HTMLElement,
  enabled: boolean,
  onSwap: () => void,
): HTMLButtonElement {
  const btn = createButton('🦖', 'Swap Character', 'btn-swap', onSwap);
  btn.style.position = 'absolute';
  btn.style.top = '8px';
  btn.style.right = '8px';
  btn.style.borderRadius = '50%';
  btn.style.width = '48px';
  btn.style.height = '48px';
  btn.style.minWidth = '48px';
  btn.style.minHeight = '48px';
  btn.style.fontSize = '20px';

  if (!enabled) {
    btn.disabled = true;
    btn.classList.add('btn--disabled');
  }

  container.appendChild(btn);
  return btn;
}

/** Render the mute toggle button */
export function renderMuteButton(
  container: HTMLElement,
  muted: boolean,
  onToggle: () => void,
): HTMLButtonElement {
  const btn = createButton(muted ? '🔇' : '🔊', muted ? 'Unmute' : 'Mute', 'btn-mute', onToggle);
  btn.style.position = 'absolute';
  btn.style.top = '8px';
  btn.style.left = '8px';

  container.appendChild(btn);
  return btn;
}

/** Render the home screen with character selection */
export function renderHomeScreen(
  container: HTMLElement,
  onSelect: (character: DinoCharacter) => void,
): HTMLElement {
  const home = document.createElement('div');
  home.className = 'home-screen';

  const title = document.createElement('h1');
  title.textContent = 'DinoSteps';
  title.className = 'home-screen__title';
  home.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Choose your dinosaur!';
  subtitle.className = 'home-screen__subtitle';
  home.appendChild(subtitle);

  const chars = CHARACTERS;

  const cards = document.createElement('div');
  cards.className = 'home-screen__cards';

  for (const ch of chars) {
    const card = document.createElement('button');
    card.className = 'char-card';
    card.style.borderColor = ch.color;

    const emoji = document.createElement('span');
    emoji.textContent = ch.emoji;
    emoji.className = 'char-card__emoji';
    card.appendChild(emoji);

    const name = document.createElement('span');
    name.textContent = ch.name;
    name.className = 'char-card__name';
    name.style.color = ch.color;
    card.appendChild(name);

    card.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onSelect(ch.name);
    });

    cards.appendChild(card);
  }

  home.appendChild(cards);
  container.appendChild(home);
  return home;
}

/** Render the level select screen */
export function renderLevelSelect(
  container: HTMLElement,
  unlockedLevel: number,
  totalLevels: number,
  onSelect: (levelId: number) => void,
): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'level-select-screen';

  const title = document.createElement('h2');
  title.textContent = 'Select Level';
  title.className = 'level-select-screen__title';
  screen.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'level-select__grid';

  for (let i = 1; i <= totalLevels; i++) {
    const tile = document.createElement('button');
    tile.textContent = String(i);
    tile.className = 'level-tile';

    if (i <= unlockedLevel) {
      tile.classList.add('level-tile--unlocked');
      tile.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onSelect(i);
      });
    } else {
      tile.classList.add('level-tile--locked');
      tile.disabled = true;
    }

    grid.appendChild(tile);
  }

  screen.appendChild(grid);
  container.appendChild(screen);
  return screen;
}

/** Render the character carousel overlay */
export function renderCharacterCarousel(
  container: HTMLElement,
  current: DinoCharacter,
  onSelect: (character: DinoCharacter) => void,
  onClose: () => void,
): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'character-carousel';

  const panel = document.createElement('div');
  panel.className = 'character-carousel__panel';

  const title = document.createElement('h3');
  title.textContent = 'Choose Character';
  title.className = 'character-carousel__title';
  panel.appendChild(title);

  const chars = CHARACTERS;

  for (const ch of chars) {
    const btn = document.createElement('button');
    btn.textContent = `${ch.emoji} ${ch.name}`;
    btn.className = 'character-carousel__btn';
    btn.style.borderColor = ch.name === current ? ch.color : '#ddd';
    if (ch.name === current) {
      btn.style.backgroundColor = `${ch.color}22`;
    }

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onSelect(ch.name);
      onClose();
    });

    panel.appendChild(btn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cancel';
  closeBtn.className = 'character-carousel__close';
  closeBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    onClose();
  });
  panel.appendChild(closeBtn);

  overlay.appendChild(panel);
  container.appendChild(overlay);
  return overlay;
}
