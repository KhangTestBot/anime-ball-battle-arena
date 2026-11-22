import type { MerlinSdsUltimateData } from '../../physics/ultimates/merlin_sds';
import type { UltimateRenderer } from './types';

export const merlinSdsUltimateRenderer: UltimateRenderer = {
  characterId: 'merlin_sds',

  drawBackdrop(ctx, state, bounds, fighters) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Perfect Cube violet square shield around Merlin!
    if (owner && owner.alive) {
      const s = owner.radius + 26;
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.strokeRect(owner.x - s, owner.y - s, s * 2, s * 2);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as MerlinSdsUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.rayFlash <= 0 || !owner) return;

    const a = Math.min(1, data.rayFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.rayAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(0, -34 * a, bounds.fullSize * 1.4, 68 * a);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, -14 * a, bounds.fullSize * 1.4, 28 * a);
    ctx.restore();
  },
};
