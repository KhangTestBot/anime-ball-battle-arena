import type { PoufUltimateData } from '../../physics/ultimates/pouf';
import type { UltimateRenderer } from './types';

export const poufUltimateRenderer: UltimateRenderer = {
  characterId: 'pouf',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Shimmering Beelzebub hypnotic scales orbiting Pouf
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.fillStyle = '#eab308';
      for (let i = 0; i < 8; i++) {
        const ang = t * 4 + (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 52, owner.y + Math.sin(ang) * 52, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PoufUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
