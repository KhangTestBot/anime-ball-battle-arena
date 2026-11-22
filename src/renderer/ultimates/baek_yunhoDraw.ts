import type { BaekYunhoUltimateData } from '../../physics/ultimates/baek_yunho';
import type { UltimateRenderer } from './types';

export const baekYunhoUltimateRenderer: UltimateRenderer = {
  characterId: 'baek_yunho',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // White Tiger amber aura
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + Math.sin(t * 12) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BaekYunhoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
