import type { UrarakaUltimateData } from '../../physics/ultimates/uraraka';
import type { UltimateRenderer } from './types';

export const urarakaUltimateRenderer: UltimateRenderer = {
  characterId: 'uraraka',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Zero Gravity floating pink-white aura field & rising debris pebbles!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 140 + Math.sin(t * 3) * 10, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 1.1;
        const r = 85 + (i % 3) * 22;
        const px = owner.x + Math.cos(ang) * r;
        const py = owner.y + Math.sin(ang) * r - Math.sin(t * 4 + i) * 12;
        ctx.fillStyle = i % 2 === 0 ? '#f472b6' : '#f8fafc';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as UrarakaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
