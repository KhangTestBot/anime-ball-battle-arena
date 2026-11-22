import type { IronSlUltimateData } from '../../physics/ultimates/iron_sl';
import type { UltimateRenderer } from './types';

export const ironSlUltimateRenderer: UltimateRenderer = {
  characterId: 'iron_sl',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Fortress shield hex ring around Shadow Tank Iron
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 18 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as IronSlUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.3 - data.flash) * 225, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
