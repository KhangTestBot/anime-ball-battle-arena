import type { ZedUltimateData } from '../../physics/ultimates/zed';
import type { UltimateRenderer } from './types';

export const zedUltimateRenderer: UltimateRenderer = {
  characterId: 'zed',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as ZedUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Dark crimson shadow triangle connecting the 2 Living Shadows to the marked target
    if (data.shadows.length >= 2) {
      ctx.globalAlpha = Math.max(0, alpha * 0.55);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(data.shadows[0].x, data.shadows[0].y);
      ctx.lineTo(data.shadows[1].x, data.shadows[1].y);
      ctx.lineTo(data.detonateX, data.detonateY);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Living Shadow silhouettes
    for (const s of data.shadows) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22 + Math.sin(t * 14) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Glowing red shadow eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-7, -3, 5, 3);
      ctx.fillRect(2, -3, 5, 3);
      ctx.restore();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as ZedUltimateData;
    ctx.save();
    if (!data.markDetonated) {
      // Spinning X Death Mark over target
      ctx.translate(data.detonateX, data.detonateY);
      ctx.rotate(t * 4.5);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(-24, -24);
      ctx.lineTo(24, 24);
      ctx.moveTo(24, -24);
      ctx.lineTo(-24, 24);
      ctx.stroke();
    } else if (data.detonateFlash > 0) {
      const a = Math.min(1, data.detonateFlash);
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 8 * a;
      ctx.beginPath();
      ctx.arc(
        data.detonateX,
        data.detonateY,
        30 + (1.1 - data.detonateFlash) * 140,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.restore();
  },
};
