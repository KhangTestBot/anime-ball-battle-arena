import type { StonksManUltimateData } from '../../physics/ultimates/stonks_man';
import type { UltimateRenderer } from './types';

export const stonksManUltimateRenderer: UltimateRenderer = {
  characterId: 'stonks_man',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rising jagged green Stonks chart line across the arena!
    ctx.globalAlpha = Math.max(0, alpha * 0.82);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const w = bounds.fullSize;
    const h = bounds.fullSize;
    ctx.moveTo(w * 0.1, h * 0.78);
    ctx.lineTo(w * 0.3, h * 0.62 + Math.sin(t * 5) * 8);
    ctx.lineTo(w * 0.45, h * 0.68);
    ctx.lineTo(w * 0.68, h * 0.38 + Math.cos(t * 5) * 8);
    ctx.lineTo(w * 0.9, h * 0.16);
    ctx.stroke();

    if (owner && owner.alive) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as StonksManUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
