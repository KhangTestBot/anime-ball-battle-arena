import type { JosephUltimateData } from '../../physics/ultimates/joseph';
import type { UltimateRenderer } from './types';

export const josephUltimateRenderer: UltimateRenderer = {
  characterId: 'joseph',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Hermit Purple thorny Hamon vines radiating outward!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 1.5;
        ctx.strokeStyle = i % 2 === 0 ? '#a855f7' : '#facc15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.quadraticCurveTo(
          owner.x + Math.cos(ang + 0.4) * 70,
          owner.y + Math.sin(ang + 0.4) * 70,
          owner.x + Math.cos(ang) * 125,
          owner.y + Math.sin(ang) * 125,
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JosephUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
