import type { KingSdsUltimateData } from '../../physics/ultimates/king_sds';
import type { UltimateRenderer } from './types';

export const kingSdsUltimateRenderer: UltimateRenderer = {
  characterId: 'king_sds',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Pollen Garden dome around King
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 26 + Math.sin(t * 9) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as KingSdsUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.sunflowerFlash <= 0 || !owner) return;

    const a = Math.min(1, data.sunflowerFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.sunflowerAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, -38 * a, bounds.fullSize * 1.4, 76 * a);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -15 * a, bounds.fullSize * 1.4, 30 * a);
    ctx.restore();
  },
};
