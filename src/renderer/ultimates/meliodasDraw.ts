import type { MeliodasUltimateData } from '../../physics/ultimates/meliodas';
import type { UltimateRenderer } from './types';

export const meliodasUltimateRenderer: UltimateRenderer = {
  characterId: 'meliodas',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as MeliodasUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    ctx.save();
    if (data.stage === 'full-counter') {
      // Golden Full Counter Ring Shield around Meliodas
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 46, t * 4, t * 4 + Math.PI * 1.75);
      ctx.stroke();
    } else {
      // Assault Mode Purgatory Abyssal Vortex
      const grad = ctx.createRadialGradient(
        owner.x,
        owner.y,
        owner.radius * 0.4,
        owner.x,
        owner.y,
        owner.radius + 90,
      );
      grad.addColorStop(0, 'rgba(88, 28, 135, 0.55)');
      grad.addColorStop(0.65, 'rgba(126, 34, 206, 0.25)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 90, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as MeliodasUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Orbiting Lostvayne Shadow Clones
    for (const clone of data.clones) {
      ctx.save();
      ctx.translate(clone.x, clone.y);
      ctx.fillStyle = 'rgba(126, 34, 206, 0.72)';
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lostvayne curved green-gold blade silhouette
      ctx.rotate(clone.angle + Math.PI / 2);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(22, -6, 26, 6);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Assault Demon Mark + Dragon Blade Lostvayne + Full Counter starburst
    if (owner) {
      ctx.save();
      // Winged Demon Crest hovering above Meliodas
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y - owner.radius - 10, 8, Math.PI * 0.2, Math.PI * 0.8);
      ctx.moveTo(owner.x - 10, owner.y - owner.radius - 14);
      ctx.lineTo(owner.x - 3, owner.y - owner.radius - 8);
      ctx.lineTo(owner.x + 10, owner.y - owner.radius - 14);
      ctx.stroke();

      if (data.counterFlash > 0) {
        const a = Math.max(0, Math.min(1, data.counterFlash / 0.45));
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + 54, t * 6, t * 6 + Math.PI * 1.4);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
