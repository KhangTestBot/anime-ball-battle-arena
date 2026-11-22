import type { SashaUltimateData } from '../../physics/ultimates/sasha';
import type { UltimateRenderer } from './types';

export const sashaUltimateRenderer: UltimateRenderer = {
  characterId: 'sasha',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Sniper crosshair reticle orbiting Sasha
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.5;
      const r = owner.radius + 22 + Math.sin(t * 9) * 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as SashaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 15 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 42 + (1.25 - data.flash) * 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
