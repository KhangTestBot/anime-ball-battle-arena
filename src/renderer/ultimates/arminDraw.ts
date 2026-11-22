import type { ArminUltimateData } from '../../physics/ultimates/armin';
import type { UltimateRenderer } from './types';

export const arminUltimateRenderer: UltimateRenderer = {
  characterId: 'armin',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.26, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.32);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rising Colossal Steam & Golden Transformation Lightning
    if (owner && owner.alive) {
      const pulse = (t * 2.8) % 1;
      ctx.globalAlpha = Math.max(0, alpha * (1 - pulse) * 0.85);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + pulse * 190, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ArminUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 60 + (1.5 - data.flash) * 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
