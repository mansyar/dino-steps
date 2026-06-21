// DinoSteps - Main Entry Point
// A text-free web game that introduces sequencing to preschoolers

import './styles.css';
import { initCanvas } from './render/canvas';
import { startLoop } from './render/loop';
import { drawGrid, drawFoodWiggle } from './render/grid';
import { drawDino, drawDizzyRings, drawBump, createDinoAnimState } from './render/dino';
import { preloadCharacters } from './render/characters';
import {
  createMovementState,
  updateMovement,
  isIdle,
  startWalk,
  startTurn,
} from './render/movement';
import {
  createConfettiState,
  burstConfetti,
  burstConfettiReduced,
  updateConfetti,
} from './render/confetti';
import { parseLevels } from './engine/levelData';
import { createInitialState, addCommand, removeCommand, resetToStart } from './engine/state';
import { processNextCommand, applyCommand, hardFail, checkTerminalState } from './engine/executor';
import { loadPersisted, saveCharacter, saveMuted, saveUnlockedLevel } from './engine/persistence';
import { playStomp, playBonk, playSuccess, playTurn, playAction } from './audio/sfx';
import { resumeAudioContext } from './audio/context';
import {
  renderActionMenu,
  renderTrack,
  renderGoButton,
  renderSwapButton,
  renderMuteButton,
  renderHomeScreen,
  renderLevelSelect,
  renderCharacterCarousel,
} from './input/tap';
import type { DinoCharacter, GameState, Command, Facing } from './engine/types';

// Level data
const levelsData = [
  {
    id: 1,
    title: 'Hungry Steps',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'food', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 1 },
    startFacing: 'E',
    food: { x: 3, y: 1 },
    trackBudget: 6,
    verifiedSolution: ['F', 'F', 'F', 'A'],
  },
];

const levels = parseLevels(levelsData);

// Accessibility: check prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
let backflipProgress = 0;

// Failure animation state
let failTimer = 0;
let showFail = false;
let failFacing: Facing = 'E';
let failBumpProgress = 0;
let failDizzyProgress = 0;

// Hint animation state
let showHint = false;
let hintTimer = 0;
let hintTime = 0;

// Confetti
const confetti = createConfettiState();

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

  // Hint text — inserted into flow between track and game area
  hintEl = document.createElement('div');
  hintEl.className = 'hint-text';
  hintEl.textContent = `🍎 Feed ${gameState.character}!`;
  uiContainer.appendChild(hintEl);

  // Swap button
  swapBtnEl = renderSwapButton(uiContainer, !gameState.isExecuting, () => handleSwap());

  // Mute button (top-left corner)
  muteBtnEl = renderMuteButton(uiContainer, currentMuted, () => handleMute());
}

function handleGo(): void {
  if (!gameState || gameState.isExecuting) return;
  if (gameState.commandQueue.length === 0) return;

  // Resume audio context if it exists (mobile autoplay policy)
  resumeAudioContext();

  // Clear any previous animations
  showFail = false;
  showHint = false;
  hintTimer = 0;

  // Set activeCommandIndex to 0 to start execution
  gameState = {
    ...gameState,
    isExecuting: true,
    activeCommandIndex: 0,
  };
  refreshGameUI();
}

/**
 * Process the next command in the queue during execution. Called from the render loop when
 * animation is idle.
 */
