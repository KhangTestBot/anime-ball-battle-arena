import type { CharaUltimateData } from '../../physics/ultimates/chara';
import type { UltimateRenderer } from './types';

export const charaUltimateRenderer: UltimateRenderer = {
  characterId: 'chara',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.38);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as CharaUltimateData;
    if (data.flash <= 0) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    // Screen-splitting Real Knife crimson slash across the entire arena!
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 24 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 36;
    ctx.beginPath();
    ctx.moveTo(0, bounds.fullSize * 0.15);
    ctx.lineTo(bounds.fullSize, bounds.fullSize * 0.85);
    ctx.stroke();
    ctx.restore();
  },
};
