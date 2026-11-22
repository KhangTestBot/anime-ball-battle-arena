import type { RohanUltimateData } from '../../physics/ultimates/rohan';
import type { UltimateRenderer } from './types';

export const rohanUltimateRenderer: UltimateRenderer = {
  characterId: 'rohan',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Heaven's Door floating manga pages orbiting Rohan!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 2.0;
        const px = owner.x + Math.cos(ang) * 76;
        const py = owner.y + Math.sin(ang) * 76;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ang);
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.fillRect(-7, -10, 14, 20);
        ctx.strokeRect(-7, -10, 14, 20);
        ctx.restore();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as RohanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
