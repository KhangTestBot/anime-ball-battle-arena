import type { BangUltimateData } from '../../physics/ultimates/bang';
import type { UltimateRenderer } from './types';

export const bangUltimateRenderer: UltimateRenderer = {
  characterId: 'bang',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Flowing Water Stream dual arcs around Silver Fang
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      for (let i = 0; i < 2; i++) {
        const start = t * 5 + i * Math.PI;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 24, start, start + Math.PI * 0.75);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BangUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 14 * a;
    ctx.shadowColor = '#e2e8f0';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.25 - data.flash) * 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
