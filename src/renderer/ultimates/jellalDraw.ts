import type { JellalUltimateData } from '../../physics/ultimates/jellal';
import type { UltimateRenderer } from './types';

export const jellalUltimateRenderer: UltimateRenderer = {
  characterId: 'jellal',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as JellalUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Golden-Indigo Heavenly Body Magic Circle around Sema target
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    ctx.translate(data.semaX, data.semaY);
    ctx.rotate(t * 2.5);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 145, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as JellalUltimateData;
    if (data.impacted) return;

    const p = data.progress;
    const dropY = bounds.top - 70 + (data.semaY - (bounds.top - 70)) * (p * p);

    ctx.save();
    ctx.translate(data.semaX, dropY);
    ctx.fillStyle = '#312e81';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};
