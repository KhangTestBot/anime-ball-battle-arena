import type { SanemiUltimateData } from '../../physics/ultimates/sanemi';
import type { UltimateRenderer } from './types';

export const sanemiUltimateRenderer: UltimateRenderer = {
  characterId: 'sanemi',

  drawBackdrop(ctx, state, bounds, fighters) {
    const data = state.data as unknown as SanemiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.78);
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.swirlAngle);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 6;
      for (let i = 0; i < 4; i++) {
        const s = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, 120 + i * 16, s, s + 0.9);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground() {
    // Wind cyclones & shockwaves render cleanly over fighters
  },
};
