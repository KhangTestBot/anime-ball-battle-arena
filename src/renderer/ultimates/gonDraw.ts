import type { GonUltimateData } from '../../physics/ultimates/gon';
import type { UltimateRenderer } from './types';

export const gonUltimateRenderer: UltimateRenderer = {
  characterId: 'gon',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Adult Gon Towering Obsidian-Gold Nen Pillar Flame
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(9, 9, 11, 0.5)';
    ctx.fillRect(-owner.radius * 0.85, -owner.radius * 3.8, owner.radius * 1.7, owner.radius * 3.8);

    ctx.strokeStyle = '#facc15';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 22 + Math.sin(t * 14) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as GonUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Blazing Black-Amber JAJANKEN: GUU Fist Aura Burst!
    if (owner && data.guuFlash > 0) {
      const p = Math.max(0, Math.min(1, data.guuFlash / 1.25));
      ctx.save();
      ctx.globalAlpha = p * 0.8;
      const grad = ctx.createRadialGradient(owner.x, owner.y, 10, owner.x, owner.y, 170);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.55, '#f59e0b');
      grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 170, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
