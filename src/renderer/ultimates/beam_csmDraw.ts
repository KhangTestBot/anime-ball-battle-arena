import type { BeamCsmUltimateData } from '../../physics/ultimates/beam_csm';
import type { UltimateRenderer } from './types';

export const beamCsmUltimateRenderer: UltimateRenderer = {
  characterId: 'beam_csm',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Floor-swimming ripple rings around Beam
    if (owner && owner.alive) {
      const pulse = (t * 3) % 1;
      ctx.globalAlpha = Math.max(0, alpha * (1 - pulse) * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + pulse * 140, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BeamCsmUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
