import { describe, it, expect } from 'vitest';
import {
  processNextCommand,
  applyForward,
  applyLeft,
  applyRight,
  applyAction,
  executeQueue,
  hardFail,
  checkTerminalState,
} from '../src/engine/executor';
import type { GameState, LevelData } from '../src/engine/types';

const level1: LevelData = {
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
};

const levelObstacle: LevelData = {
  id: 2,
  title: 'Rocky Path',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'obstacle', 'food', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 1 },
  startFacing: 'E',
  food: { x: 3, y: 1 },
  trackBudget: 8,
  verifiedSolution: ['F', 'F', 'L', 'F', 'R', 'F', 'A'],
};

const levelInteractable: LevelData = {
  id: 3,
  title: 'Turtle Bridge',
  grid: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'interactable', 'empty', 'food', 'empty'],
    ['empty', 'empty', 'empty', 'empty', 'empty'],
  ],
  start: { x: 0, y: 1 },
  startFacing: 'E',
  food: { x: 3, y: 1 },
  trackBudget: 8,
  verifiedSolution: ['A', 'F', 'F', 'F', 'A'],
};

function gs(overrides: Partial<GameState> = {}): GameState {
  return {
    levelId: 1,
    character: 'Rexy',
    dinoPos: { x: 0, y: 1 },
    dinoFacing: 'E',
    commandQueue: [],
    activeCommandIndex: -1,
    trackBudget: 6,
    clearedInteractables: [],
    isExecuting: false,
    ...overrides,
  };
}

describe('Forward', () => {
  it('moves to empty tile', () => {
    const s = gs({ commandQueue: ['F'], activeCommandIndex: 0 });
    expect(processNextCommand(s, level1)).toEqual({ type: 'continue' });
    expect(applyForward(s).dinoPos).toEqual({ x: 1, y: 1 });
  });

  it('hard fails out of bounds', () => {
    const s = gs({ dinoPos: { x: 4, y: 1 }, commandQueue: ['F'], activeCommandIndex: 0 });
    expect(processNextCommand(s, level1)).toEqual({ type: 'hardFail' });
  });

  it('hard fails into obstacle', () => {
    const s = gs({ dinoPos: { x: 1, y: 1 }, commandQueue: ['F'], activeCommandIndex: 0 });
    expect(processNextCommand(s, levelObstacle)).toEqual({ type: 'hardFail' });
  });

  it('soft resists exiting uncleared interactable', () => {
    const s = gs({ dinoPos: { x: 1, y: 1 }, commandQueue: ['F'], activeCommandIndex: 0 });
    expect(processNextCommand(s, levelInteractable)).toEqual({ type: 'softResist' });
  });

  it('moves onto food tile', () => {
    const s = gs({ dinoPos: { x: 2, y: 1 }, commandQueue: ['F'], activeCommandIndex: 0 });
    expect(processNextCommand(s, level1)).toEqual({ type: 'continue' });
    expect(applyForward(s).dinoPos).toEqual({ x: 3, y: 1 });
  });
});

describe('Turns', () => {
  it('left E to N', () => {
    const s = gs({ commandQueue: ['L'], activeCommandIndex: 0 });
    expect(applyLeft(s).dinoFacing).toBe('N');
  });

  it('left N to W', () => {
    const s = gs({ dinoFacing: 'N', commandQueue: ['L'], activeCommandIndex: 0 });
    expect(applyLeft(s).dinoFacing).toBe('W');
  });

  it('right E to S', () => {
    const s = gs({ commandQueue: ['R'], activeCommandIndex: 0 });
    expect(applyRight(s).dinoFacing).toBe('S');
  });

  it('right S to W', () => {
    const s = gs({ dinoFacing: 'S', commandQueue: ['R'], activeCommandIndex: 0 });
    expect(applyRight(s).dinoFacing).toBe('W');
  });

  it('turns do not move dino', () => {
    const s = gs({ commandQueue: ['L'], activeCommandIndex: 0 });
    expect(applyLeft(s).dinoPos).toEqual({ x: 0, y: 1 });
  });
});

