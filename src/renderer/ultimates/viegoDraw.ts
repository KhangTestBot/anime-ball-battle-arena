import type { ViegoUltimateData } from '../../physics/ultimates/viego';
import type { UltimateRenderer } from './types';

export const viegoUltimateRenderer: UltimateRenderer = {
  characterId: 'viego',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Swirling Emerald Black Mist rings
    ctx.globalAlpha = Math.max(0, alpha * 0.45);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      bounds.fullSize * 0.5,
      bounds.fullSize * 0.5,
      190 + Math.sin(t * 5) * 18,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as ViegoUltimateData;
    if (data.slamFlash <= 0) return;

    const a = Math.min(1, data.slamFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.slamX, data.slamY);
    // Ruined King Crown + Heartbreaker Emerald Crater
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 10 * a;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, 0, 50 + (1.25 - data.slamFlash) * 145, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
