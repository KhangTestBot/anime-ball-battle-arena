import type { KatarinaUltimateData } from '../../physics/ultimates/katarina';
import type { UltimateRenderer } from './types';

export const katarinaUltimateRenderer: UltimateRenderer = {
  characterId: 'katarina',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spinning Death Lotus crimson blade ring
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 4;
      const start = t * 18;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 38, start, start + Math.PI * 1.4);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KatarinaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