describe('Action', () => {
  it('wins on food', () => {
    const s = gs({ dinoPos: { x: 3, y: 1 }, commandQueue: ['A'], activeCommandIndex: 0 });
    expect(processNextCommand(s, level1)).toEqual({ type: 'win' });
  });

  it('clears uncleared interactable', () => {
    const s = gs({ dinoPos: { x: 1, y: 1 }, commandQueue: ['A'], activeCommandIndex: 0 });
    expect(processNextCommand(s, levelInteractable)).toEqual({ type: 'continue' });
    const ns = applyAction(s, levelInteractable);
    expect(ns.clearedInteractables).toEqual([{ x: 1, y: 1 }]);
  });

  it('no-op on cleared interactable', () => {
    const s = gs({
      dinoPos: { x: 1, y: 1 },
      clearedInteractables: [{ x: 1, y: 1 }],
      commandQueue: ['A'],
      activeCommandIndex: 0,
    });
    expect(processNextCommand(s, levelInteractable)).toEqual({ type: 'continue' });
    expect(applyAction(s, levelInteractable).clearedInteractables).toEqual([{ x: 1, y: 1 }]);
  });

  it('no-op on empty tile', () => {
    const s = gs({ commandQueue: ['A'], activeCommandIndex: 0 });
    expect(processNextCommand(s, level1)).toEqual({ type: 'continue' });
  });
});

describe('hardFail', () => {
  it('resets to start', () => {
    const s = gs({
      dinoPos: { x: 3, y: 2 },
      dinoFacing: 'W',
      commandQueue: ['F'],
      activeCommandIndex: 0,
      clearedInteractables: [{ x: 1, y: 1 }],
    });
    const ns = hardFail(s, level1);
    expect(ns.dinoPos).toEqual({ x: 0, y: 1 });
    expect(ns.dinoFacing).toBe('E');
    expect(ns.commandQueue).toEqual([]);
    expect(ns.activeCommandIndex).toBe(-1);
    expect(ns.clearedInteractables).toEqual([]);
  });
});

describe('checkTerminalState', () => {
  it('hint when on food', () => {
    expect(checkTerminalState(gs({ dinoPos: { x: 3, y: 1 } }), level1)).toEqual({ type: 'hint' });
  });

  it('idle when not on food', () => {
    expect(checkTerminalState(gs({ dinoPos: { x: 2, y: 1 } }), level1)).toEqual({ type: 'idle' });
  });
});

describe('executeQueue', () => {
  it('Level 1 FFFA wins', () => {
    const s = gs({ commandQueue: ['F', 'F', 'F', 'A'], activeCommandIndex: 0 });
    const { state, result } = executeQueue(s, level1);
    expect(result).toEqual({ type: 'win' });
    expect(state.dinoPos).toEqual({ x: 3, y: 1 });
    expect(state.isExecuting).toBe(false);
  });

  it('FFFF ends idle', () => {
    const s = gs({ commandQueue: ['F', 'F', 'F', 'F'], activeCommandIndex: 0 });
    const { result } = executeQueue(s, level1);
    expect(result).toEqual({ type: 'idle' });
  });

  it('wall hit causes hardFail and reset', () => {
    const s = gs({ commandQueue: ['F', 'F', 'F', 'F', 'F', 'F'], activeCommandIndex: 0 });
    const { state, result } = executeQueue(s, level1);
    expect(result).toEqual({ type: 'idle' });
    expect(state.dinoPos).toEqual({ x: 0, y: 1 });
    expect(state.commandQueue).toEqual([]);
  });

  it('empty queue returns idle', () => {
    const s = gs({ commandQueue: [], activeCommandIndex: -1 });
    const { result } = executeQueue(s, level1);
    expect(result).toEqual({ type: 'idle' });
  });

  it('FFF ends on food returns hint', () => {
    const s = gs({ commandQueue: ['F', 'F', 'F'], activeCommandIndex: 0 });
    const { state, result } = executeQueue(s, level1);
    expect(result).toEqual({ type: 'hint' });
    expect(state.dinoPos).toEqual({ x: 3, y: 1 });
  });

  it('obstacle causes reset', () => {
    const s = gs({ commandQueue: ['F', 'F', 'F'], activeCommandIndex: 0 });
    const { state, result } = executeQueue(s, levelObstacle);
    expect(result).toEqual({ type: 'idle' });
    expect(state.dinoPos).toEqual({ x: 0, y: 1 });
    expect(state.commandQueue).toEqual([]);
  });

  it('clear interactable then proceed to food', () => {
    const s = gs({
      dinoPos: { x: 0, y: 1 },
      commandQueue: ['F', 'A', 'F', 'F', 'A'],
      activeCommandIndex: 0,
    });
    const { state, result } = executeQueue(s, levelInteractable);
    expect(result).toEqual({ type: 'win' });
    expect(state.dinoPos).toEqual({ x: 3, y: 1 });
  });
});
