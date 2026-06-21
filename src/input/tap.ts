// Tap Input Module
// Handles Pointer Events for command buttons and track interactions

import type { Command } from "../engine/types";

// Command to emoji mapping (render-time only)
export const COMMAND_EMOJI: Record<Command, string> = {
  F: "🐾",
  L: "↩️",
  R: "↪️",
  A: "🦕",
};

// Command display names for accessibility
export const COMMAND_LABELS: Record<Command, string> = {
  F: "Forward",
  L: "Turn Left",
  R: "Turn Right",
  A: "Action",
};

export interface TapHandler {
  onCommandTap: (cmd: Command) => void;
  onTrackTap: (index: number) => void;
  onGoTap: () => void;
  onSwapTap: () => void;
  onMuteTap: () => void;
}

/**
 * Create a button element with proper touch target sizing
 */
function createButton(
  label: string,
  ariaLabel: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);
  btn.className = className;
  btn.style.minWidth = "64px";
  btn.style.minHeight = "64px";
  btn.style.touchAction = "manipulation";
  btn.style.userSelect = "none";
  btn.style.cursor = "pointer";
  btn.style.border = "none";
  btn.style.borderRadius = "12px";
  btn.style.fontSize = "24px";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.justifyContent = "center";

  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    onClick();
  });

  return btn;
}

/**
 * Render the action menu with 4 command buttons
 */
export function renderActionMenu(
  container: HTMLElement,
  handler: TapHandler,
  enabled: boolean,
): HTMLElement {
  const menu = document.createElement("div");
  menu.className = "action-menu";
  menu.style.display = "flex";
  menu.style.gap = "8px";
  menu.style.justifyContent = "center";
  menu.style.padding = "8px";

  const commands: Command[] = ["F", "L", "R", "A"];
  for (const cmd of commands) {
    const btn = createButton(COMMAND_EMOJI[cmd], COMMAND_LABELS[cmd], `cmd-btn cmd-${cmd}`, () =>
      handler.onCommandTap(cmd),
    );
    if (!enabled) {
      btn.disabled = true;
      btn.style.opacity = "0.4";
    }
    menu.appendChild(btn);
  }

  container.appendChild(menu);
  return menu;
}

/**
 * Render the track slots display
 */
export function renderTrack(
  container: HTMLElement,
  budget: number,
  commands: Command[],
  enabled: boolean,
  onSlotTap: (index: number) => void,
): HTMLElement {
  const track = document.createElement("div");
  track.className = "track-slots";
  track.style.display = "flex";
  track.style.gap = "4px";
  track.style.justifyContent = "center";
  track.style.padding = "8px";

  for (let i = 0; i < budget; i++) {
    const slot = document.createElement("div");
    slot.className = "track-slot";
    slot.style.width = "48px";
    slot.style.height = "48px";
    slot.style.border = "2px dashed #999";
    slot.style.borderRadius = "8px";
    slot.style.display = "flex";
    slot.style.alignItems = "center";
    slot.style.justifyContent = "center";
    slot.style.fontSize = "24px";
    slot.style.background = "#f5f5f5";

    if (i < commands.length) {
      slot.textContent = COMMAND_EMOJI[commands[i]];
      slot.style.borderStyle = "solid";
      slot.style.borderColor = "#4caf50";
      slot.style.background = "#e8f5e9";
      slot.setAttribute("aria-label", `Step ${i + 1}: ${COMMAND_LABELS[commands[i]]}`);
    } else {
      slot.setAttribute("aria-label", `Step ${i + 1}: empty`);
    }

    if (enabled && i < commands.length) {
      slot.style.cursor = "pointer";
      slot.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        onSlotTap(i);
      });
    }

    track.appendChild(slot);
  }

  container.appendChild(track);
  return track;
}

/**
 * Render the GO button
 */
