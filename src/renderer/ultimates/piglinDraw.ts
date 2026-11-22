import type { PiglinUltimateData } from '../../physics/ultimates/piglin';
import type { UltimateRenderer } from './types';

export const piglinUltimateRenderer: UltimateRenderer = {
  characterId: 'piglin',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PiglinUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash / 0.55);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 12 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1 - a) * 180, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
