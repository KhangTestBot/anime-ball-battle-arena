import type { GajeelUltimateData } from '../../physics/ultimates/gajeel';
import type { UltimateRenderer } from './types';

export const gajeelUltimateRenderer: UltimateRenderer = {
  characterId: 'gajeel',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as GajeelUltimateData;
    if (data.flash <= 0) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    // Giant Iron God Sword metallic cleave column!
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#cbd5e1';
    ctx.shadowBlur = 18;
    ctx.fillRect(data.slamX - 24, bounds.top, 48, data.slamY - bounds.top + 36);
    ctx.strokeRect(data.slamX - 24, bounds.top, 48, data.slamY - bounds.top + 36);
    ctx.restore();
  },
};
