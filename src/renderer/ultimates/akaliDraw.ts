import type { AkaliUltimateData } from '../../physics/ultimates/akali';
import type { UltimateRenderer } from './types';

export const akaliUltimateRenderer: UltimateRenderer = {
  characterId: 'akali',

  drawBackdrop(ctx, state, bounds, fighters) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Twilight Shroud smoke donut around Akali
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.55);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 48, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AkaliUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    ctx.save();
    for (const tr of data.trails) {
      if (tr.alpha <= 0) continue;
      ctx.globalAlpha = tr.alpha * 0.9;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6 * tr.alpha;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
    }

    if (data.flash > 0 && owner) {
      const a = Math.min(1, data.flash);
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 16 * a;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
