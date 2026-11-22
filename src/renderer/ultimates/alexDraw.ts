import type { AlexUltimateData } from '../../physics/ultimates/alex';
import type { UltimateRenderer } from './types';

export const alexUltimateRenderer: UltimateRenderer = {
  characterId: 'alex',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.2);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AlexUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 14 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.2 - data.flash) * 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
