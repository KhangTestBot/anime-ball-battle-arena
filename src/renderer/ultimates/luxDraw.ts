import type { LuxUltimateData } from '../../physics/ultimates/lux';
import type { UltimateRenderer } from './types';

export const luxUltimateRenderer: UltimateRenderer = {
  characterId: 'lux',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 18 + Math.sin(t * 10) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as LuxUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.sparkFlash <= 0 || !owner) return;

    const a = Math.min(1, data.sparkFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.sparkAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, -40 * a, bounds.fullSize * 1.4, 80 * a);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -16 * a, bounds.fullSize * 1.4, 32 * a);
    ctx.restore();
  },
};
