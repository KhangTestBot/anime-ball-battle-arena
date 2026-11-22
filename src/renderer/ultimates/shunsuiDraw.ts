import type { ShunsuiUltimateData } from '../../physics/ultimates/shunsui';
import type { UltimateRenderer } from './types';

export const shunsuiUltimateRenderer: UltimateRenderer = {
  characterId: 'shunsui',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.4);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Falling crimson-pink theater petals of Karamatsu Shinju
    ctx.globalAlpha = Math.max(0, alpha * 0.75);
    ctx.fillStyle = '#ec4899';
    for (let i = 0; i < 14; i++) {
      const px = (i * 113 + t * 35) % bounds.fullSize;
      const py = (i * 157 + t * 55) % bounds.fullSize;
      ctx.fillRect(px, py, 5, 3);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as ShunsuiUltimateData;
    if (data.flash <= 0) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    // Act 4 luminous white-pink thread cutting across the entire arena!
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 36;
    ctx.beginPath();
    ctx.moveTo(0, bounds.fullSize * 0.5);
    ctx.lineTo(bounds.fullSize, bounds.fullSize * 0.5);
    ctx.stroke();
    ctx.restore();
  },
};
