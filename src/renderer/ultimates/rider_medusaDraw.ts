import type { RiderMedusaUltimateData } from '../../physics/ultimates/rider_medusa';
import type { UltimateRenderer } from './types';

export const riderMedusaUltimateRenderer: UltimateRenderer = {
  characterId: 'rider_medusa',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.32);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Mystic Eyes of Cybele violet rings & Bellerophon white-silver aura!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 3; i++) {
        const r = owner.radius + 25 + ((t * 90 + i * 35) % 105);
        ctx.strokeStyle = i % 2 === 0 ? '#9333ea' : '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as RiderMedusaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#9333ea';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
