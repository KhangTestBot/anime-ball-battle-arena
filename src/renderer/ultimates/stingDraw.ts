import type { StingUltimateData } from '../../physics/ultimates/sting';
import type { UltimateRenderer } from './types';

export const stingUltimateRenderer: UltimateRenderer = {
  characterId: 'sting',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as StingUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    const len = bounds.fullSize * 1.4;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;

    for (const ang of data.beamAngles) {
      const x2 = owner.x + Math.cos(ang) * len;
      const y2 = owner.y + Math.sin(ang) * len;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 14 * a;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * a;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
