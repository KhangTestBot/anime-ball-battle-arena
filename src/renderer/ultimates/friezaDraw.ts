import type { FriezaUltimateData } from '../../physics/ultimates/frieza';
import type { UltimateRenderer } from './types';

export const friezaUltimateRenderer: UltimateRenderer = {
  characterId: 'frieza',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Black Frieza Dark-Violet Metallic Ki Ring
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = '#a855f7';
    ctx.fillStyle = 'rgba(9, 9, 11, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 16 + Math.sin(t * 10) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as FriezaUltimateData;

    // 1. Charging Crimson-Black Supernova Sun Overhead
    if (data.stage === 'saucers-charge') {
      ctx.save();
      ctx.translate(data.sunX, data.sunY);
      const grad = ctx.createRadialGradient(0, 0, data.sunRadius * 0.2, 0, 0, data.sunRadius);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f97316');
      grad.addColorStop(0.85, '#dc2626');
      grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, 0, data.sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Crackle lightning arcs around Supernova
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = t * 6 + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, data.sunRadius + 6, a, a + 0.65);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Supernova Planetary Detonation Dome
    if (data.nukeFlash > 0) {
      const a = Math.max(0, Math.min(1, data.nukeFlash / 1.25));
      ctx.save();
      ctx.globalAlpha = a * 0.72;
      const rad = 185 * (1.2 - a * 0.35);
      const grad = ctx.createRadialGradient(data.sunX, data.sunY, 12, data.sunX, data.sunY, rad);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#facc15');
      grad.addColorStop(0.75, '#dc2626');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.sunX, data.sunY, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
