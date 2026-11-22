import type { JotaroUltimateData } from '../../physics/ultimates/jotaro';
import type { UltimateRenderer } from './types';

export const jotaroUltimateRenderer: UltimateRenderer = {
  characterId: 'jotaro',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as JotaroUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Localized Indigo-Violet "STAR PLATINUM: THE WORLD" negative-hue bubble
    ctx.save();
    ctx.translate(owner.x, owner.y);
    if (data.stage === 'time-stopped') {
      const grad = ctx.createRadialGradient(0, 0, owner.radius, 0, 0, 360);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.24)');
      grad.addColorStop(0.7, 'rgba(30, 27, 75, 0.28)');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 360, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(196, 181, 253, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 8]);
      ctx.lineDashOffset = t * 40;
      ctx.beginPath();
      ctx.arc(0, 0, 350, 0, Math.PI * 2);
      ctx.stroke();

      // Reversed Clock Hands inside Star Platinum range
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(221, 214, 254, 0.5)';
      ctx.lineWidth = 3;
      const handAng = -Math.PI / 2 - data.timeStopLeft * 1.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(handAng) * 72, Math.sin(handAng) * 72);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as JotaroUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Star Platinum Phantom Silhouette & ORA Punch Afterimages around Jotaro
    if (owner) {
      ctx.save();
      const sx = owner.x - Math.cos(owner.facingAngle) * 16;
      const sy = owner.y - Math.sin(owner.facingAngle) * 16;
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#a78bfa';
      ctx.fillStyle = 'rgba(109, 40, 217, 0.35)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(sx, sy, owner.radius + 9 + Math.sin(t * 14) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (data.stage === 'time-stopped') {
        for (let i = 0; i < 4; i++) {
          const a = owner.facingAngle + (i - 1.5) * 0.45 + Math.sin(t * 24 + i) * 0.15;
          const dist = owner.radius + 18 + ((t * 110 + i * 9) % 24);
          ctx.fillStyle = '#ddd6fe';
          ctx.beginPath();
          ctx.arc(owner.x + Math.cos(a) * dist, owner.y + Math.sin(a) * dist, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 2. ORA! Starburst Impact Rings on struck enemies
    for (const imp of data.impacts) {
      const p = Math.max(0, Math.min(1, imp.life / 0.36));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(imp.x, imp.y);
      ctx.rotate(imp.angle);
      ctx.strokeStyle = '#c4b5fd';
      ctx.fillStyle = 'rgba(167, 139, 250, 0.35)';
      ctx.lineWidth = 2.6;
      const r = 18 + (1 - p) * 24;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = i % 2 === 0 ? r : r * 0.45;
        const a = (i * Math.PI) / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
