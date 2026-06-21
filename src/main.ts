// DinoSteps - Main Entry Point
// A text-free web game that introduces sequencing to preschoolers

import { initCanvas } from "./render/canvas";
import { startLoop } from "./render/loop";
import { drawGrid } from "./render/grid";
import { drawDino, createDinoAnimState } from "./render/dino";
import { parseLevels } from "./engine/levelData";
import type { DinoCharacter, Facing } from "./engine/types";

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
const level1 = levels[0];

initCanvas();

const dinoAnim = createDinoAnimState();
let dinoX = level1.start.x;
let dinoY = level1.start.y;
let dinoFacing: Facing = level1.startFacing;
let dinoCharacter: DinoCharacter = "Rexy";

startLoop((dt) => {
  dinoAnim.idleTime += dt;
  const gridMetrics = drawGrid(level1);
  drawDino(
    gridMetrics.offsetX + gridMetrics.tileSize * dinoX,
    gridMetrics.offsetY + gridMetrics.tileSize * dinoY,
    gridMetrics.tileSize,
    dinoCharacter,
    dinoFacing,
    dinoAnim,
    "idle",
  );
});

console.log("DinoSteps loaded!");
