import type { GokuBlackUltimateData } from '../../physics/ultimates/gokublack';
import type { UltimateRenderer } from './types';

export const gokuBlackUltimateRenderer: UltimateRenderer = {
  characterId: 'gokublack',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as GokuBlackUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Swirling Pink-Black Dimensional Scythe Rift tear!
    ctx.translate(data.riftX, data.riftY);
    ctx.rotate(data.riftAngle);
    ctx.globalAlpha = Math.max(0, alpha * 0.92);
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.ellipse(0, 0, 128 + Math.sin(t * 10) * 8, 28 + Math.cos(t * 12) * 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 108, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground() {
    // Scythe projectiles & shockwaves render cleanly over fighters
  },
};
