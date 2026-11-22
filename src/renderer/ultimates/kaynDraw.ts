import type { KaynUltimateData } from '../../physics/ultimates/kayn';
import type { UltimateRenderer } from './types';

export const kaynUltimateRenderer: UltimateRenderer = {
  characterId: 'kayn',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Dual Rhaast (Crimson) + Shadow Assassin (Blue) orbiting arcs
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24, t * 6, t * 6 + Math.PI * 0.8);
      ctx.stroke();
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24, t * 6 + Math.PI, t * 6 + Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KaynUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
