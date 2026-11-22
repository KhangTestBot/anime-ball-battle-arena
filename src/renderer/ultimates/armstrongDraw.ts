import type { ArmstrongUltimateData } from '../../physics/ultimates/armstrong';
import type { UltimateRenderer } from './types';

export const armstrongUltimateRenderer: UltimateRenderer = {
  characterId: 'armstrong',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Sparkling pink-gold muscle stars orbiting Major Armstrong!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.95);
      ctx.fillStyle = '#f472b6';
      for (let i = 0; i < 6; i++) {
        const ang = t * 5 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 46, owner.y + Math.sin(ang) * 46, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ArmstrongUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
