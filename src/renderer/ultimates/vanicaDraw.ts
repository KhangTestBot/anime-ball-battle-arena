import type { VanicaUltimateData } from '../../physics/ultimates/vanica';
import type { UltimateRenderer } from './types';

export const vanicaUltimateRenderer: UltimateRenderer = {
  characterId: 'vanica',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#3b0726';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Decaying World crimson-violet curse runes orbiting Vanica!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - t * 2.2;
        const px = owner.x + Math.cos(ang) * 82;
        const py = owner.y + Math.sin(ang) * 82;
        ctx.strokeStyle = i % 2 === 0 ? '#e11d48' : '#9333ea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as VanicaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#9333ea';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
