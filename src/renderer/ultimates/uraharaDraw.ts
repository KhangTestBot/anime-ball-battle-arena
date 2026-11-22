import type { UraharaUltimateData } from '../../physics/ultimates/urahara';
import type { UltimateRenderer } from './types';

export const uraharaUltimateRenderer: UltimateRenderer = {
  characterId: 'urahara',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crimson Chikasumi Blood-Mist Reflect Net surrounding Urahara!
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.72)';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = t * 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as UraharaUltimateData;

    // Kannonbiraki Benihime Aratame Surgical Cross-Stitches dissecting Reconstructed Enemies!
    for (const uid of data.stitchedUids) {
      const f = fighters.find((x) => x.uid === uid && x.alive);
      if (!f) continue;
      ctx.save();
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2.4;
      const r = f.radius + 5;
      ctx.beginPath();
      ctx.moveTo(f.x - r, f.y - 4);
      ctx.lineTo(f.x + r, f.y + 4);
      for (let s = -2; s <= 2; s++) {
        ctx.moveTo(f.x + s * 9 - 2, f.y - 8);
        ctx.lineTo(f.x + s * 9 + 2, f.y + 8);
      }
      ctx.stroke();
      ctx.restore();
    }
  },
};