export function renderGoButton(
  container: HTMLElement,
  enabled: boolean,
  onGo: () => void,
): HTMLButtonElement {
  const btn = createButton("▶️", "Go", "go-btn", onGo);
  btn.style.background = enabled ? "#4caf50" : "#ccc";
  btn.style.color = "white";
  btn.style.fontSize = "28px";
  btn.style.fontWeight = "bold";

  if (!enabled) {
    btn.disabled = true;
    btn.style.opacity = "0.4";
  }

  container.appendChild(btn);
  return btn;
}

/**
 * Render the character swap button
 */
export function renderSwapButton(
  container: HTMLElement,
  enabled: boolean,
  onSwap: () => void,
): HTMLButtonElement {
  const btn = createButton("🦖", "Swap Character", "swap-btn", onSwap);
  btn.style.position = "absolute";
  btn.style.top = "8px";
  btn.style.right = "8px";
  btn.style.background = "rgba(255,255,255,0.8)";
  btn.style.borderRadius = "50%";
  btn.style.width = "48px";
  btn.style.height = "48px";
  btn.style.minWidth = "48px";
  btn.style.minHeight = "48px";
  btn.style.fontSize = "20px";

  if (!enabled) {
    btn.disabled = true;
    btn.style.opacity = "0.4";
  }

  container.appendChild(btn);
  return btn;
}

/**
 * Render the mute toggle button
 */
export function renderMuteButton(
  container: HTMLElement,
  muted: boolean,
  onToggle: () => void,
): HTMLButtonElement {
  const btn = createButton(muted ? "🔇" : "🔊", muted ? "Unmute" : "Mute", "mute-btn", onToggle);
  btn.style.position = "absolute";
  btn.style.top = "8px";
  btn.style.left = "8px";
  btn.style.background = "rgba(255,255,255,0.8)";
  btn.style.borderRadius = "50%";
  btn.style.width = "48px";
  btn.style.height = "48px";
  btn.style.minWidth = "48px";
  btn.style.minHeight = "48px";
  btn.style.fontSize = "20px";

  container.appendChild(btn);
  return btn;
}

/**
 * Render the home screen with character selection
 */
export function renderHomeScreen(
  container: HTMLElement,
  onSelect: (character: "Rexy" | "Trikey" | "Sera") => void,
): HTMLElement {
  const home = document.createElement("div");
  home.className = "home-screen";
  home.style.position = "absolute";
  home.style.inset = "0";
  home.style.display = "flex";
  home.style.flexDirection = "column";
  home.style.alignItems = "center";
  home.style.justifyContent = "center";
  home.style.background = "#fff";
  home.style.zIndex = "100";

  const title = document.createElement("h1");
  title.textContent = "DinoSteps";
  title.style.fontSize = "36px";
  title.style.marginBottom = "24px";
  title.style.color = "#333";
  home.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.textContent = "Choose your dinosaur!";
  subtitle.style.fontSize = "18px";
  subtitle.style.marginBottom = "16px";
  subtitle.style.color = "#666";
  home.appendChild(subtitle);

  const chars: { name: "Rexy" | "Trikey" | "Sera"; color: string; emoji: string }[] = [
    { name: "Rexy", color: "#4caf50", emoji: "🦖" },
    { name: "Trikey", color: "#42a5f5", emoji: "🦕" },
    { name: "Sera", color: "#ef5350", emoji: "🦕" },
  ];

  const cards = document.createElement("div");
  cards.style.display = "flex";
  cards.style.gap = "16px";

  for (const ch of chars) {
    const card = document.createElement("button");
    card.className = "char-card";
    card.style.width = "120px";
    card.style.height = "140px";
    card.style.border = `3px solid ${ch.color}`;
    card.style.borderRadius = "16px";
    card.style.background = "#fff";
    card.style.cursor = "pointer";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.alignItems = "center";
    card.style.justifyContent = "center";
    card.style.gap = "8px";
    card.style.touchAction = "manipulation";

    const emoji = document.createElement("span");
    emoji.textContent = ch.emoji;
    emoji.style.fontSize = "48px";
    card.appendChild(emoji);

    const name = document.createElement("span");
    name.textContent = ch.name;
    name.style.fontSize = "16px";
    name.style.fontWeight = "bold";
    name.style.color = ch.color;
    card.appendChild(name);

    card.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      onSelect(ch.name);
    });

    cards.appendChild(card);
  }

  home.appendChild(cards);
  container.appendChild(home);
  return home;
}

