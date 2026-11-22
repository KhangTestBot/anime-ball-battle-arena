import type { GiyuUltimateData } from '../../physics/ultimates/giyu';
import type { UltimateRenderer } from './types';

export const giyuUltimateRenderer: UltimateRenderer = {
  characterId: 'giyu',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as GiyuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Eleventh Form: Hypnotic Still Deep-Sapphire Mirror Pond + Silver Rain Ripples
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const grad = ctx.createRadialGradient(0, 0, owner.radius * 0.5, 0, 0, data.calmRadius);
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.26)');
    grad.addColorStop(0.75, 'rgba(12, 74, 110, 0.22)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.calmRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, data.calmRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Expanding concentric tranquil mirror ripples
    for (let i = 0; i < 3; i++) {
      const r = (t * 65 + i * 70) % data.calmRadius;
      ctx.globalAlpha = 1 - r / data.calmRadius;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as GiyuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 10th Form Constant Flux Prussian-Blue Water Dragon Surge Wave
    if (owner && data.calmFlash > 0) {
      const p = Math.max(0, Math.min(1, data.calmFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = p * 0.78;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 45 + (1 - p) * 195, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
