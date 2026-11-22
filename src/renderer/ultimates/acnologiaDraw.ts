import type { AcnologiaUltimateData } from '../../physics/ultimates/acnologia';
import type { UltimateRenderer } from './types';

export const acnologiaUltimateRenderer: UltimateRenderer = {
  characterId: 'acnologia',

  drawBackdrop(ctx, state, bounds) {
    const data = state.data as unknown as AcnologiaUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Cerulean Eternal Flare impact stars
    ctx.globalAlpha = Math.max(0, alpha * 0.75);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    for (const pt of data.flarePts) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 34, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AcnologiaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 50 + (1.3 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
