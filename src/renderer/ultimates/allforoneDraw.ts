import type { AllForOneUltimateData } from '../../physics/ultimates/allforone';
import type { UltimateRenderer } from './types';

export const allForOneUltimateRenderer: UltimateRenderer = {
  characterId: 'allforone',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.38);
    ctx.fillStyle = '#1e0629';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rivet Stab crimson-violet tendrils radiating from All For One!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 1.4;
        const len = 115 + Math.sin(t * 5 + i) * 28;
        ctx.strokeStyle = i % 2 === 0 ? '#a855f7' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.quadraticCurveTo(
          owner.x + Math.cos(ang + 0.35) * len * 0.55,
          owner.y + Math.sin(ang + 0.35) * len * 0.55,
          owner.x + Math.cos(ang) * len,
          owner.y + Math.sin(ang) * len,
        );
        ctx.stroke();
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + Math.sin(t * 7) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AllForOneUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
