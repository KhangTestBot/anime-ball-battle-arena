import type { DanteBcUltimateData } from '../../physics/ultimates/dante_bc';
import type { UltimateRenderer } from './types';

export const danteBcUltimateRenderer: UltimateRenderer = {
  characterId: 'dante_bc',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.38);
    ctx.fillStyle = '#2a0505';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Presence of the Demon King crushing crimson gravity wells!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 3; i++) {
        const r = 130 - ((t * 80 + i * 40) % 100);
        ctx.strokeStyle = i % 2 === 0 ? '#dc2626' : '#f87171';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, Math.max(20, r), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as DanteBcUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 21 * a;
    ctx.shadowColor = '#7f1d1d';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
