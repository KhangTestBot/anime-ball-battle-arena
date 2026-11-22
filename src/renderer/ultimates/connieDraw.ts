import type { ConnieUltimateData } from '../../physics/ultimates/connie';
import type { UltimateRenderer } from './types';

export const connieUltimateRenderer: UltimateRenderer = {
  characterId: 'connie',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spinning ODM blade arcs
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      const start = t * 14;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20, start, start + Math.PI * 1.1);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ConnieUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 14 * a;
    ctx.shadowColor = '#15803d';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.25 - data.flash) * 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
