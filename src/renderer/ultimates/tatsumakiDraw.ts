import type { TatsumakiUltimateData } from '../../physics/ultimates/tatsumaki';
import type { UltimateRenderer } from './types';

export const tatsumakiUltimateRenderer: UltimateRenderer = {
  characterId: 'tatsumaki',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as TatsumakiUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Emerald telekinetic lock-on rings
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const r = 34 + i * 28 + Math.sin(t * 9 + i) * 6;
      ctx.beginPath();
      ctx.arc(data.targetX, data.targetY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as TatsumakiUltimateData;
    if (data.meteorFlash <= 0) return;

    const a = Math.min(1, data.meteorFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(data.targetX, data.targetY, 50 + (1.4 - data.meteorFlash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
