// DinoSteps - Main Entry Point
// A text-free web game that introduces sequencing to preschoolers

import './styles.css';
import { initCanvas, getCanvasContext } from './render/canvas';
import { startLoop } from './render/loop';
import { drawGrid, drawFoodWiggle } from './render/grid';
import {
  drawDino,
  drawDizzyRings,
  drawBump,
  createDinoAnimState,
  buildIdleState,
} from './render/dino';
import {
  createShakeState,
  triggerShake,
  updateShake,
  createDustState,
  spawnDust,
  updateDust,
  createSignatureState,
  triggerSignature,
  updateSignature,
  drawSignature,
  createSoftResistState,
  triggerSoftResist,
  updateSoftResist,
  getSoftResistOffset,
  createFoodGlanceState,
  triggerFoodGlance,
  updateFoodGlance,
  drawFoodGlance,
  createEatingState,
  triggerEating,
  updateEating,
  resetEating,
  activeProgress,
} from './render/juice';
import { preloadCharacters, preloadCharacterRigs } from './render/characters';
import type { ArticulationState } from './render/character-parts';
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
import {
  createInitialState,
  addCommand,
  removeCommand,
  resetToStart,
  markWinComplete,
} from './engine/state';
import { processNextCommand, applyCommand, hardFail, checkTerminalState } from './engine/executor';
import {
  loadPersisted,
  saveCharacter,
  saveMuted,
  saveUnlockedLevel,
  resetProgress,
} from './engine/persistence';
import {
  playStomp,
  playBonk,
  playSuccess,
  playTurn,
  playSignature,
  playSoftResist,
  playHint,
  playNomNom,
} from './audio/sfx';
import { resumeAudioContext } from './audio/context';
import {
  renderActionMenu,
  renderTrack,
  renderGoButton,
  renderTopBar,
  renderHomeScreen,
  renderLevelSelect,
  renderCharacterCarousel,
  animateLastSlot,
} from './input/tap';
import type { DinoCharacter, GameState, Command, Facing } from './engine/types';

