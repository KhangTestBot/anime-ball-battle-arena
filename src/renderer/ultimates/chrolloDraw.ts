import type { ChrolloUltimateData } from '../../physics/ultimates/chrollo';
import type { UltimateRenderer } from './types';

export const chrolloUltimateRenderer: UltimateRenderer = {
  characterId: 'chrollo',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Sun (+) and Moon (-) glowing seals orbiting Chrollo
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.92);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(owner.x + Math.cos(t * 5) * 44, owner.y + Math.sin(t * 5) * 44, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(
        owner.x + Math.cos(t * 5 + Math.PI) * 44,
        owner.y + Math.sin(t * 5 + Math.PI) * 44,
        7,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ChrolloUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
