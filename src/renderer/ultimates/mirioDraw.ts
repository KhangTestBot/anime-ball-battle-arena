import type { MirioUltimateData } from '../../physics/ultimates/mirio';
import type { UltimateRenderer } from './types';

export const mirioUltimateRenderer: UltimateRenderer = {
  characterId: 'mirio',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Golden Permeation phase ripples around Mirio!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.82);
      for (let i = 0; i < 3; i++) {
        const pulse = ((t * 2.2 + i * 0.33) % 1) * 95;
        ctx.strokeStyle = i % 2 === 0 ? '#facc15' : '#60a5fa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MirioUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#2563eb';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
