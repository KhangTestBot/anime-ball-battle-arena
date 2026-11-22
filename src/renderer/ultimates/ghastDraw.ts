import type { GhastUltimateData } from '../../physics/ultimates/ghast';
import type { UltimateRenderer } from './types';

export const ghastUltimateRenderer: UltimateRenderer = {
  characterId: 'ghast',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as GhastUltimateData;
    if (data.flash <= 0) return;
    const a = Math.min(1, data.flash / 0.55);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = `rgba(249, 115, 22, ${0.35 * a})`;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8 * a;
    ctx.beginPath();
    ctx.arc(data.lastX, data.lastY, 45 + (1 - a) * 145, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};
