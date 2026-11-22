import type { PopCatUltimateData } from '../../physics/ultimates/pop_cat';
import type { UltimateRenderer } from './types';

export const popCatUltimateRenderer: UltimateRenderer = {
  characterId: 'pop_cat',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rapidly pulsing concentric POP! acoustic rings around Pop Cat!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 4; i++) {
        const r = owner.radius + 16 + ((t * 180 + i * 38) % 140);
        ctx.strokeStyle = i % 2 === 0 ? '#f97316' : '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PopCatUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
