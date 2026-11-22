import type { BrolyUltimateData } from '../../physics/ultimates/broly';
import type { UltimateRenderer } from './types';

export const brolyUltimateRenderer: UltimateRenderer = {
  characterId: 'broly',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Towering Legendary Super Saiyan Emerald Ki Flames & Lightning Spikes
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI * 2) / 14 + t * 4;
      const r = i % 2 === 0 ? owner.radius + 32 : owner.radius + 14;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as BrolyUltimateData;

    // Expanding Omega Blaster Ki Orb that grows as it swallows enemy projectiles!
    if (data.stage === 'omega-blaster') {
      ctx.save();
      ctx.translate(data.omegaX, data.omegaY);
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, data.omegaRadius + 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.55, '#4ade80');
      grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, data.omegaRadius + 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 2.4;
      ctx.rotate(t * 7);
      ctx.strokeRect(
        -data.omegaRadius * 0.6,
        -data.omegaRadius * 0.6,
        data.omegaRadius * 1.2,
        data.omegaRadius * 1.2,
      );
      ctx.restore();
    }

    // Gigantic Roar Shockwave Flash
    if (data.roarFlash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, data.roarFlash * 0.6);
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.arc(data.omegaX, data.omegaY, 65 + (1 - data.roarFlash) * 210, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
