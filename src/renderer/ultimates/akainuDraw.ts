import type { AkainuUltimateData } from '../../physics/ultimates/akainu';
import type { UltimateRenderer } from './types';

export const akainuUltimateRenderer: UltimateRenderer = {
  characterId: 'akainu',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as AkainuUltimateData;

    // 4 Bubbling Dark-Basalt & Molten Magma Volcano Craters on Arena Floor
    for (let i = 0; i < data.craters.length; i++) {
      const c = data.craters[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, c.radius);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, 'rgba(220, 38, 38, 0.72)');
      grad.addColorStop(0.85, 'rgba(69, 10, 10, 0.65)');
      grad.addColorStop(1, 'rgba(69, 10, 10, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius + Math.sin(t * 7 + i) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as AkainuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Dai Funka Magma Fist Halo & Eruption Glow
    if (owner && data.eruptionFlash > 0) {
      const p = Math.max(0, Math.min(1, data.eruptionFlash));
      ctx.save();
      ctx.globalAlpha = p * 0.7;
      ctx.strokeStyle = '#f97316';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 32 + (1 - p) * 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
