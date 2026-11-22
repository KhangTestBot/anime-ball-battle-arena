import type { DiavoloUltimateData } from '../../physics/ultimates/diavolo';
import type { UltimateRenderer } from './types';

export const diavoloUltimateRenderer: UltimateRenderer = {
  characterId: 'diavolo',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.42);
    ctx.fillStyle = '#1f040b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // King Crimson Time Erasure shattered crimson grid!
    ctx.globalAlpha = Math.max(0, alpha * 0.4);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    const step = 90;
    const shift = (t * 60) % step;
    for (let x = shift; x < bounds.fullSize; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 30, bounds.fullSize);
      ctx.stroke();
    }

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as DiavoloUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#fda4af';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
