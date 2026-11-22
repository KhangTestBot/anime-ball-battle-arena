import type { PucciUltimateData } from '../../physics/ultimates/pucci';
import type { UltimateRenderer } from './types';

export const pucciUltimateRenderer: UltimateRenderer = {
  characterId: 'pucci',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Made in Heaven accelerating cosmic sun/moon arcs!
    const cx = bounds.fullSize * 0.5;
    const cy = bounds.fullSize * 0.5;
    ctx.globalAlpha = Math.max(0, alpha * 0.72);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const a0 = t * (5 + i * 2) + i * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 110 + i * 55, a0, a0 + Math.PI * 0.65);
      ctx.stroke();
    }

    if (owner && owner.alive) {
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PucciUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 36;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 280, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
