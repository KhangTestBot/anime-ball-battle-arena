import type { YoupiUltimateData } from '../../physics/ultimates/youpi';
import type { UltimateRenderer } from './types';

export const youpiUltimateRenderer: UltimateRenderer = {
  characterId: 'youpi',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Expanding volcanic rage aura around Youpi
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24 + Math.sin(t * 16) * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as YoupiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 56 + (1.5 - data.flash) * 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
