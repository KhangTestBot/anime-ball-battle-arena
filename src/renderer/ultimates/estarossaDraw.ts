import type { EstarossaUltimateData } from '../../physics/ultimates/estarossa';
import type { UltimateRenderer } from './types';

export const estarossaUltimateRenderer: UltimateRenderer = {
  characterId: 'estarossa',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Blazing Greatest Sun orb above Mael
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.92);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y - owner.radius - 30, 18 + Math.sin(t * 10) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as EstarossaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
