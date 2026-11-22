import type { EndermanUltimateData } from '../../physics/ultimates/enderman';
import type { UltimateRenderer } from './types';

export const endermanUltimateRenderer: UltimateRenderer = {
  characterId: 'enderman',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#1e1038';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as EndermanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash / 0.45);
    ctx.save();
    ctx.globalAlpha = a;
    // Ender teleport purple streak connecting last position to current position
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 6 * a;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(owner.x, owner.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },
};
