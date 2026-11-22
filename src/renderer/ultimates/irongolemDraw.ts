import type { IronGolemUltimateData } from '../../physics/ultimates/irongolem';
import type { UltimateRenderer } from './types';

export const ironGolemUltimateRenderer: UltimateRenderer = {
  characterId: 'irongolem',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as IronGolemUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash / 0.7);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 12 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 50 + (1 - a) * 190, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
