import type { RoyUltimateData } from '../../physics/ultimates/roy';
import type { UltimateRenderer } from './types';

export const royUltimateRenderer: UltimateRenderer = {
  characterId: 'roy',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as RoyUltimateData;
    if (data.blastFlash <= 0) return;

    const a = Math.min(1, data.blastFlash / 0.52);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.blastX, data.blastY);

    // Pinpoint Flame Alchemy Transmutation Circle + Incineration Pillar!
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 6 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, 0, 88 * (1.2 - a * 0.25), 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(250, 204, 21, ${0.42 * a})`;
    ctx.beginPath();
    ctx.arc(0, 0, 56 * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
