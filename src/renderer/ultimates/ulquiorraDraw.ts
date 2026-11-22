import type { UlquiorraUltimateData } from '../../physics/ultimates/ulquiorra';
import type { UltimateRenderer } from './types';

export const ulquiorraUltimateRenderer: UltimateRenderer = {
  characterId: 'ulquiorra',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Segunda Etapa Wide Black Bat Wings behind Ulquiorra!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(9, 9, 11, 0.82)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 10, 0);
      ctx.lineTo(side * 68, -32);
      ctx.lineTo(side * 56, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as UlquiorraUltimateData;

    // 1. Flying Emerald Lanza del Relámpago Lance!
    if (data.stage === 'segunda-dash') {
      const ang = Math.atan2(data.lanceVy, data.lanceVx);
      ctx.save();
      ctx.translate(data.lanceX, data.lanceY);
      ctx.rotate(ang);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(28, 0);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(36, 0);
      ctx.lineTo(18, -8);
      ctx.lineTo(18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Emerald Nuclear Mushroom Blast Dome!
    if (data.nukeFlash > 0) {
      const a = Math.max(0, Math.min(1, data.nukeFlash / 1.35));
      ctx.save();
      ctx.globalAlpha = a * 0.82;
      const grad = ctx.createRadialGradient(
        data.nukeX,
        data.nukeY,
        12,
        data.nukeX,
        data.nukeY,
        235,
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#34d399');
      grad.addColorStop(0.75, '#059669');
      grad.addColorStop(1, 'rgba(6, 78, 59, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.nukeX, data.nukeY, 235 * (1.1 - a * 0.25), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
