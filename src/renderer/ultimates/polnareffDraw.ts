import type { PolnareffUltimateData } from '../../physics/ultimates/polnareff';
import type { UltimateRenderer } from './types';

export const polnareffUltimateRenderer: UltimateRenderer = {
  characterId: 'polnareff',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Silver Chariot 7 orbiting silver afterimages!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.78);
      for (let i = 0; i < 7; i++) {
        const ang = (i * Math.PI * 2) / 7 + t * 5.2;
        const px = owner.x + Math.cos(ang) * 72;
        const py = owner.y + Math.sin(ang) * 72;
        ctx.strokeStyle = i % 2 === 0 ? '#cbd5e1' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PolnareffUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
