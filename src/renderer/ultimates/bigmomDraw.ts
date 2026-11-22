import type { BigMomUltimateData } from '../../physics/ultimates/bigmom';
import type { UltimateRenderer } from './types';

export const bigmomUltimateRenderer: UltimateRenderer = {
  characterId: 'bigmom',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Orbiting Prometheus (Sun) & Hera (Thundercloud) homies!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.95);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(owner.x + Math.cos(t * 4) * 48, owner.y + Math.sin(t * 4) * 48, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(
        owner.x + Math.cos(t * 4 + Math.PI) * 48,
        owner.y + Math.sin(t * 4 + Math.PI) * 48,
        10,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as BigMomUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.maserFlash <= 0 || !owner) return;

    const a = Math.min(1, data.maserFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.maserAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(0, -40 * a, bounds.fullSize * 1.4, 80 * a);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -16 * a, bounds.fullSize * 1.4, 32 * a);
    ctx.restore();
  },
};
