import type { MikasaUltimateData } from '../../physics/ultimates/mikasa';
import type { UltimateRenderer } from './types';

export const mikasaUltimateRenderer: UltimateRenderer = {
  characterId: 'mikasa',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MikasaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    ctx.save();
    // Crimson scarf & ODM wire zip trails
    for (const tr of data.trails) {
      if (tr.alpha <= 0) continue;
      ctx.globalAlpha = tr.alpha * 0.9;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6 * tr.alpha;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
    }

    if (data.flash > 0 && owner) {
      const a = Math.min(1, data.flash);
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 16 * a;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
