import type { MitsuriUltimateData } from '../../physics/ultimates/mitsuri';
import type { UltimateRenderer } from './types';

export const mitsuriUltimateRenderer: UltimateRenderer = {
  characterId: 'mitsuri',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Ribbon whip-blade spiral around Mitsuri
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 26, t * 9, t * 9 + Math.PI * 1.4);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MitsuriUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#84cc16';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
