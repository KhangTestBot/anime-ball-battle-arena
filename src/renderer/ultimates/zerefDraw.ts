import type { ZerefUltimateData } from '../../physics/ultimates/zeref';
import type { UltimateRenderer } from './types';

export const zerefUltimateRenderer: UltimateRenderer = {
  characterId: 'zeref',

  drawBackdrop(ctx, state, bounds, fighters) {
    const data = state.data as unknown as ZerefUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.42);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Expanding Death Predation pitch-black necrotic wave!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.78);
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#6d28d9';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, data.waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ZerefUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a * 0.65;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 14 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 45 + (1.3 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
