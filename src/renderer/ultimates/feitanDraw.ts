import type { FeitanUltimateData } from '../../physics/ultimates/feitan';
import type { UltimateRenderer } from './types';

export const feitanUltimateRenderer: UltimateRenderer = {
  characterId: 'feitan',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Blazing miniature Rising Sun above Feitan!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.95);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 34;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y - owner.radius - 32, 20 + Math.sin(t * 12) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as FeitanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 42;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 58 + (1.5 - data.flash) * 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
