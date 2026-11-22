import type { FubukiUltimateData } from '../../physics/ultimates/fubuki';
import type { UltimateRenderer } from './types';

export const fubukiUltimateRenderer: UltimateRenderer = {
  characterId: 'fubuki',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Swirling Hellstorm vortex rings
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const start = t * 7 + i * 2.1;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 22 + i * 24, start, start + Math.PI * 0.85);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as FubukiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 15 * a;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.25 - data.flash) * 225, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
