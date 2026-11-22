import type { NachtUltimateData } from '../../physics/ultimates/nacht';
import type { UltimateRenderer } from './types';

export const nachtUltimateRenderer: UltimateRenderer = {
  characterId: 'nacht',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.42);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Monument of Atonement twin shadow gates & orbiting devil-pack eyes!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 90, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + t * 2.5;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 70, owner.y + Math.sin(ang) * 70, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as NachtUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#334155';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
