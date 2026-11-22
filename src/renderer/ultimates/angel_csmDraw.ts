import type { AngelCsmUltimateData } from '../../physics/ultimates/angel_csm';
import type { UltimateRenderer } from './types';

export const angelCsmUltimateRenderer: UltimateRenderer = {
  characterId: 'angel_csm',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Glowing Angel Devil Halo above owner
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.92);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(
        owner.x,
        owner.y - owner.radius - 18 + Math.sin(t * 7) * 3,
        18,
        6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AngelCsmUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
