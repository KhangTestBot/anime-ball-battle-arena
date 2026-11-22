import type { ZekeUltimateData } from '../../physics/ultimates/zeke';
import type { UltimateRenderer } from './types';

export const zekeUltimateRenderer: UltimateRenderer = {
  characterId: 'zeke',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Royal Scream concentric shockwave rings
    if (owner && owner.alive) {
      const pulse = (t * 2.5) % 1;
      ctx.globalAlpha = Math.max(0, alpha * (1 - pulse) * 0.8);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + pulse * 175, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ZekeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
