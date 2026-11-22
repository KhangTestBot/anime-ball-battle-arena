import type { GrayUltimateData } from '../../physics/ultimates/gray';
import type { UltimateRenderer } from './types';

export const grayUltimateRenderer: UltimateRenderer = {
  characterId: 'gray',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as GrayUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    const len = bounds.fullSize * 1.4;
    const x2 = owner.x + Math.cos(data.arrowAngle) * len;
    const y2 = owner.y + Math.sin(data.arrowAngle) * len;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 44 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 18 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
};
