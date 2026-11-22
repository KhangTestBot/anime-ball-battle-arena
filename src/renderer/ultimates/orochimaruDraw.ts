import type { OrochimaruUltimateData } from '../../physics/ultimates/orochimaru';
import type { UltimateRenderer } from './types';

export const orochimaruUltimateRenderer: UltimateRenderer = {
  characterId: 'orochimaru',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Coiling Eight-Headed Serpent rings
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      for (let i = 0; i < 2; i++) {
        const start = t * 6 + i * Math.PI;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 26, start, start + Math.PI * 0.8);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as OrochimaruUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
