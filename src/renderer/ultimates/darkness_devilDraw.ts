import type { DarknessDevilUltimateData } from '../../physics/ultimates/darkness_devil';
import type { UltimateRenderer } from './types';

export const darknessDevilUltimateRenderer: UltimateRenderer = {
  characterId: 'darkness_devil',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.26, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.48);
    ctx.fillStyle = '#030305';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Primal Darkness pulsing void bell ring
    if (owner && owner.alive) {
      const pulse = (t * 2) % 1;
      ctx.globalAlpha = Math.max(0, alpha * (1 - pulse) * 0.9);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + pulse * 220, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as DarknessDevilUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#7e22ce';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 38;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 52 + (1.5 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
