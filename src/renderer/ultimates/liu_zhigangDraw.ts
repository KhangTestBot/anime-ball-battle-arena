import type { LiuZhigangUltimateData } from '../../physics/ultimates/liu_zhigang';
import type { UltimateRenderer } from './types';

export const liuZhigangUltimateRenderer: UltimateRenderer = {
  characterId: 'liu_zhigang',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Seven-Star orbiting golden stars around Liu Zhigang
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < 7; i++) {
        const ang = t * 4 + (i * Math.PI * 2) / 7;
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 44, owner.y + Math.sin(ang) * 44, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LiuZhigangUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
