import type { IskandarUltimateData } from '../../physics/ultimates/iskandar';
import type { UltimateRenderer } from './types';

export const iskandarUltimateRenderer: UltimateRenderer = {
  characterId: 'iskandar',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Ionioi Hetairoi desert horizon & Companion cavalry banners!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 1.1;
        const px = owner.x + Math.cos(ang) * 95;
        const py = owner.y + Math.sin(ang) * 95;
        ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#facc15';
        ctx.fillRect(px - 4, py - 12, 8, 24);
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as IskandarUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
