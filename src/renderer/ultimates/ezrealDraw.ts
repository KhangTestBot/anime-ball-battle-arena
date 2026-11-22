import type { EzrealUltimateData } from '../../physics/ultimates/ezreal';
import type { UltimateRenderer } from './types';

export const ezrealUltimateRenderer: UltimateRenderer = {
  characterId: 'ezreal',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + Math.sin(t * 12) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as EzrealUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.barrageFlash <= 0 || !owner) return;

    const a = Math.min(1, data.barrageFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.barrageAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, -36 * a, bounds.fullSize * 1.4, 72 * a);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -14 * a, bounds.fullSize * 1.4, 28 * a);
    ctx.restore();
  },
};
