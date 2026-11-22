import type { BuuUltimateData } from '../../physics/ultimates/buu';
import type { UltimateRenderer } from './types';

export const buuUltimateRenderer: UltimateRenderer = {
  characterId: 'buu',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Charging pink Planet Burst sphere above Majin Buu!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.fillStyle = '#f472b6';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y - owner.radius - 28, 16 + Math.sin(t * 10) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BuuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
