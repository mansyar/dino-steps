// Grid rendering — draws the 5×3 game grid with tile backgrounds

import { getCanvasContext } from './canvas';
import type { LevelData } from '../engine/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../engine/constants';

const COLORS: Record<string, string> = {
  empty: '#c4eed0', // GDD secondary — mint grid tiles
  // Obstacles
  rock: '#8b7355',
  mud: '#5d4037',
  // Food
  berry: '#ff6b6b',
  leaf: '#81c784',
  cookie: '#ffb74d',
  // Interactables
  turtle: '#4db6ac',
  grass: '#a5d6a7',
  border: '#a8d5ba', // Soft green border
};

const EMOJI: Record<string, string> = {
  rock: '🪨',
  mud: '💩',
  berry: '🍎',
  leaf: '🍃',
  cookie: '🍪',
  turtle: '🐢',
  grass: '🌿',
};

export interface GridMetrics {
  offsetX: number;
  offsetY: number;
  tileSize: number;
}

export function computeGridMetrics(canvasWidth: number, canvasHeight: number): GridMetrics {
  const maxTileW = (canvasWidth - 40) / GRID_WIDTH;
  const maxTileH = (canvasHeight - 40) / GRID_HEIGHT;
  const tileSize = Math.floor(Math.min(maxTileW, maxTileH, 120));
  const gridW = tileSize * GRID_WIDTH;
  const gridH = tileSize * GRID_HEIGHT;
  const offsetX = (canvasWidth - gridW) / 2;
  const offsetY = (canvasHeight - gridH) / 2;

  return { offsetX, offsetY, tileSize };
}

export function drawGrid(level: LevelData): GridMetrics {
  const { ctx, width, height } = getCanvasContext();
  const { offsetX, offsetY, tileSize } = computeGridMetrics(width, height);

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const tileType = level.grid[y]?.[x] ?? 'empty';
      const px = offsetX + x * tileSize;
      const py = offsetY + y * tileSize;

      ctx.fillStyle = COLORS[tileType] ?? COLORS.empty;
      ctx.fillRect(px, py, tileSize, tileSize);

      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, tileSize, tileSize);

      // Draw emoji on non-empty tiles
      const emoji = EMOJI[tileType];
      if (emoji) {
        const fontSize = Math.floor(tileSize * 0.5);
        ctx.font = `${fontSize}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, px + tileSize / 2, py + tileSize / 2);
      }
    }
  }

  return { offsetX, offsetY, tileSize };
}

/** Draw a food tile with wiggle animation (for hint feedback) */
export function drawFoodWiggle(level: LevelData, time: number, reducedMotion?: boolean): void {
  const { ctx, width, height } = getCanvasContext();
  const { offsetX, offsetY, tileSize } = computeGridMetrics(width, height);

  const { x: fx, y: fy } = level.food;
  const px = offsetX + fx * tileSize;
  const py = offsetY + fy * tileSize;

  // Wiggle: gentle oscillation (< 3Hz for accessibility)
  const freq = reducedMotion ? 1.5 : 2.5;
  const amplitude = reducedMotion ? 1 : 2;
  const wiggleX = Math.sin(time * freq * Math.PI * 2) * amplitude;
  const wiggleY = Math.cos(time * freq * Math.PI * 2 * 0.7) * amplitude * 0.5;

  ctx.save();
  ctx.translate(wiggleX, wiggleY);

  // Draw food emoji based on tile type
  const foodTileType = level.grid[fy]?.[fx] ?? 'berry';
  const emoji = EMOJI[foodTileType] ?? '🍎';
  const fontSize = Math.floor(tileSize * 0.5);
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, px + tileSize / 2, py + tileSize / 2);

  ctx.restore();
}
