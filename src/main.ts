// DinoSteps - Main Entry Point
// A text-free web game that introduces sequencing to preschoolers

import { initCanvas } from "./render/canvas";
import { startLoop } from "./render/loop";
import { drawGrid } from "./render/grid";
import { drawDino, createDinoAnimState } from "./render/dino";
import { createMovementState, updateMovement, isIdle, startWalk, startTurn } from "./render/movement";
import { parseLevels } from "./engine/levelData";
import {
  createInitialState,
  addCommand,
  removeCommand,
  resetToStart,
} from "./engine/state";
import {
  processNextCommand,
  applyCommand,
  hardFail,
  checkTerminalState,
} from "./engine/executor";
import { loadPersisted, saveCharacter, saveMuted, saveUnlockedLevel } from "./engine/persistence";
import {
  renderActionMenu,
  renderTrack,
  renderGoButton,
  renderSwapButton,
  renderMuteButton,
  renderHomeScreen,
  renderLevelSelect,
  renderCharacterCarousel,
} from "./input/tap";
import type { DinoCharacter, GameState, Command } from "./engine/types";

// Level data
const levelsData = [
  {
    id: 1,
    title: "Hungry Steps",
    grid: [
      ["empty", "empty", "empty", "empty", "empty"],
      ["empty", "empty", "empty", "food", "empty"],
      ["empty", "empty", "empty", "empty", "empty"],
    ],
    start: { x: 0, y: 1 },
    startFacing: "E",
    food: { x: 3, y: 1 },
    trackBudget: 6,
    verifiedSolution: ["F", "F", "F", "A"],
  },
];

const levels = parseLevels(levelsData);

// App state
const persisted = loadPersisted();
let gameState: GameState | null = null;
let currentLevelIndex = 0;
let currentMuted = persisted.muted;
let showingHome = true;
let showingLevelSelect = false;

// Win state
let winTimer = 0;
let showWin = false;

// UI containers
let uiContainer: HTMLDivElement;
let actionMenuEl: HTMLElement | null = null;
let trackEl: HTMLElement | null = null;
let goBtnEl: HTMLButtonElement | null = null;
let swapBtnEl: HTMLButtonElement | null = null;
let muteBtnEl: HTMLButtonElement | null = null;
let homeEl: HTMLElement | null = null;
let levelSelectEl: HTMLElement | null = null;
let carouselEl: HTMLElement | null = null;
let winEl: HTMLElement | null = null;
let hintEl: HTMLElement | null = null;

// Animation state
const dinoAnim = createDinoAnimState();
let movement = createMovementState(0, 1);

function clearUI(): void {
  if (actionMenuEl) {
    actionMenuEl.remove();
    actionMenuEl = null;
  }
  if (trackEl) {
    trackEl.remove();
    trackEl = null;
  }
  if (goBtnEl) {
    goBtnEl.remove();
    goBtnEl = null;
  }
  if (swapBtnEl) {
    swapBtnEl.remove();
    swapBtnEl = null;
  }
  if (muteBtnEl) {
    muteBtnEl.remove();
    muteBtnEl = null;
  }
  if (homeEl) {
    homeEl.remove();
    homeEl = null;
  }
  if (levelSelectEl) {
    levelSelectEl.remove();
    levelSelectEl = null;
  }
  if (carouselEl) {
    carouselEl.remove();
    carouselEl = null;
  }
  if (winEl) {
    winEl.remove();
    winEl = null;
  }
  if (hintEl) {
    hintEl.remove();
    hintEl = null;
  }
}