function processNextExecCommand(): void {
  if (!gameState || !gameState.isExecuting) return;

  const level = levels[currentLevelIndex];
  const result = processNextCommand(gameState, level);

  switch (result.type) {
    case 'win': {
      gameState = { ...gameState, isExecuting: false };
      if (!currentMuted) playSuccess();

      // Start win animation
      showWin = true;
      winTimer = 2.0; // 2 seconds of celebration
      backflipProgress = 0;

      // Burst confetti
      if (prefersReducedMotion) {
        burstConfettiReduced(confetti, 300, 300);
      } else {
        burstConfetti(confetti, 300, 300);
      }

      // Show win overlay
      winEl = document.createElement('div');
      winEl.className = 'win-overlay';
      winEl.innerHTML =
        '<div style="font-size:64px;margin-bottom:16px">🎉</div>' + '<h2>Level Complete!</h2>';
      uiContainer.appendChild(winEl);
      break;
    }
    case 'hardFail': {
      // Save facing before reset for bump animation
      failFacing = gameState.dinoFacing;

      gameState = hardFail(gameState, level);
      if (!currentMuted) playBonk();

      // Start failure animation
      showFail = true;
      failTimer = 1.2;
      failBumpProgress = 0;
      failDizzyProgress = 0;

      // Sync movement to reset position (teleport will happen via animation)
      movement.fromX = level.start.x;
      movement.fromY = level.start.y;
      movement.toX = level.start.x;
      movement.toY = level.start.y;
      movement.animState = 'idle';
      movement.elapsed = 0;
      refreshGameUI();
      break;
    }
    case 'softResist': {
      // Advance index without moving
      gameState = {
        ...gameState,
        activeCommandIndex: gameState.activeCommandIndex + 1,
      };
      // Check if queue is exhausted
      if (gameState.activeCommandIndex >= gameState.commandQueue.length) {
        const terminal = checkTerminalState(gameState, level);
        if (terminal.type === 'hint') {
          // On food without action — show hint
          showHint = true;
          hintTimer = 2.0;
          hintTime = 0;
          gameState = resetToStart(gameState, level);
        }
        gameState = { ...gameState, isExecuting: false };
        refreshGameUI();
      }
      break;
    }
    case 'continue': {
      // Apply command — this updates position/facing
      gameState = applyCommand(gameState, level);

      // Start animation for the command
      const cmd = gameState.commandQueue[gameState.activeCommandIndex - 1];
      if (cmd === 'F') {
        if (!currentMuted) playStomp();
        // Walk animation — from old pos to new pos
        startWalk(movement, gameState.dinoPos.x, gameState.dinoPos.y);
      } else if (cmd === 'L' || cmd === 'R') {
        if (!currentMuted) playTurn();
        startTurn(movement);
      } else if (cmd === 'A') {
        if (!currentMuted) playAction();
      }

      // Check if queue is exhausted after this command
      if (gameState.activeCommandIndex >= gameState.commandQueue.length) {
        const terminal = checkTerminalState(gameState, level);
        if (terminal.type === 'hint') {
          // On food without action — show hint
          showHint = true;
          hintTimer = 2.0;
          hintTime = 0;
          gameState = resetToStart(gameState, level);
          movement.fromX = level.start.x;
          movement.fromY = level.start.y;
          movement.toX = level.start.x;
          movement.toY = level.start.y;
          movement.animState = 'idle';
          movement.elapsed = 0;
          gameState = { ...gameState, isExecuting: false };
          refreshGameUI();
        } else if (terminal.type === 'idle') {
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

  // Reset animation states
  showWin = false;
  showFail = false;
  showHint = false;
  hintTimer = 0;

  clearUI();
  refreshGameUI();
}

function showHome(): void {
  showingHome = true;
  clearUI();
  homeEl = renderHomeScreen(uiContainer, (ch) => {
    resumeAudioContext(); // Resume audio on first user gesture
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
async function init(): Promise<void> {
  initCanvas();

  // Preload character SVGs before rendering
  await preloadCharacters();
  uiContainer = document.createElement('div');
  uiContainer.id = 'ui-overlay';
  uiContainer.className = 'ui-overlay';
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
        backflipProgress = Math.min(backflipProgress + dt * 1.5, 1); // backflip over ~0.67s

        // Update confetti
        updateConfetti(confetti, dt);

        if (winTimer <= 0) {
          showWin = false;
          backflipProgress = 0;
          if (winEl) {
            winEl.remove();
            winEl = null;
          }
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

      // Failure animation timer
      if (showFail) {
        failTimer -= dt;
        failBumpProgress = Math.min(failBumpProgress + dt * 4, 1); // bump over 0.25s
        failDizzyProgress += dt;

        if (failTimer <= 0) {
          showFail = false;
          failBumpProgress = 0;
          failDizzyProgress = 0;
        }
      }

      // Hint animation timer
      if (showHint) {
        hintTimer -= dt;
        hintTime += dt;

        if (hintTimer <= 0) {
          showHint = false;
          hintTimer = 0;
          hintTime = 0;
        }
      }

      // Step-by-step execution: process next command when animation is idle
      if (gameState.isExecuting && isIdle(movement)) {
        processNextExecCommand();
      }

      // Update movement interpolation
      const pos = updateMovement(movement, dt);

      // Calculate dino position (with bump offset during failure)
      let dinoX = gridMetrics.offsetX + gridMetrics.tileSize * pos.x;
      let dinoY = gridMetrics.offsetY + gridMetrics.tileSize * pos.y;

      if (showFail && failBumpProgress < 1) {
        const bumpOffset = drawBump(0, 0, gridMetrics.tileSize, failBumpProgress, failFacing);
        dinoX += bumpOffset.x;
        dinoY += bumpOffset.y;
      }

      // Draw dino with appropriate animation
      const animType = isIdle(movement) ? (showWin ? 'celebrating' : 'idle') : movement.animState;

      drawDino(
        dinoX,
        dinoY,
        gridMetrics.tileSize,
        gameState.character,
        gameState.dinoFacing,
        dinoAnim,
        animType,
        showWin ? backflipProgress : undefined,
      );

      // Draw dizzy rings during failure
      if (showFail && failTimer > 0.3) {
        drawDizzyRings(dinoX, dinoY, gridMetrics.tileSize, failDizzyProgress, prefersReducedMotion);
      }

      // Draw food wiggle during hint
      if (showHint) {
        drawFoodWiggle(level, hintTime, prefersReducedMotion);
      }
    } else if (showingHome || showingLevelSelect) {
      // Draw idle dino on level 1 grid behind home screen
      const gridMetrics = drawGrid(levels[0]);
      drawDino(
        gridMetrics.offsetX + gridMetrics.tileSize * levels[0].start.x,
        gridMetrics.offsetY + gridMetrics.tileSize * levels[0].start.y,
        gridMetrics.tileSize,
        'Rexy',
        levels[0].startFacing,
        dinoAnim,
        'idle',
      );
    }
  });
}

init();
