import type { RukiaUltimateData } from '../../physics/ultimates/rukia';
import type { UltimateRenderer } from './types';

export const rukiaUltimateRenderer: UltimateRenderer = {
  characterId: 'rukia',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as RukiaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Hakka no Togame: Snow-White Kimono Absolute Zero Cold Mist (-273.15°C)!
    ctx.save();
    ctx.translate(data.zeroX, data.zeroY);
    const grad = ctx.createRadialGradient(0, 0, owner.radius * 0.4, 0, 0, data.zeroRadius);
    grad.addColorStop(0, 'rgba(248, 250, 252, 0.55)');
    grad.addColorStop(0.6, 'rgba(186, 230, 253, 0.25)');
    grad.addColorStop(1, 'rgba(125, 211, 252, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.zeroRadius, 0, Math.PI * 2);
    ctx.fill();

    // 6 Falling Snowflakes inside Absolute Zero Domain
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const a = t * 1.4 + (i * Math.PI) / 3;
      const sx = Math.cos(a) * (data.zeroRadius * 0.6);
      const sy = Math.sin(a) * (data.zeroRadius * 0.6);
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy);
      ctx.lineTo(sx + 6, sy);
      ctx.moveTo(sx, sy - 6);
      ctx.lineTo(sx, sy + 6);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as RukiaUltimateData;

    // Absolute Zero Ice Shatter Ring
    if (data.snowFlash > 0) {
      const p = Math.max(0, Math.min(1, data.snowFlash / 1.25));
      ctx.save();
      ctx.globalAlpha = p * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.arc(data.zeroX, data.zeroY, 40 + (1 - p) * 215, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