function refreshGameUI(): void {
  if (!gameState) return;
  clearUI();

  // Action menu
  actionMenuEl = renderActionMenu(
    uiContainer,
    {
      onCommandTap: (cmd: Command) => {
        if (!gameState || gameState.isExecuting) return;
        gameState = addCommand(gameState, cmd);
        refreshGameUI();
      },
      onTrackTap: () => {},
      onGoTap: () => handleGo(),
      onSwapTap: () => handleSwap(),
      onMuteTap: () => handleMute(),
    },
    !gameState.isExecuting,
  );

  // Track slots
  trackEl = renderTrack(
    uiContainer,
    gameState.trackBudget,
    gameState.commandQueue,
    !gameState.isExecuting,
    (index: number) => {
      if (!gameState || gameState.isExecuting) return;
      gameState = removeCommand(gameState, index);
      refreshGameUI();
    },
  );

  // GO button
  goBtnEl = renderGoButton(
    uiContainer,
    !gameState.isExecuting && gameState.commandQueue.length > 0,
    () => handleGo(),
  );

  // Hint text
  hintEl = document.createElement("div");
  hintEl.style.position = "fixed";
  hintEl.style.top = "12px";
  hintEl.style.left = "50%";
  hintEl.style.transform = "translateX(-50%)";
  hintEl.style.background = "rgba(0,0,0,0.6)";
  hintEl.style.color = "white";
  hintEl.style.padding = "8px 20px";
  hintEl.style.borderRadius = "20px";
  hintEl.style.fontSize = "18px";
  hintEl.style.fontWeight = "bold";
  hintEl.style.zIndex = "250";
  hintEl.style.pointerEvents = "none";
  hintEl.textContent = `🍎 Feed ${gameState.character}!`;
  uiContainer.appendChild(hintEl);

  // Swap button
  swapBtnEl = renderSwapButton(uiContainer, !gameState.isExecuting, () => handleSwap());
}

function handleGo(): void {
  if (!gameState || gameState.isExecuting) return;
  if (gameState.commandQueue.length === 0) return;

  // Set activeCommandIndex to 0 to start execution
  gameState = {
    ...gameState,
    isExecuting: true,
    activeCommandIndex: 0,
  };
  refreshGameUI();
}

/**
 * Process the next command in the queue during execution.
 * Called from the render loop when animation is idle.
 */
function processNextExecCommand(): void {
  if (!gameState || !gameState.isExecuting) return;

  const level = levels[currentLevelIndex];
  const result = processNextCommand(gameState, level);

  switch (result.type) {
    case "win": {
      gameState = { ...gameState, isExecuting: false };
      // Show win overlay
      showWin = true;
      winTimer = 1.5; // 1.5 seconds of celebration
      winEl = document.createElement("div");
      winEl.style.position = "fixed";
      winEl.style.inset = "0";
      winEl.style.display = "flex";
      winEl.style.flexDirection = "column";
      winEl.style.alignItems = "center";
      winEl.style.justifyContent = "center";
      winEl.style.background = "rgba(76, 175, 80, 0.85)";
      winEl.style.zIndex = "300";
      winEl.style.pointerEvents = "auto";
      winEl.innerHTML =
        '<div style="font-size:64px;margin-bottom:16px">🎉</div>' +
        '<div style="font-size:32px;color:white;font-weight:bold">Level Complete!</div>';
      uiContainer.appendChild(winEl);
      break;
    }
    case "hardFail": {
      gameState = hardFail(gameState, level);
      // Sync movement to reset position
      movement.fromX = level.start.x;
      movement.fromY = level.start.y;
      movement.toX = level.start.x;
      movement.toY = level.start.y;
      movement.animState = "idle";
      movement.elapsed = 0;
      refreshGameUI();
      break;
    }
    case "softResist": {
      // Advance index without moving
      gameState = {
        ...gameState,
        activeCommandIndex: gameState.activeCommandIndex + 1,
      };
      // Check if queue is exhausted
      if (gameState.activeCommandIndex >= gameState.commandQueue.length) {
        const terminal = checkTerminalState(gameState, level);
        if (terminal.type === "hint") {
          // On food without action — hint, reset
          gameState = resetToStart(gameState, level);
        }
        gameState = { ...gameState, isExecuting: false };
        refreshGameUI();
      }
      break;
    }
    case "continue": {
      // Apply command — this updates position/facing
      gameState = applyCommand(gameState, level);

      // Start animation for the command
      const cmd = gameState.commandQueue[gameState.activeCommandIndex - 1];
      if (cmd === "F") {
        // Walk animation — from old pos to new pos
        startWalk(
          movement,
          gameState.dinoPos.x,
          gameState.dinoPos.y,
        );
      } else if (cmd === "L" || cmd === "R") {
        startTurn(movement);
      }
      // Action commands: no movement animation

      // Check if queue is exhausted after this command
      if (gameState.activeCommandIndex >= gameState.commandQueue.length) {
        const terminal = checkTerminalState(gameState, level);
        if (terminal.type === "hint") {
          gameState = resetToStart(gameState, level);
          movement.fromX = level.start.x;
          movement.fromY = level.start.y;
          movement.toX = level.start.x;
          movement.toY = level.start.y;
          movement.animState = "idle";
          movement.elapsed = 0;
          gameState = { ...gameState, isExecuting: false };
          refreshGameUI();
        } else if (terminal.type === "idle") {
          gameState = { ...gameState, isExecuting: false };
          refreshGameUI();
        }
        // Win is handled by processNextCommand on the next call
      }
      break;
    }
  }
}

