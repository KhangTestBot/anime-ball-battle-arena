import type { CloudUltimateData } from '../../physics/ultimates/cloud';
import type { UltimateRenderer } from './types';

export const cloudUltimateRenderer: UltimateRenderer = {
  characterId: 'cloud',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as CloudUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    ctx.save();
    // Cyan-gold Buster Sword Omnislash trails
    for (const tr of data.trails) {
      if (tr.alpha <= 0) continue;
      ctx.globalAlpha = tr.alpha * 0.92;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 7 * tr.alpha;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
    }

    if (data.flash > 0 && owner) {
      const a = Math.min(1, data.flash);
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 18 * a;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 32;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 250, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
