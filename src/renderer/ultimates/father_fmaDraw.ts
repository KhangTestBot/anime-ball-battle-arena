import type { FatherFmaUltimateData } from '../../physics/ultimates/father_fma';
import type { UltimateRenderer } from './types';

export const fatherFmaUltimateRenderer: UltimateRenderer = {
  characterId: 'father_fma',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.26, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Miniature Sun hovering in Father's palm!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.96);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 36;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y - owner.radius - 30, 20 + Math.sin(t * 14) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as FatherFmaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 44;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 60 + (1.5 - data.flash) * 265, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
