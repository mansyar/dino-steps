// Tap Input Module
// Handles Pointer Events for command buttons and track interactions

import type { Command, DinoCharacter, TileType } from '../engine/types';
import { isFood, isObstacle, isInteractable } from '../engine/tileUtils';

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
export const CHARACTERS: {
  name: DinoCharacter;
  emoji: string;
  svg: string;
}[] = [
  { name: 'Rexy', emoji: '🦖', svg: '/characters/rexy.svg' },
  { name: 'Trikey', emoji: '🦕', svg: '/characters/trikey.svg' },
  { name: 'Sera', emoji: '🦕', svg: '/characters/sera.svg' },
];

export interface TapHandler {
  onCommandTap: (cmd: Command) => void;
  onTrackTap: (index: number) => void;
  onGoTap: () => void;
  onSwapTap: () => void;
  onMuteTap: () => void;
}

/**
 * Attach pointer and keyboard activation to a focusable element. Pointer events give near-instant
 * touch feedback; the keydown listener keeps the control usable with keyboard / screen readers.
 */
function makeTappable(el: HTMLElement, handler: () => void): void {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handler();
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  });
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

  makeTappable(btn, onClick);

  return btn;
}

/** Render the top bar with home button, level title, and swap/mute buttons */
export function renderTopBar(
  container: HTMLElement,
  levelTitle: string,
  enabled: boolean,
  handlers: {
    onHomeTap: () => void;
    onSwapTap: () => void;
    onMuteTap: () => void;
    muted: boolean;
  },
): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'top-bar';

  // Left: Home button
  const left = document.createElement('div');
  left.className = 'top-bar__left';
  const homeBtn = createButton('🏠', 'Home', 'btn btn-mute', handlers.onHomeTap);
  left.appendChild(homeBtn);

  // Center: Level title
  const center = document.createElement('div');
  center.className = 'top-bar__center';
  const title = document.createElement('span');
  title.className = 'top-bar__title';
  title.textContent = levelTitle;
  center.appendChild(title);

  // Right: Swap + Mute
  const right = document.createElement('div');
  right.className = 'top-bar__right';
  const swapBtn = createButton('🦖', 'Swap Character', 'btn btn-swap', handlers.onSwapTap);
  const muteBtn = createButton(
    handlers.muted ? '🔇' : '🔊',
    handlers.muted ? 'Unmute' : 'Mute',
    'btn btn-mute',
    handlers.onMuteTap,
  );
  if (!enabled) {
    swapBtn.disabled = true;
    swapBtn.classList.add('btn--disabled');
  }
  right.appendChild(swapBtn);
  right.appendChild(muteBtn);

  bar.appendChild(left);
  bar.appendChild(center);
  bar.appendChild(right);

  container.appendChild(bar);
  return bar;
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
    const btn = createButton(COMMAND_EMOJI[cmd], COMMAND_LABELS[cmd], `cmd-btn btn-command`, () =>
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
  isDeleting?: boolean,
  deletedIndex?: number,
): HTMLElement {
  const track = document.createElement('div');
  track.className = 'track';

  for (let i = 0; i < budget; i++) {
    const slot = document.createElement('div');
    slot.className = 'track-slot';

    if (i < commands.length) {
      slot.textContent = COMMAND_EMOJI[commands[i]];
      slot.classList.add('track-slot--filled');
      slot.setAttribute('aria-label', `Step ${i + 1}: ${COMMAND_LABELS[commands[i]]}`);
      slot.setAttribute('tabindex', '0');
      slot.setAttribute('role', 'button');

      // Delete animation: shrink + fade on the removed slot
      if (isDeleting && deletedIndex !== undefined && i === deletedIndex) {
        slot.classList.add('track-slot--delete');
      }
    } else {
      slot.setAttribute('aria-label', `Step ${i + 1}: empty`);
    }

    if (enabled && i < commands.length) {
      makeTappable(slot, () => onSlotTap(i));
    }

    track.appendChild(slot);
  }

  container.appendChild(track);
  return track;
}

/**
 * Animate the last filled track slot (scale-up + fade-in). Call AFTER the track is appended to the
 * DOM.
 */
