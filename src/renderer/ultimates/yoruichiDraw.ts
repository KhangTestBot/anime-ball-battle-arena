import type { YoruichiUltimateData } from '../../physics/ultimates/yoruichi';
import type { UltimateRenderer } from './types';

export const yoruichiUltimateRenderer: UltimateRenderer = {
  characterId: 'yoruichi',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as YoruichiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    ctx.save();
    // Violet-gold Shunko Flash Step trails
    for (const tr of data.trails) {
      if (tr.alpha <= 0) continue;
      ctx.globalAlpha = tr.alpha * 0.92;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6 * tr.alpha;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
    }

    if (data.flash > 0 && owner) {
      const a = Math.min(1, data.flash);
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 18 * a;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
