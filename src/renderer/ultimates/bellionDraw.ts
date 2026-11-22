import type { BellionUltimateData } from '../../physics/ultimates/bellion';
import type { UltimateRenderer } from './types';

export const bellionUltimateRenderer: UltimateRenderer = {
  characterId: 'bellion',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Four Grand Marshal shadow wing arcs
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.sin(t * 6) * 0.2;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 28, ang, ang + Math.PI * 0.35);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BellionUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
