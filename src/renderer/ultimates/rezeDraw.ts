import type { RezeUltimateData } from '../../physics/ultimates/reze';
import type { UltimateRenderer } from './types';

export const rezeUltimateRenderer: UltimateRenderer = {
  characterId: 'reze',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 22 + Math.sin(t * 16) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as RezeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 55 + (1.45 - data.flash) * 255, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
