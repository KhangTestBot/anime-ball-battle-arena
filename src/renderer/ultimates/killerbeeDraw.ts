import type { KillerBeeUltimateData } from '../../physics/ultimates/killerbee';
import type { UltimateRenderer } from './types';

export const killerbeeUltimateRenderer: UltimateRenderer = {
  characterId: 'killerbee',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Eight-Tails crimson cloak aura around Killer Bee
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20 + Math.sin(t * 14) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KillerBeeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
