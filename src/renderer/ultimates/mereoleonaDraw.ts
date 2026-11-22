import type { MereoleonaUltimateData } from '../../physics/ultimates/mereoleona';
import type { UltimateRenderer } from './types';

export const mereoleonaUltimateRenderer: UltimateRenderer = {
  characterId: 'mereoleona',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Hellfire Incarnate roaring lion-mane flame spikes!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6 + t * 2.4;
        const r = owner.radius + (i % 2 === 0 ? 46 : 24);
        const px = owner.x + Math.cos(ang) * r;
        const py = owner.y + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MereoleonaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
