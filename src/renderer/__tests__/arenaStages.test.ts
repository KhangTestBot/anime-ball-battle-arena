import { describe, expect, it } from 'vitest';
import { ARENA_STAGES, drawArenaStageFloor, getArenaStageById } from '../arenaStages';

function createMockCtx(): CanvasRenderingContext2D {
  const noop = () => {};
  const grad = { addColorStop: noop };
  return {
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    bezierCurveTo: noop,
    arc: noop,
    fill: noop,
    stroke: noop,
    fillRect: noop,
    strokeRect: noop,
    createLinearGradient: () => grad,
    fillStyle: '#000',
    strokeStyle: '#fff',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('Battle Arena Stages', () => {
  it('defines 8 unique selectable anime & game battle arenas', () => {
    expect(ARENA_STAGES.length).toBe(8);
    const ids = new Set(ARENA_STAGES.map((s) => s.id));
    expect(ids.size).toBe(8);
    expect(getArenaStageById('nether-fortress').name).toBe('Nether Fortress');
    expect(getArenaStageById('summoners-rift').series).toBe('League of Legends');
    expect(getArenaStageById(undefined).id).toBe('cyber-grid');
  });

  it('renders every arena stage cleanly without errors', () => {
    const ctx = createMockCtx();
    for (const stage of ARENA_STAGES) {
      expect(() => drawArenaStageFloor(ctx, stage.id, 640, 1.5)).not.toThrow();
    }
  });
});
