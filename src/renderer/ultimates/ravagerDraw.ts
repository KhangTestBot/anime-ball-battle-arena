import type { RavagerUltimateData } from '../../physics/ultimates/ravager';
import type { UltimateRenderer } from './types';

export const ravagerUltimateRenderer: UltimateRenderer = {
  characterId: 'ravager',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as RavagerUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 16 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.25 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
