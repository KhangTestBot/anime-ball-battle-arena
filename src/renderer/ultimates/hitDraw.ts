import type { HitUltimateData } from '../../physics/ultimates/hit';
import type { UltimateRenderer } from './types';

export const hitUltimateRenderer: UltimateRenderer = {
  characterId: 'hit',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Fractured Time-Skip glass rings around Hit
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 32, t * 4, t * 4 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as HitUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
