import type { InosukeUltimateData } from '../../physics/ultimates/inosuke';
import type { UltimateRenderer } from './types';

export const inosukeUltimateRenderer: UltimateRenderer = {
  characterId: 'inosuke',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Jagged Beast Breathing slash arcs
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      const start = t * 15;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 22, start, start + Math.PI * 1.15);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as InosukeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#94a3b8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
