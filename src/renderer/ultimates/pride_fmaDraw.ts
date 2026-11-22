import type { PrideFmaUltimateData } from '../../physics/ultimates/pride_fma';
import type { UltimateRenderer } from './types';

export const prideFmaUltimateRenderer: UltimateRenderer = {
  characterId: 'pride_fma',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.4);
    ctx.fillStyle = '#090418';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Glowing crimson shadow eyes orbiting Pride
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.92);
      ctx.fillStyle = '#dc2626';
      for (let i = 0; i < 6; i++) {
        const ang = t * 3 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.ellipse(
          owner.x + Math.cos(ang) * 56,
          owner.y + Math.sin(ang) * 56,
          7,
          3.5,
          ang,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PrideFmaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
