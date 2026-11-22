import type { AllMightUltimateData } from '../../physics/ultimates/allmight';
import type { UltimateRenderer } from './types';

export const allmightUltimateRenderer: UltimateRenderer = {
  characterId: 'allmight',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Golden-Cyan One For All Full-Cowling Beacon Ring
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = '#facc15';
    ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 24 + Math.sin(t * 10) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 36, t * 4, t * 4 + Math.PI * 1.3);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as AllMightUltimateData;

    // United States of Smash Tornado Cyclone Shockwaves & Comic SMASH! Impact
    if (data.smashFlash > 0) {
      const p = Math.max(0, Math.min(1, data.smashFlash / 1.3));
      ctx.save();
      ctx.globalAlpha = p * 0.82;
      ctx.translate(data.smashX, data.smashY);

      ctx.strokeStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 24;
      for (let i = 0; i < 4; i++) {
        ctx.lineWidth = 5 - i;
        ctx.beginPath();
        ctx.arc(0, 0, 48 + i * 48 * (1.2 - p * 0.3), 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PLUS ULTRA SMASH!', 0, -42);
      ctx.restore();
    }
  },
};
