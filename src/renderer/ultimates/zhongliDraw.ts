import type { ZhongliUltimateData } from '../../physics/ultimates/zhongli';
import type { UltimateRenderer } from './types';

export const zhongliUltimateRenderer: UltimateRenderer = {
  characterId: 'zhongli',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as ZhongliUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Golden Geo Meteor target glyph
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(data.targetX, data.targetY, 36 + i * 32 + Math.sin(t * 8) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as ZhongliUltimateData;
    if (data.meteorFlash <= 0) return;

    const a = Math.min(1, data.meteorFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(data.targetX, data.targetY, 55 + (1.45 - data.meteorFlash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
