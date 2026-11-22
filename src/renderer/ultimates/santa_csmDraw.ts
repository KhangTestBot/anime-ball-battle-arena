import type { SantaCsmUltimateData } from '../../physics/ultimates/santa_csm';
import type { UltimateRenderer } from './types';

export const santaCsmUltimateRenderer: UltimateRenderer = {
  characterId: 'santa_csm',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.32);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Puppet doll orbs circling Santa Claus
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.fillStyle = '#a855f7';
      for (let i = 0; i < 6; i++) {
        const ang = t * 4 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 48, owner.y + Math.sin(ang) * 48, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as SantaCsmUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#e2e8f0';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