function handleSwap(): void {
  if (!gameState || gameState.isExecuting) return;
  carouselEl = renderCharacterCarousel(
    uiContainer,
    gameState.character,
    (ch: DinoCharacter) => {
      if (!gameState) return;
      gameState = { ...gameState, character: ch };
      saveCharacter(ch);
      refreshGameUI();
    },
    () => {
      if (carouselEl) {
        carouselEl.remove();
        carouselEl = null;
      }
    },
  );
}

function handleMute(): void {
  currentMuted = !currentMuted;
  saveMuted(currentMuted);
  if (muteBtnEl) {
    muteBtnEl.remove();
    muteBtnEl = null;
  }
  muteBtnEl = renderMuteButton(uiContainer, currentMuted, () => handleMute());
}

function enterGame(levelIndex: number): void {
  currentLevelIndex = levelIndex;
  const level = levels[levelIndex];
  const persisted = loadPersisted();
  gameState = createInitialState(level, persisted.chosenCharacter);
  showingHome = false;
  showingLevelSelect = false;
  clearUI();
  refreshGameUI();
}

function showHome(): void {
  showingHome = true;
  clearUI();
  homeEl = renderHomeScreen(uiContainer, (ch) => {
    saveCharacter(ch);
    showingHome = false;
    showingLevelSelect = true;
    clearUI();
    showLevelSelect();
  });
}

function showLevelSelect(): void {
  const persisted = loadPersisted();
  levelSelectEl = renderLevelSelect(uiContainer, persisted.unlockedLevel, levels.length, (id) => {
    enterGame(id - 1);
  });
}

// Init
function init(): void {
  initCanvas();
  uiContainer = document.createElement("div");
  uiContainer.id = "ui-overlay";
  uiContainer.style.position = "fixed";
  uiContainer.style.top = "0";
  uiContainer.style.left = "0";
  uiContainer.style.width = "100%";
  uiContainer.style.height = "100%";
  uiContainer.style.pointerEvents = "none";
  document.body.appendChild(uiContainer);

  showHome();

  startLoop((dt) => {
    dinoAnim.idleTime += dt;

    if (gameState && !showingHome && !showingLevelSelect) {
      const level = levels[currentLevelIndex];
      const gridMetrics = drawGrid(level);

      // Win timer — advance after celebration
      if (showWin) {
        winTimer -= dt;
        if (winTimer <= 0) {
          showWin = false;
          if (winEl) { winEl.remove(); winEl = null; }
          const nextIndex = currentLevelIndex + 1;
          if (nextIndex < levels.length) {
            currentLevelIndex = nextIndex;
            saveUnlockedLevel(nextIndex + 1);
            gameState = createInitialState(levels[nextIndex], gameState.character);
            movement = createMovementState(gameState.dinoPos.x, gameState.dinoPos.y);
          }
          refreshGameUI();
        }
      }

      // Step-by-step execution: process next command when animation is idle
      if (gameState.isExecuting && isIdle(movement)) {
        processNextExecCommand();
      }

      // Update movement interpolation
      const pos = updateMovement(movement, dt);

      drawDino(
        gridMetrics.offsetX + gridMetrics.tileSize * pos.x,
        gridMetrics.offsetY + gridMetrics.tileSize * pos.y,
        gridMetrics.tileSize,
        gameState.character,
        gameState.dinoFacing,
        dinoAnim,
        isIdle(movement) ? "idle" : movement.animState,
      );
    } else if (showingHome || showingLevelSelect) {
      // Draw idle dino on level 1 grid behind home screen
      const gridMetrics = drawGrid(levels[0]);
      drawDino(
        gridMetrics.offsetX + gridMetrics.tileSize * levels[0].start.x,
        gridMetrics.offsetY + gridMetrics.tileSize * levels[0].start.y,
        gridMetrics.tileSize,
        "Rexy",
        levels[0].startFacing,
        dinoAnim,
        "idle",
      );
    }
  });

  console.log("DinoSteps loaded!");
}

init();