/**
 * Render the level select screen
 */
export function renderLevelSelect(
  container: HTMLElement,
  unlockedLevel: number,
  totalLevels: number,
  onSelect: (levelId: number) => void,
): HTMLElement {
  const screen = document.createElement("div");
  screen.className = "level-select-screen";
  screen.style.position = "absolute";
  screen.style.inset = "0";
  screen.style.display = "flex";
  screen.style.flexDirection = "column";
  screen.style.alignItems = "center";
  screen.style.justifyContent = "center";
  screen.style.background = "#fff";
  screen.style.zIndex = "100";

  const title = document.createElement("h2");
  title.textContent = "Select Level";
  title.style.fontSize = "24px";
  title.style.marginBottom = "16px";
  screen.appendChild(title);

  const grid = document.createElement("div");
  grid.style.display = "flex";
  grid.style.gap = "12px";
  grid.style.flexWrap = "wrap";
  grid.style.justifyContent = "center";

  for (let i = 1; i <= totalLevels; i++) {
    const tile = document.createElement("button");
    tile.textContent = String(i);
    tile.style.width = "64px";
    tile.style.height = "64px";
    tile.style.borderRadius = "12px";
    tile.style.fontSize = "24px";
    tile.style.fontWeight = "bold";
    tile.style.touchAction = "manipulation";

    if (i <= unlockedLevel) {
      tile.style.background = "#4caf50";
      tile.style.color = "white";
      tile.style.cursor = "pointer";
      tile.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        onSelect(i);
      });
    } else {
      tile.style.background = "#e0e0e0";
      tile.style.color = "#999";
      tile.disabled = true;
      tile.style.cursor = "not-allowed";
    }

    grid.appendChild(tile);
  }

  screen.appendChild(grid);
  container.appendChild(screen);
  return screen;
}

/**
 * Render the character carousel overlay
 */
export function renderCharacterCarousel(
  container: HTMLElement,
  current: "Rexy" | "Trikey" | "Sera",
  onSelect: (character: "Rexy" | "Trikey" | "Sera") => void,
  onClose: () => void,
): HTMLElement {
  const overlay = document.createElement("div");
  overlay.className = "character-carousel";
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.zIndex = "200";

  const panel = document.createElement("div");
  panel.style.background = "white";
  panel.style.borderRadius = "16px";
  panel.style.padding = "24px";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.alignItems = "center";
  panel.style.gap = "16px";

  const title = document.createElement("h3");
  title.textContent = "Choose Character";
  panel.appendChild(title);

  const chars: { name: "Rexy" | "Trikey" | "Sera"; color: string; emoji: string }[] = [
    { name: "Rexy", color: "#4caf50", emoji: "🦖" },
    { name: "Trikey", color: "#42a5f5", emoji: "🦕" },
    { name: "Sera", color: "#ef5350", emoji: "🦕" },
  ];

  for (const ch of chars) {
    const btn = document.createElement("button");
    btn.textContent = `${ch.emoji} ${ch.name}`;
    btn.style.width = "200px";
    btn.style.padding = "12px";
    btn.style.border = `3px solid ${ch.name === current ? ch.color : "#ddd"}`;
    btn.style.borderRadius = "12px";
    btn.style.background = ch.name === current ? `${ch.color}22` : "white";
    btn.style.fontSize = "18px";
    btn.style.cursor = "pointer";
    btn.style.touchAction = "manipulation";

    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      onSelect(ch.name);
      onClose();
    });

    panel.appendChild(btn);
  }

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Cancel";
  closeBtn.style.padding = "8px 24px";
  closeBtn.style.border = "1px solid #ccc";
  closeBtn.style.borderRadius = "8px";
  closeBtn.style.background = "white";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    onClose();
  });
  panel.appendChild(closeBtn);

  overlay.appendChild(panel);
  container.appendChild(overlay);
  return overlay;
}
