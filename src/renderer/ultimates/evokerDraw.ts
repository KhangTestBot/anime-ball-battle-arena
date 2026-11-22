import type { EvokerUltimateData } from '../../physics/ultimates/evoker';
import type { UltimateRenderer } from './types';

export const evokerUltimateRenderer: UltimateRenderer = {
  characterId: 'evoker',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as EvokerUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    const lx = Math.cos(data.fangAngle);
    const ly = Math.sin(data.fangAngle);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    // Snapping line of pixelated Evoker Fangs erupting along the corridor!
    for (let k = 1; k <= 8; k++) {
      const fx = owner.x + lx * k * 52;
      const fy = owner.y + ly * k * 52;
      ctx.beginPath();
      ctx.moveTo(fx - 12, fy + 10);
      ctx.lineTo(fx, fy - 18);
      ctx.lineTo(fx + 12, fy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },
};
