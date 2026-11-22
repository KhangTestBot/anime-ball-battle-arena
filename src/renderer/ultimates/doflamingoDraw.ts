import type { DoflamingoUltimateData } from '../../physics/ultimates/doflamingo';
import type { UltimateRenderer } from './types';

export const doflamingoUltimateRenderer: UltimateRenderer = {
  characterId: 'doflamingo',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as DoflamingoUltimateData;

    // TORIKAGO: Luminous White-Rose Shrinking Birdcage Dome Wires
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.72)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(data.centerX, data.centerY, data.cageRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12 + t * 0.25;
      ctx.beginPath();
      ctx.moveTo(
        data.centerX + Math.cos(a) * data.cageRadius,
        data.centerY + Math.sin(a) * data.cageRadius,
      );
      ctx.quadraticCurveTo(
        data.centerX + Math.cos(a + 0.35) * (data.cageRadius * 0.55),
        data.centerY + Math.sin(a + 0.35) * (data.cageRadius * 0.55),
        data.centerX,
        data.centerY,
      );
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as DoflamingoUltimateData;

    // 16 Holy Bullets: Awakening White-Crimson GOD THREAD Lances!
    for (const sp of data.spears) {
      const p = Math.max(0, Math.min(1, sp.life / 0.95));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sp.x1, sp.y1);
      ctx.lineTo(sp.x2, sp.y2);
      ctx.stroke();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  },
};
