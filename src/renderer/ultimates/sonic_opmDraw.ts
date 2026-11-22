import type { SonicOpmUltimateData } from '../../physics/ultimates/sonic_opm';
import type { UltimateRenderer } from './types';

export const sonicOpmUltimateRenderer: UltimateRenderer = {
  characterId: 'sonic_opm',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Ten Shadows Burial orbiting speed-clones!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.55);
      ctx.fillStyle = '#a855f7';
      for (let i = 0; i < 10; i++) {
        const ang = t * 6 + (i * Math.PI * 2) / 10;
        const cx = owner.x + Math.cos(ang) * 78;
        const cy = owner.y + Math.sin(ang) * 78;
        ctx.beginPath();
        ctx.arc(cx, cy, owner.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as SonicOpmUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 14 * a;
    ctx.shadowColor = '#e2e8f0';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.25 - data.flash) * 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
