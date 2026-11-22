import type { BingChillingUltimateData } from '../../physics/ultimates/bing_chilling';
import type { UltimateRenderer } from './types';

export const bingChillingUltimateRenderer: UltimateRenderer = {
  characterId: 'bing_chilling',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Chilling frost crystals & golden Social Credit rings!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 2.0;
        const r = 82 + Math.sin(t * 4 + i) * 14;
        const px = owner.x + Math.cos(ang) * r;
        const py = owner.y + Math.sin(ang) * r;
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#facc15';
        ctx.beginPath();
        ctx.moveTo(px, py - 8);
        ctx.lineTo(px + 6, py);
        ctx.lineTo(px, py + 8);
        ctx.lineTo(px - 6, py);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BingChillingUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 21 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
