import type { LaraUltimateData } from '../../physics/ultimates/lara';
import type { UltimateRenderer } from './types';

export const laraUltimateRenderer: UltimateRenderer = {
  characterId: 'lara',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // War Hammer crystal lattice spikes radiating around Lara
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 1.5;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * owner.radius, owner.y + Math.sin(ang) * owner.radius);
        ctx.lineTo(
          owner.x + Math.cos(ang) * (owner.radius + 36),
          owner.y + Math.sin(ang) * (owner.radius + 36),
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LaraUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
