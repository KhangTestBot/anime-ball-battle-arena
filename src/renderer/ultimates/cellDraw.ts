import type { CellUltimateData } from '../../physics/ultimates/cell';
import type { UltimateRenderer } from './types';

export const cellUltimateRenderer: UltimateRenderer = {
  characterId: 'cell',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Perfect Cell Golden Electric Aura & Bio-Hexagon Ring
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = '#facc15';
    ctx.fillStyle = 'rgba(22, 163, 74, 0.28)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 22 + Math.sin(t * 9) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const a = t * 3 + (i * Math.PI) / 3;
      const rx = Math.cos(a) * (owner.radius + 22);
      const ry = Math.sin(a) * (owner.radius + 22);
      ctx.strokeStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + Math.cos(a + 0.5) * 14, ry + Math.sin(a + 0.5) * 14);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as CellUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Solar Kamehameha Blinding Gold-Emerald Flash Wave
    if (owner && data.beamFlash > 0) {
      const p = Math.max(0, Math.min(1, data.beamFlash / 1.15));
      ctx.save();
      ctx.globalAlpha = p * 0.72;
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#16a34a';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 26 + (1 - p) * 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
