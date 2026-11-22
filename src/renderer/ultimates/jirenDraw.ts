import type { JirenUltimateData } from '../../physics/ultimates/jiren';
import type { UltimateRenderer } from './types';

export const jirenUltimateRenderer: UltimateRenderer = {
  characterId: 'jiren',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crimson-Orange Full-Power Overheat Flame Aura + Invisible Eye-Glare Ripples
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const grad = ctx.createRadialGradient(0, 0, owner.radius * 0.4, 0, 0, 135);
    grad.addColorStop(0, 'rgba(220, 38, 38, 0.42)');
    grad.addColorStop(0.65, 'rgba(249, 115, 22, 0.2)');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 135, 0, Math.PI * 2);
    ctx.fill();

    // Expanding Eye-Glare Air Barrier Pulse
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.6)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 14 + ((t * 90) % 90), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as JirenUltimateData;

    // Glowing Crimson-White Power Impact Orb Detonation
    if (data.impactFlash > 0) {
      const p = Math.max(0, Math.min(1, data.impactFlash / 1.2));
      ctx.save();
      ctx.globalAlpha = p * 0.78;
      const rad = 175 * (1.2 - p * 0.35);
      const grad = ctx.createRadialGradient(
        data.impactX,
        data.impactY,
        8,
        data.impactX,
        data.impactY,
        rad,
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#f97316');
      grad.addColorStop(0.85, '#dc2626');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.impactX, data.impactY, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
