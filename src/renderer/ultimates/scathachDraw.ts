import type { ScathachUltimateData } from '../../physics/ultimates/scathach';
import type { UltimateRenderer } from './types';

export const scathachUltimateRenderer: UltimateRenderer = {
  characterId: 'scathach',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#1e0533';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Gate of Skye abyssal vortex & glowing primordial runes!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 100, t * 2, t * 2 + Math.PI * 1.6);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 72, -t * 3, -t * 3 + Math.PI * 1.4);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ScathachUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
