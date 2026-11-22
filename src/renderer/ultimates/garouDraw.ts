import type { GarouUltimateData } from '../../physics/ultimates/garou';
import type { UltimateRenderer } from './types';

export const garouUltimateRenderer: UltimateRenderer = {
  characterId: 'garou',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#090418';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Cosmic starfield dots
    ctx.globalAlpha = Math.max(0, alpha * 0.7);
    ctx.fillStyle = '#e9d5ff';
    for (let i = 0; i < 18; i++) {
      const sx = (i * 137 + t * 18) % bounds.fullSize;
      const sy = (i * 211 + Math.sin(t + i) * 14) % bounds.fullSize;
      ctx.fillRect(sx, sy, 2.5, 2.5);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as GarouUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.grbFlash <= 0 || !owner) return;

    const a = Math.min(1, data.grbFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.grbAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 32;
    // Twin relativistic Gamma Ray Burst jets
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(-bounds.fullSize, -28 * a, bounds.fullSize * 2, 56 * a);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-bounds.fullSize, -10 * a, bounds.fullSize * 2, 20 * a);
    // Central black-hole singularity
    ctx.fillStyle = '#090418';
    ctx.beginPath();
    ctx.arc(0, 0, 26 * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
