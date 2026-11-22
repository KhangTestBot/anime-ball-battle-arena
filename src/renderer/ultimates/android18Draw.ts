import type { Android18UltimateData } from '../../physics/ultimates/android18';
import type { UltimateRenderer } from './types';

export const android18UltimateRenderer: UltimateRenderer = {
  characterId: 'android18',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spinning golden Destructo Disc ring around Android 18
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      const start = t * 16;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24, start, start + Math.PI * 1.4);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as Android18UltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
