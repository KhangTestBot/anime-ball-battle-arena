import type { LucyUltimateData } from '../../physics/ultimates/lucy_ft';
import type { UltimateRenderer } from './types';

export const lucyFtUltimateRenderer: UltimateRenderer = {
  characterId: 'lucy_ft',

  drawBackdrop(ctx, state, bounds) {
    const data = state.data as unknown as LucyUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    const half = bounds.fullSize * 0.5;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rotating 12-Zodiac Celestial Constellation Ring
    ctx.globalAlpha = Math.max(0, alpha * 0.82);
    ctx.translate(half, half);
    ctx.rotate(data.starAngle * 0.35);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, bounds.fullSize * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.arc(
        Math.cos(a) * bounds.fullSize * 0.38,
        Math.sin(a) * bounds.fullSize * 0.38,
        6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as LucyUltimateData;
    if (data.flash <= 0) return;

    const a = Math.min(1, data.flash);
    const half = bounds.fullSize * 0.5;
    ctx.save();
    ctx.globalAlpha = a * 0.55;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(half, half, 70 + (1.3 - data.flash) * 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
