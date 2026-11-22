import type { WendyUltimateData } from '../../physics/ultimates/wendy';
import type { UltimateRenderer } from './types';

export const wendyUltimateRenderer: UltimateRenderer = {
  characterId: 'wendy',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as WendyUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.78);
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.swirlAngle);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i++) {
      const s = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, 105 + i * 22, s, s + 1.0);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as WendyUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 14 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.2 - data.flash) * 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
