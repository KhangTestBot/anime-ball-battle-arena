import type { JeanUltimateData } from '../../physics/ultimates/jean';
import type { UltimateRenderer } from './types';

export const jeanUltimateRenderer: UltimateRenderer = {
  characterId: 'jean',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 18 + Math.sin(t * 10) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JeanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 15 * a;
    ctx.shadowColor = '#15803d';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 42 + (1.25 - data.flash) * 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
