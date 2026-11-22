import type { GenosUltimateData } from '../../physics/ultimates/genos';
import type { UltimateRenderer } from './types';

export const genosUltimateRenderer: UltimateRenderer = {
  characterId: 'genos',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 14 + Math.sin(t * 14) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as GenosUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.beamFlash <= 0 || !owner) return;

    const a = Math.min(1, data.beamFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.beamAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, -34 * a, bounds.fullSize * 1.4, 68 * a);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -14 * a, bounds.fullSize * 1.4, 28 * a);
    ctx.restore();
  },
};
