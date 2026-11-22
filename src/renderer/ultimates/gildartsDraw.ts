import type { GildartsUltimateData } from '../../physics/ultimates/gildarts';
import type { UltimateRenderer } from './types';

export const gildartsUltimateRenderer: UltimateRenderer = {
  characterId: 'gildarts',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    // Crash Magic fracture grid across the arena floor!
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    const step = 64;
    for (let pos = step; pos < bounds.fullSize; pos += step) {
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, bounds.fullSize);
      ctx.moveTo(0, pos);
      ctx.lineTo(bounds.fullSize, pos);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as GildartsUltimateData;
    if (data.flash <= 0) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.impactX, data.impactY);
    // Crash Magic cube shatter rings
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12 * a;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 24;
    const sz = 40 + (1.3 - data.flash) * 190;
    ctx.strokeRect(-sz, -sz, sz * 2, sz * 2);
    ctx.restore();
  },
};