// Level data
const levelsData = [
  {
    id: 1,
    title: 'Hungry Steps',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'berry', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 1 },
    startFacing: 'E',
    food: { x: 3, y: 1 },
    trackBudget: 6,
    verifiedSolution: ['F', 'F', 'F', 'A'],
  },
  {
    id: 2,
    title: 'Double Hop',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'berry'],
    ],
    start: { x: 0, y: 2 },
    startFacing: 'E',
    food: { x: 4, y: 2 },
    trackBudget: 6,
    verifiedSolution: ['F', 'F', 'F', 'F', 'A'],
  },
  {
    id: 3,
    title: 'The Great Rock',
    grid: [
      ['empty', 'rock', 'empty', 'empty', 'empty'],
      ['empty', 'berry', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 0 },
    startFacing: 'E',
    food: { x: 1, y: 1 },
    trackBudget: 6,
    verifiedSolution: ['R', 'F', 'L', 'F', 'A'],
  },
  {
    id: 4,
    title: 'Tiny Corner',
    grid: [
      ['empty', 'leaf', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 2 },
    startFacing: 'E',
    food: { x: 1, y: 0 },
    trackBudget: 6,
    verifiedSolution: ['F', 'L', 'F', 'F', 'A'],
  },
  {
    id: 5,
    title: 'S-Curve Path',
    grid: [
      ['rock', 'leaf', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'rock', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 2 },
    startFacing: 'E',
    food: { x: 1, y: 0 },
    trackBudget: 8,
    verifiedSolution: ['L', 'F', 'R', 'F', 'L', 'F', 'A'],
  },
  {
    id: 6,
    title: 'Around the Swamp',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'mud', 'leaf', 'empty'],
    ],
    start: { x: 1, y: 2 },
    startFacing: 'N',
    food: { x: 3, y: 2 },
    trackBudget: 8,
    verifiedSolution: ['F', 'R', 'F', 'F', 'R', 'F', 'F', 'A'],
  },
  {
    id: 7,
    title: 'Sleepy Turtle',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'turtle', 'empty', 'leaf'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 1 },
    startFacing: 'E',
    food: { x: 4, y: 1 },
    trackBudget: 8,
    verifiedSolution: ['F', 'F', 'A', 'F', 'F', 'A'],
  },
  {
    id: 8,
    title: 'Tall Grass Chomp',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['grass', 'empty', 'empty', 'empty', 'cookie'],
      ['empty', 'rock', 'empty', 'empty', 'empty'],
    ],
    start: { x: 0, y: 2 },
    startFacing: 'E',
    food: { x: 4, y: 1 },
    trackBudget: 10,
    verifiedSolution: ['L', 'F', 'R', 'A', 'F', 'F', 'F', 'F', 'A'],
  },
  {
    id: 9,
    title: 'Twin Paths',
    grid: [
      ['empty', 'empty', 'empty', 'rock', 'cookie'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'rock'],
    ],
    start: { x: 2, y: 2 },
    startFacing: 'E',
    food: { x: 4, y: 0 },
    trackBudget: 10,
    verifiedSolution: ['F', 'L', 'F', 'R', 'F', 'L', 'F', 'A'],
  },
  {
    id: 10,
    title: 'Dino Master',
    grid: [
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['empty', 'turtle', 'rock', 'empty', 'empty'],
      ['rock', 'empty', 'empty', 'empty', 'cookie'],
    ],
    start: { x: 0, y: 1 },
    startFacing: 'E',
    food: { x: 4, y: 2 },
    trackBudget: 10,
    verifiedSolution: ['F', 'R', 'A', 'F', 'L', 'F', 'F', 'F', 'A'],
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
const eatingState = createEatingState();

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
let topBarEl: HTMLElement | null = null;
let bottomPanelEl: HTMLElement | null = null;
let actionMenuEl: HTMLElement | null = null;
let trackEl: HTMLElement | null = null;
let goBtnEl: HTMLButtonElement | null = null;
let homeEl: HTMLElement | null = null;
let levelSelectEl: HTMLElement | null = null;
let carouselEl: HTMLElement | null = null;
let hintEl: HTMLElement | null = null;

// Animation state
const dinoAnim = createDinoAnimState();
let movement = createMovementState(0, 1);

// Canvas juice state
const shakeState = createShakeState();
const dustState = createDustState();
const signatureState = createSignatureState();
const softResistState = createSoftResistState();
const foodGlanceState = createFoodGlanceState();
let prevAnimState: 'idle' | 'walking' | 'turning' = 'idle';

// Track slot animation state
let animateNewSlot = false;
let animateDeleteSlot = false;
let deletedSlotIndex = -1;
let deleteAnimating = false;

function clearUI(): void {
  if (topBarEl) {
    topBarEl.remove();
    topBarEl = null;
  }
  if (bottomPanelEl) {
    bottomPanelEl.remove();
    bottomPanelEl = null;
  }
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
  if (hintEl) {
    hintEl.remove();
    hintEl = null;
  }
}

function refreshGameUI(): void {
  if (!gameState) return;
  clearUI();

  const level = levels[currentLevelIndex];

  // Top bar — home, level title, swap, mute
  topBarEl = renderTopBar(
    uiContainer,
    `${currentLevelIndex + 1}. ${level.title}`,
    !gameState.isExecuting,
    {
      onHomeTap: () => {
        showingHome = true;
        showingLevelSelect = false;
        clearUI();
        showHome();
      },
      onSwapTap: () => handleSwap(),
      onMuteTap: () => handleMute(),
      muted: currentMuted,
    },
  );

  // Bottom panel container
  bottomPanelEl = document.createElement('div');
  bottomPanelEl.className = 'bottom-panel';
  if (gameState.isExecuting) {
    bottomPanelEl.classList.add('bottom-panel--dimmed');
  }

  // Hint pill — above the command menu
  hintEl = document.createElement('div');
  hintEl.className = 'hint-text';
  hintEl.style.position = 'static';
  hintEl.style.transform = 'none';
  bottomPanelEl.appendChild(hintEl);

  // Action menu — command buttons row
  actionMenuEl = renderActionMenu(
    bottomPanelEl,
    {
      onCommandTap: (cmd: Command) => {
        if (!gameState || gameState.isExecuting) return;
        gameState = addCommand(gameState, cmd);
        animateNewSlot = true; // Trigger add animation for the new slot
        refreshGameUI();
      },
      onTrackTap: () => {},
      onGoTap: () => handleGo(),
      onSwapTap: () => handleSwap(),
      onMuteTap: () => handleMute(),
    },
    !gameState.isExecuting,
  );

  // Track row — track slots + GO button
  const trackRow = document.createElement('div');
  trackRow.className = 'track-row';

  trackEl = renderTrack(
    trackRow,
    gameState.trackBudget,
    gameState.commandQueue,
    !gameState.isExecuting,
    (index: number) => {
      if (!gameState || gameState.isExecuting || deleteAnimating) return;
      // Animate delete, then refresh after short delay
      deletedSlotIndex = index;
      animateDeleteSlot = true;
      refreshGameUI();
      deleteAnimating = true;
      setTimeout(() => {
        if (!gameState) return;
        gameState = removeCommand(gameState, deletedSlotIndex);
        animateDeleteSlot = false;
        deletedSlotIndex = -1;
        deleteAnimating = false;
        refreshGameUI();
      }, 130); // Slightly longer than 120ms animation
    },
    animateDeleteSlot,
    animateDeleteSlot ? deletedSlotIndex : undefined,
  );

  const hasCommands = gameState.commandQueue.length > 0;
  goBtnEl = renderGoButton(
    trackRow,
    !gameState.isExecuting && hasCommands,
    () => handleGo(),
    hasCommands && !gameState.isExecuting,
  );

  bottomPanelEl.appendChild(trackRow);
  uiContainer.appendChild(bottomPanelEl);

  // Animate newly added slot (after DOM is ready)
  if (animateNewSlot) {
    animateNewSlot = false;
    animateLastSlot(trackEl, gameState.commandQueue.length);
  }
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
      if (!currentMuted) {
        playNomNom();
        playSuccess();
      }

      // Mark game complete if this is the last level
      gameState = markWinComplete(gameState, currentLevelIndex, levels.length);

      // Start win animation: chomp (~0.4s) → backflip (~0.6s) → idle
      showWin = true;
      winTimer = 2.0; // 2 seconds of celebration
      backflipProgress = 0;
      triggerEating(eatingState);

      // Burst confetti
      if (prefersReducedMotion) {
        burstConfettiReduced(confetti, 300, 300);
      } else {
        burstConfetti(confetti, 300, 300);
      }
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
      // Trigger soft-resist animation (dino leans, tile bounces back)
      triggerSoftResist(softResistState);
      if (!currentMuted) playSoftResist();

      // Advance index without moving
      gameState = {
        ...gameState,
        activeCommandIndex: gameState.activeCommandIndex + 1,
      };
      // Check if queue is exhausted
      if (gameState.activeCommandIndex >= gameState.commandQueue.length) {
        const terminal = checkTerminalState(gameState, level);
        if (terminal.type === 'hint') {
          // On food without action — show hint + food glance
          triggerFoodGlance(foodGlanceState, level.food.x, level.food.y);
          if (!currentMuted) playHint();
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
        if (!currentMuted) playSignature(gameState.character, result.actionContext === 'clear');
        // Trigger signature move visual
        triggerSignature(signatureState, gameState.character);
      }

      // Check if queue is exhausted after this command
      if (gameState.activeCommandIndex >= gameState.commandQueue.length) {
        const terminal = checkTerminalState(gameState, level);
        if (terminal.type === 'hint') {
          // On food without action — show hint + food glance
          triggerFoodGlance(foodGlanceState, level.food.x, level.food.y);
          if (!currentMuted) playHint();
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
  refreshGameUI();
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
  homeEl = renderHomeScreen(
    uiContainer,
    (ch) => {
      resumeAudioContext(); // Resume audio on first user gesture
      saveCharacter(ch);
      showingHome = false;
      showingLevelSelect = true;
      clearUI();
      showLevelSelect();
    },
    gameState?.gameComplete ?? false,
    () => {
      // Reset progress callback
      resetProgress();
      const persisted = loadPersisted();
      currentLevelIndex = Math.max(0, persisted.unlockedLevel - 1);
      gameState = createInitialState(levels[currentLevelIndex], persisted.chosenCharacter);
      movement = createMovementState(gameState.dinoPos.x, gameState.dinoPos.y);
      refreshGameUI();
      showHome();
    },
  );
}

function showLevelSelect(): void {
  const persisted = loadPersisted();
  levelSelectEl = renderLevelSelect(uiContainer, persisted.unlockedLevel, levels, (id) => {
    enterGame(id - 1);
  });
}

// Init
async function init(): Promise<void> {
  initCanvas();

  // Preload character SVGs before rendering
  await preloadCharacters();
  await preloadCharacterRigs();
  uiContainer = document.createElement('div');
  uiContainer.id = 'ui-overlay';
  uiContainer.className = 'ui-overlay';
  document.body.appendChild(uiContainer);

  showHome();

  startLoop((dt) => {
    dinoAnim.idleTime += dt;

    // Clear canvas each frame to prevent residual rendering (confetti/particles persisting across frames)
    const { ctx, width, height } = getCanvasContext();
    ctx.clearRect(0, 0, width, height);

    if (gameState && !showingHome && !showingLevelSelect) {
      const level = levels[currentLevelIndex];
      const gridMetrics = drawGrid(level);

      // Detect walk completion for screen shake + dust
      if (movement.animState === 'walking') {
        prevAnimState = 'walking';
      } else if (prevAnimState === 'walking' && movement.animState === 'idle') {
        // Walk just completed — trigger shake + dust
        prevAnimState = 'idle';
        if (!prefersReducedMotion) {
          triggerShake(shakeState, 3, 0.08);
        }
        const dustX =
          gridMetrics.offsetX + gridMetrics.tileSize * movement.toX + gridMetrics.tileSize / 2;
        const dustY =
          gridMetrics.offsetY + gridMetrics.tileSize * movement.toY + gridMetrics.tileSize * 0.8;
        spawnDust(dustState, dustX, dustY, gridMetrics.tileSize, prefersReducedMotion);
      }

      // Apply screen shake
      const shake = updateShake(shakeState, dt, prefersReducedMotion);
      if (shake.x !== 0 || shake.y !== 0) {
        const { ctx } = getCanvasContext();
        ctx.save();
        ctx.translate(shake.x, shake.y);
      }

      // Win timer — advance after celebration
      if (showWin) {
        winTimer -= dt;
        updateEating(eatingState, dt);
        if (eatingState.progress >= 1) {
          backflipProgress = Math.min(backflipProgress + dt * 1.5, 1); // backflip over ~0.67s
        }

        // Update confetti
        updateConfetti(confetti, dt);

        if (winTimer <= 0) {
          showWin = false;
          backflipProgress = 0;
          resetEating(eatingState);

          // Clear confetti when win celebration ends
          confetti.active = false;
          confetti.particles = [];

          if (gameState.gameComplete) {
            // Game complete — return to home screen with trophy
            showingHome = true;
            clearUI();
            showHome();
          } else {
            // Normal win — advance to next level
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

      // Apply soft-resist offset
      const softResistOffset = getSoftResistOffset(
        softResistState,
        gridMetrics.tileSize,
        gameState.dinoFacing,
      );
      dinoX += softResistOffset.x;
      dinoY += softResistOffset.y;

      // Update canvas juice effects
      updateDust(dustState, dt);
      updateSignature(signatureState, dt);
      updateSoftResist(softResistState, dt);
      updateFoodGlance(foodGlanceState, dt);

      // Build articulation phase from active game states, not just movement.
      // The phase drives per-part transform dispatch in computePartTransform:
      // 'eating' → jaw chomp, 'signature' → jaw open, 'celebrating' → backflip.
      const phase = showWin
        ? eatingState.active
          ? 'eating'
          : 'celebrating'
        : signatureState.active
          ? 'signature'
          : isIdle(movement)
            ? 'idle'
            : movement.animState;

      // Build articulation state: progress params default to -1 (inactive) so
      // the matching per-part transforms are skipped when not active.
      const articulationState: ArticulationState = {
        phase,
        idleTime: dinoAnim.idleTime,
        walkCycle: dinoAnim.walkCycle,
        signatureProgress: activeProgress(signatureState),
        eatingProgress: activeProgress(eatingState),
        backflipProgress: showWin ? backflipProgress : -1,
        dizzyProgress: -1,
        reducedMotion: prefersReducedMotion,
      };

      drawDino(
        dinoX,
        dinoY,
        gridMetrics.tileSize,
        gameState.character,
        gameState.dinoFacing,
        articulationState,
      );

      // Draw food-glance hint (dino turns attention toward food)
      if (foodGlanceState.active) {
        const foodPx = gridMetrics.offsetX + gridMetrics.tileSize * foodGlanceState.foodX;
        const foodPy = gridMetrics.offsetY + gridMetrics.tileSize * foodGlanceState.foodY;
        drawFoodGlance(
          dinoX,
          dinoY,
          foodPx,
          foodPy,
          gridMetrics.tileSize,
          foodGlanceState.progress,
          prefersReducedMotion,
        );
      }

      // Draw signature move effect (after dino)
      drawSignature(dinoX, dinoY, gridMetrics.tileSize, signatureState, prefersReducedMotion);

      // Draw dizzy rings during failure
      if (showFail && failTimer > 0.3) {
        drawDizzyRings(dinoX, dinoY, gridMetrics.tileSize, failDizzyProgress, prefersReducedMotion);
      }

      // Draw food wiggle during hint
      if (showHint) {
        drawFoodWiggle(level, hintTime, prefersReducedMotion);
      }

      // Close screen shake transform
      if (shake.x !== 0 || shake.y !== 0) {
        const { ctx } = getCanvasContext();
        ctx.restore();
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
        buildIdleState(dinoAnim, prefersReducedMotion),
      );
    }
  });
}

init();
