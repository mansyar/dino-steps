// Grid rendering — draws the 5×3 game grid with tile backgrounds

import { getCanvasContext } from "./canvas";
import type { LevelData } from "../engine/types";

export const GRID_WIDTH = 5;
export const GRID_HEIGHT = 3;

const COLORS = {
  empty: "#a8e6cf",
  obstacle: "#8b7355",
  food: "#ff6b6b",
  interactable: "#87ceeb",
  border: "#2d5016",
};

export interface GridMetrics {
  offsetX: number;
  offsetY: number;
  tileSize: number;
}

export function computeGridMetrics(
  canvasWidth: number,
  canvasHeight: number,
): GridMetrics {
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
      const tileType = level.grid[y]?.[x] ?? "empty";
      const px = offsetX + x * tileSize;
      const py = offsetY + y * tileSize;

      ctx.fillStyle = COLORS[tileType] ?? COLORS.empty;
      ctx.fillRect(px, py, tileSize, tileSize);

      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, tileSize, tileSize);
    }
  }

  return { offsetX, offsetY, tileSize };
}
