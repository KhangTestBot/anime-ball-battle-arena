import type { ToshiroUltimateData } from '../../physics/ultimates/toshiro';
import type { UltimateRenderer } from './types';

export const toshiroUltimateRenderer: UltimateRenderer = {
  characterId: 'toshiro',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ToshiroUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crystalline Winged Ice Dragon Aura + Rotating Overhead 4-Petal Ice Flower!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(45, 212, 191, 0.25)';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2.4;

    // Ice Wings flanking Toshiro
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 10, 0);
      ctx.lineTo(side * 58, -32);
      ctx.lineTo(side * 52, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Remaining Ice Lotus Petals Overhead
    for (let i = 0; i < data.petalsLeft; i++) {
      const a = t * 2.5 + (i * Math.PI) / 2;
      ctx.fillStyle = '#ccfbf1';
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 18, -owner.radius - 20 + Math.sin(a) * 6, 8, 4, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as ToshiroUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Shikai Hyoketsu Four-Second Crystal Ice Freeze Lattice
    if (owner && data.crystalFlash > 0) {
      const p = Math.max(0, Math.min(1, data.crystalFlash / 1.25));
      ctx.save();
      ctx.globalAlpha = p * 0.72;
      ctx.strokeStyle = '#99f6e4';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 45 + (1 - p) * 200, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
