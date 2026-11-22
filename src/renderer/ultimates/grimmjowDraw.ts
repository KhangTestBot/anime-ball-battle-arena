import type { GrimmjowUltimateData } from '../../physics/ultimates/grimmjow';
import type { UltimateRenderer } from './types';

export const grimmjowUltimateRenderer: UltimateRenderer = {
  characterId: 'grimmjow',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Pantera feral blue reiatsu ring
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20 + Math.sin(t * 16) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as GrimmjowUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
