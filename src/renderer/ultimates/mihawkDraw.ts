import type { MihawkUltimateData } from '../../physics/ultimates/mihawk';
import type { UltimateRenderer } from './types';

export const mihawkUltimateRenderer: UltimateRenderer = {
  characterId: 'mihawk',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MihawkUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Gold Hawk-Eye Targeting Line & Emerald Ringed Gaze
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.72)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 14, 0, Math.PI * 2);
    ctx.stroke();

    if (data.stage === 'hawk-focus') {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#10b981';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(data.aimAngle) * 320, Math.sin(data.aimAngle) * 320);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as MihawkUltimateData;

    // Colossal Arena-Cutting Emerald-Obsidian Black Blade YORU Trench Flash
    if (data.slashFlash > 0) {
      const p = Math.max(0, Math.min(1, data.slashFlash / 1.3));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 34 * p;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();

      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 10 * p;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