export function animateLastSlot(trackEl: HTMLElement, commandCount: number): void {
  const slots = trackEl.querySelectorAll('.track-slot');
  const lastFilled = slots[commandCount - 1];
  if (lastFilled) {
    lastFilled.classList.add('track-slot--add');
  }
}

/** Render the GO button */
export function renderGoButton(
  container: HTMLElement,
  enabled: boolean,
  onGo: () => void,
  shouldPulse?: boolean,
): HTMLButtonElement {
  const btn = createButton('▶️', 'Go', 'btn btn-go', onGo);

  if (!enabled) {
    btn.disabled = true;
    btn.classList.add('btn--disabled');
  }

  // Pulse when commands are queued but execution hasn't started
  if (shouldPulse && enabled) {
    btn.classList.add('btn-go--pulse');
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
  const btn = createButton('🦖', 'Swap Character', 'btn btn-swap', onSwap);

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
  const btn = createButton(
    muted ? '🔇' : '🔊',
    muted ? 'Unmute' : 'Mute',
    'btn btn-mute',
    onToggle,
  );

  container.appendChild(btn);
  return btn;
}

/** Render the home screen with character selection */
export function renderHomeScreen(
  container: HTMLElement,
  onSelect: (character: DinoCharacter) => void,
  gameComplete?: boolean,
  onReset?: () => void,
): HTMLElement {
  const home = document.createElement('div');
  home.className = 'home-screen';

  const title = document.createElement('h1');
  title.textContent = 'DinoSteps';
  title.className = 'home-screen__title';
  home.appendChild(title);

  // Trophy indicator when all levels are complete
  if (gameComplete) {
    const trophy = document.createElement('div');
    trophy.className = 'home-screen__trophy';
    trophy.textContent = '🏆';
    trophy.setAttribute('aria-label', 'All levels completed!');
    home.appendChild(trophy);
  }

  // Reset progress button (hidden by default, revealed on long-press title)
  let resetContainer: HTMLDivElement | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  const hideReset = (): void => {
    if (confirmTimer) {
      clearTimeout(confirmTimer);
      confirmTimer = null;
    }
    if (resetContainer) {
      resetContainer.remove();
      resetContainer = null;
    }
  };

  const showResetConfirm = (): void => {
    if (resetContainer) return;

    resetContainer = document.createElement('div');
    resetContainer.className = 'home-screen__reset-confirm';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Progress';
    resetBtn.className = 'btn btn-reset';
    resetBtn.setAttribute('aria-label', 'Reset all progress');

    makeTappable(resetBtn, () => {
      if (confirmTimer) {
        // Second tap — confirmed reset
        clearTimeout(confirmTimer);
        confirmTimer = null;
        hideReset();
        onReset?.();
      } else {
        // First tap — show confirmation state
        resetBtn.textContent = 'Tap again to confirm';
        resetBtn.classList.add('btn-reset--confirm');
        confirmTimer = setTimeout(() => {
          hideReset();
        }, 3000);
      }
    });

    resetContainer.appendChild(resetBtn);
    home.insertBefore(resetContainer, home.firstChild?.nextSibling ?? null);
  };

  // Long-press detection on title
  const startHold = (): void => {
    holdTimer = setTimeout(() => {
      showResetConfirm();
    }, 2000); // 2-second hold threshold
  };

  const cancelHold = (): void => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  title.addEventListener('touchstart', startHold, { passive: true });
  title.addEventListener('touchend', cancelHold);
  title.addEventListener('touchmove', cancelHold);
  title.addEventListener('mousedown', startHold);
  title.addEventListener('mouseup', cancelHold);
  title.addEventListener('mouseleave', cancelHold);

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Choose your dinosaur!';
  subtitle.className = 'home-screen__subtitle';
  home.appendChild(subtitle);

  const chars = CHARACTERS;

  const cards = document.createElement('div');
  cards.className = 'home-screen__cards';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const card = document.createElement('button');
    card.className = 'char-card char-card--enter';
    card.setAttribute('data-character', ch.name);
    card.style.animationDelay = `${i * 100}ms`;

    // SVG character image with idle bob
    const img = document.createElement('img');
    img.src = ch.svg;
    img.alt = ch.name;
    img.className = 'char-card__img';
    card.appendChild(img);

    const name = document.createElement('span');
    name.textContent = ch.name;
    name.className = 'char-card__name';
    name.setAttribute('data-character', ch.name);
    card.appendChild(name);

    makeTappable(card, () => onSelect(ch.name));

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
  levels: { id: number; title: string; grid: string[][]; trackBudget: number }[],
  onSelect: (levelId: number) => void,
): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'level-select-screen';

  const title = document.createElement('h2');
  title.textContent = 'Select Level';
  title.className = 'level-select-screen__title';
  screen.appendChild(title);

  // Group levels by track-budget band
  const bands = new Map<number, typeof levels>();
  for (const level of levels) {
    const band = level.trackBudget;
    if (!bands.has(band)) bands.set(band, []);
    bands.get(band)!.push(level);
  }

  const grid = document.createElement('div');
  grid.className = 'level-select__grid';

  // Sort bands by budget (6 → 8 → 10)
  const sortedBands = [...bands.entries()].sort(([a], [b]) => a - b);

  for (const [budget, bandLevels] of sortedBands) {
    // Band header
    const bandHeader = document.createElement('div');
    bandHeader.className = 'level-band__header';
    bandHeader.textContent = `${budget} Steps`;
    grid.appendChild(bandHeader);

    for (const level of bandLevels) {
      const tile = document.createElement('button');
      tile.className = 'level-tile';
      tile.style.animationDelay = `${(level.id - 1) * 60}ms`;

      const isCompleted = level.id < unlockedLevel;
      const isCurrent = level.id === unlockedLevel;
      const isLocked = level.id > unlockedLevel;

      if (isLocked) {
        tile.classList.add('level-tile--locked');
        tile.disabled = true;
      } else {
        tile.classList.add('level-tile--unlocked');
        makeTappable(tile, () => onSelect(level.id));
      }

      if (isCompleted) {
        tile.classList.add('level-tile--completed');
      }
      if (isCurrent) {
        tile.classList.add('level-tile--current');
      }

      // Level number
      const num = document.createElement('span');
      num.className = 'level-tile__num';
      num.textContent = String(level.id);
      tile.appendChild(num);

      // Title
      const tileTitle = document.createElement('span');
      tileTitle.className = 'level-tile__title';
      tileTitle.textContent = level.title;
      tile.appendChild(tileTitle);

      // Mini grid preview
      const preview = document.createElement('div');
      preview.className = 'level-tile__preview';
      for (let r = 0; r < level.grid.length; r++) {
        for (let c = 0; c < level.grid[r].length; c++) {
          const cell = document.createElement('div');
          cell.className = 'level-tile__cell';
          // Grid is string[][]; assertion safe — parseLevel validates tile values.
          const tileType = level.grid[r][c] as TileType;
          if (isFood(tileType)) cell.classList.add('level-tile__cell--food');
          else if (isObstacle(tileType)) cell.classList.add('level-tile__cell--obstacle');
          else if (isInteractable(tileType)) cell.classList.add('level-tile__cell--interactable');
          preview.appendChild(cell);
        }
      }
      tile.appendChild(preview);

      // Completed star
      if (isCompleted) {
        const star = document.createElement('span');
        star.className = 'level-tile__star';
        star.textContent = '⭐';
        tile.appendChild(star);
      }

      grid.appendChild(tile);
    }
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
    const isCurrent = ch.name === current;
    btn.className = `character-carousel__btn${isCurrent ? ' character-carousel__btn--active' : ''}`;
    btn.setAttribute('data-character', ch.name);
    btn.setAttribute('aria-pressed', String(isCurrent));

    // SVG character image
    const img = document.createElement('img');
    img.src = ch.svg;
    img.alt = ch.name;
    img.className = 'character-carousel__img';
    btn.appendChild(img);

    const label = document.createElement('span');
    label.textContent = ch.name;
    btn.appendChild(label);

    makeTappable(btn, () => {
      onSelect(ch.name);
      onClose();
    });

    panel.appendChild(btn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cancel';
  closeBtn.className = 'character-carousel__close';
  makeTappable(closeBtn, onClose);
  panel.appendChild(closeBtn);

  overlay.appendChild(panel);
  container.appendChild(overlay);
  return overlay;
}
