import type { MetalBatUltimateData } from '../../physics/ultimates/metalbat';
import type { UltimateRenderer } from './types';

export const metalbatUltimateRenderer: UltimateRenderer = {
  characterId: 'metalbat',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Savage Tornado crimson spin arcs
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      const start = t * 14;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 26, start, start + Math.PI * 1.2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MetalBatUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#cbd5e1';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 45 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
