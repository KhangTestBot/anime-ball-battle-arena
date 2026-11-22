import type { JuviaUltimateData } from '../../physics/ultimates/juvia';
import type { UltimateRenderer } from './types';

export const juviaUltimateRenderer: UltimateRenderer = {
  characterId: 'juvia',

  drawBackdrop(ctx, state, bounds, fighters) {
    const data = state.data as unknown as JuviaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.swirlAngle);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 7;
      for (let i = 0; i < 2; i++) {
        const s = i * Math.PI;
        ctx.beginPath();
        ctx.arc(0, 0, 125, s, s + 1.45);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JuviaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 14 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.2 - data.flash) * 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
