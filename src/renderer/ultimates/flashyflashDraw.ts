import type { FlashyFlashUltimateData } from '../../physics/ultimates/flashyflash';
import type { UltimateRenderer } from './types';

export const flashyflashUltimateRenderer: UltimateRenderer = {
  characterId: 'flashyflash',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.2);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as FlashyFlashUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    ctx.save();
    // Golden lightspeed afterimage trails
    for (const tr of data.trails) {
      if (tr.alpha <= 0) continue;
      ctx.globalAlpha = tr.alpha * 0.9;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6 * tr.alpha;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
    }

    if (data.flash > 0 && owner) {
      const a = Math.min(1, data.flash);
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 14 * a;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 45 + (1.25 - data.flash) * 220, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
