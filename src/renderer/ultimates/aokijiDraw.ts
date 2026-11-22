import type { AokijiUltimateData } from '../../physics/ultimates/aokiji';
import type { UltimateRenderer } from './types';

export const aokijiUltimateRenderer: UltimateRenderer = {
  characterId: 'aokiji',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as AokijiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // ICE AGE: Arctic Translucent Frost Sheet & Hexagonal Ice Crystal Lattice
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const grad = ctx.createRadialGradient(0, 0, owner.radius, 0, 0, data.iceFloorRadius);
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.34)');
    grad.addColorStop(0.75, 'rgba(56, 189, 248, 0.2)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.iceFloorRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(a) * (data.iceFloorRadius * 0.85),
        Math.sin(a) * (data.iceFloorRadius * 0.85),
      );
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as AokijiUltimateData;

    // Soaring Sapphire-White Ice Bird Silhouette (Pheasant Beak!)
    if (data.pheasantFired) {
      const ang = Math.atan2(data.pheasantVy, data.pheasantVx);
      ctx.save();
      ctx.translate(data.pheasantX, data.pheasantY);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.lineTo(-14, -22);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-14, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
