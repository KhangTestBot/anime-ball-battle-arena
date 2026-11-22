import type { ZenonUltimateData } from '../../physics/ultimates/zenon';
import type { UltimateRenderer } from './types';

export const zenonUltimateRenderer: UltimateRenderer = {
  characterId: 'zenon',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spatial Mana Domination glowing cubic lattice around Zenon!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      const sz = 140 + Math.sin(t * 3) * 10;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(owner.x - sz * 0.5, owner.y - sz * 0.5, sz, sz);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(owner.x - sz * 0.35, owner.y - sz * 0.35, sz * 0.7, sz * 0.7);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ZenonUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#e2e8f0';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
