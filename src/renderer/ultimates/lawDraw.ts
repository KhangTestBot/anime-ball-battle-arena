import type { LawUltimateData } from '../../physics/ultimates/law';
import type { UltimateRenderer } from './types';

export const lawUltimateRenderer: UltimateRenderer = {
  characterId: 'law',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as LawUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // Translucent Surgical Cyan ROOM Sphere!
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(data.roomX, data.roomY);
    const grad = ctx.createRadialGradient(0, 0, data.roomRadius * 0.25, 0, 0, data.roomRadius);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.04)');
    grad.addColorStop(0.75, 'rgba(34, 211, 238, 0.16)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.42)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.roomRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 16;
    ctx.stroke();

    // Subtle operating grid lines inside ROOM
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.28)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, data.roomRadius * 0.62, t, t + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as LawUltimateData;

    // Climax Deep-Ground PUNCTURE WILLE Shock-Sword Laser!
    if (data.willeFired && data.willeTimer > 0) {
      const a = Math.max(0, Math.min(1, data.willeTimer / 0.9));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 34 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(data.willeX1, data.willeY1);
      ctx.lineTo(data.willeX2, data.willeY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 11 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
