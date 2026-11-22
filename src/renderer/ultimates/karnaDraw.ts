import type { KarnaUltimateData } from '../../physics/ultimates/karna';
import type { UltimateRenderer } from './types';

export const karnaUltimateRenderer: UltimateRenderer = {
  characterId: 'karna',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Blazing Surya Sun Wheel behind Karna!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 92, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI) / 5 + t * 2.0;
        ctx.strokeStyle = i % 2 === 0 ? '#facc15' : '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 45, owner.y + Math.sin(ang) * 45);
        ctx.lineTo(owner.x + Math.cos(ang) * 145, owner.y + Math.sin(ang) * 145);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KarnaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 36;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 280, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
