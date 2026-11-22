import type { ZeldrisUltimateData } from '../../physics/ultimates/zeldris';
import type { UltimateRenderer } from './types';

export const zeldrisUltimateRenderer: UltimateRenderer = {
  characterId: 'zeldris',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Ominous Nebula swirling dark-crimson vortex
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        const start = t * 12 + (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 24 + i * 24, start, start + Math.PI * 0.7);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ZeldrisUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
