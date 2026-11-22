import type { IgrisUltimateData } from '../../physics/ultimates/igris';
import type { UltimateRenderer } from './types';

export const igrisUltimateRenderer: UltimateRenderer = {
  characterId: 'igris',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Blood-red shadow plume crest & aura around Igris
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + Math.sin(t * 10) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as IgrisUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 45 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
