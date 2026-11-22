import type { BorosUltimateData } from '../../physics/ultimates/boros';
import type { UltimateRenderer } from './types';

export const borosUltimateRenderer: UltimateRenderer = {
  characterId: 'boros',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + Math.sin(t * 16) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as BorosUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.cannonFlash <= 0 || !owner) return;

    const a = Math.min(1, data.cannonFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.cannonAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(0, -42 * a, bounds.fullSize * 1.4, 84 * a);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, -18 * a, bounds.fullSize * 1.4, 36 * a);
    ctx.restore();
  },
};
