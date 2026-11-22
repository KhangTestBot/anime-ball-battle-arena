import type { HohenheimUltimateData } from '../../physics/ultimates/hohenheim';
import type { UltimateRenderer } from './types';

export const hohenheimUltimateRenderer: UltimateRenderer = {
  characterId: 'hohenheim',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Nationwide Golden Reverse Transmutation Circle across the arena!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(bounds.fullSize * 0.5, bounds.fullSize * 0.5, bounds.fullSize * 0.36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 4) / 5 + t * 0.6;
        const r = bounds.fullSize * 0.36;
        const px = bounds.fullSize * 0.5 + Math.cos(ang) * r;
        const py = bounds.fullSize * 0.5 + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as HohenheimUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
