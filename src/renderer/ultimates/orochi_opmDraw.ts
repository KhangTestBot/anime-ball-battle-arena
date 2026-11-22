import type { OrochiOpmUltimateData } from '../../physics/ultimates/orochi_opm';
import type { UltimateRenderer } from './types';

export const orochiOpmUltimateRenderer: UltimateRenderer = {
  characterId: 'orochi_opm',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Magma siphon rays converging on Monster King Orochi
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.7);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 2.5;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 120, owner.y + Math.sin(ang) * 120);
        ctx.lineTo(
          owner.x + Math.cos(ang) * (owner.radius + 6),
          owner.y + Math.sin(ang) * (owner.radius + 6),
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as OrochiOpmUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.gaiaFlash <= 0 || !owner) return;

    const a = Math.min(1, data.gaiaFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.gaiaAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, -40 * a, bounds.fullSize * 1.4, 80 * a);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -16 * a, bounds.fullSize * 1.4, 32 * a);
    ctx.restore();
  },
};
