import type { JonathanUltimateData } from '../../physics/ultimates/jonathan';
import type { UltimateRenderer } from './types';

export const jonathanUltimateRenderer: UltimateRenderer = {
  characterId: 'jonathan',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Golden Solar Hamon ripples radiating around Jonathan!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 3; i++) {
        const r = owner.radius + 20 + ((t * 95 + i * 35) % 105);
        ctx.strokeStyle = i % 2 === 0 ? '#facc15' : '#3b82f6';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JonathanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
