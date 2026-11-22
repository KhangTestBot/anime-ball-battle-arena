import type { AshbornUltimateData } from '../../physics/ultimates/ashborn';
import type { UltimateRenderer } from './types';

export const ashbornUltimateRenderer: UltimateRenderer = {
  characterId: 'ashborn',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.26, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#0f0728';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rising Shadow Legion wisps around Original Shadow Monarch Ashborn
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        const start = t * 4 + (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 20 + i * 22, start, start + Math.PI * 0.65);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as AshbornUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 50 + (1.5 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
