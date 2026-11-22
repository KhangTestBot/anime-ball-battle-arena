import type { RaidenUltimateData } from '../../physics/ultimates/raiden';
import type { UltimateRenderer } from './types';

export const raidenUltimateRenderer: UltimateRenderer = {
  characterId: 'raiden',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Chakra Desiderata Electro Halo behind Raiden Shogun!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 28, t * 2, t * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as RaidenUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.musouFlash <= 0 || !owner) return;

    const a = Math.min(1, data.musouFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.musouAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 36;
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(-bounds.fullSize, -34 * a, bounds.fullSize * 2, 68 * a);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-bounds.fullSize, -12 * a, bounds.fullSize * 2, 24 * a);
    ctx.restore();
  },
};
