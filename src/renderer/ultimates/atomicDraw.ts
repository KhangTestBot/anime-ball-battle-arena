import type { AtomicUltimateData } from '../../physics/ultimates/atomic';
import type { UltimateRenderer } from './types';

export const atomicUltimateRenderer: UltimateRenderer = {
  characterId: 'atomic',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rapid cross-hatched Atomic Slash lattice around owner
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.65);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 4;
        ctx.beginPath();
        ctx.moveTo(owner.x - Math.cos(ang) * 90, owner.y - Math.sin(ang) * 90);
        ctx.lineTo(owner.x + Math.cos(ang) * 90, owner.y + Math.sin(ang) * 90);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AtomicUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
