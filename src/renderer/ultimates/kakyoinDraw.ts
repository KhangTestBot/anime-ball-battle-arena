import type { KakyoinUltimateData } from '../../physics/ultimates/kakyoin';
import type { UltimateRenderer } from './types';

export const kakyoinUltimateRenderer: UltimateRenderer = {
  characterId: 'kakyoin',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // 20-Meter Hierophant Green Emerald Web across the arena!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.72);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 0.35;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(owner.x + Math.cos(ang) * 220, owner.y + Math.sin(ang) * 220);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 120, 0, Math.PI * 2);
      ctx.arc(owner.x, owner.y, 200, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KakyoinUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
