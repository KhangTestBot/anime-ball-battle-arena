import type { StarrkUltimateData } from '../../physics/ultimates/starrk';
import type { UltimateRenderer } from './types';

export const starrkUltimateRenderer: UltimateRenderer = {
  characterId: 'starrk',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Orbiting Spirit Wolf wisps around Primera Espada Starrk
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.fillStyle = '#0ea5e9';
      for (let i = 0; i < 6; i++) {
        const ang = t * 5 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 48, owner.y + Math.sin(ang) * 48, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as StarrkUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#94a3b8';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
