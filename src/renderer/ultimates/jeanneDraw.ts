import type { JeanneUltimateData } from '../../physics/ultimates/jeanne';
import type { UltimateRenderer } from './types';

export const jeanneUltimateRenderer: UltimateRenderer = {
  characterId: 'jeanne',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#172554';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Luminosité Eternelle golden holy dome nullifying enemy projectiles!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 150, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 122, t * 2, t * 2 + Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JeanneUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
