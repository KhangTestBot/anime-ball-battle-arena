import type { LustFmaUltimateData } from '../../physics/ultimates/lust_fma';
import type { UltimateRenderer } from './types';

export const lustFmaUltimateRenderer: UltimateRenderer = {
  characterId: 'lust_fma',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Extending Ultimate Spear lines radiating around Lust
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5 + t * 3;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(owner.x + Math.cos(ang) * 85, owner.y + Math.sin(ang) * 85);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LustFmaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
