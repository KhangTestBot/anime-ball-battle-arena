import type { JevilUltimateData } from '../../physics/ultimates/jevil';
import type { UltimateRenderer } from './types';

export const jevilUltimateRenderer: UltimateRenderer = {
  characterId: 'jevil',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spinning Carousel background lines!
    ctx.globalAlpha = Math.max(0, alpha * 0.35);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    const cx = bounds.fullSize * 0.5;
    const cy = bounds.fullSize * 0.5;
    for (let i = 0; i < 8; i++) {
      const ang = t * 2.5 + (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * bounds.fullSize, cy + Math.sin(ang) * bounds.fullSize);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JevilUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
