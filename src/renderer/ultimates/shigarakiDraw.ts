import type { ShigarakiUltimateData } from '../../physics/ultimates/shigaraki';
import type { UltimateRenderer } from './types';

export const shigarakiUltimateRenderer: UltimateRenderer = {
  characterId: 'shigaraki',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as ShigarakiUltimateData;

    // Creeping Ash-Grey DECAY Floor Cracks Expanding Outward across the Arena!
    ctx.save();
    ctx.translate(data.decayX, data.decayY);
    const grad = ctx.createRadialGradient(0, 0, 12, 0, 0, data.decayRadius);
    grad.addColorStop(0, 'rgba(71, 85, 105, 0.45)');
    grad.addColorStop(0.75, 'rgba(51, 65, 85, 0.35)');
    grad.addColorStop(1, 'rgba(51, 65, 85, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.decayRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, data.decayRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Spiderweb Floor Fracture Lines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(a + 0.1) * (data.decayRadius * 0.55),
        Math.sin(a + 0.1) * (data.decayRadius * 0.55),
      );
      ctx.lineTo(Math.cos(a - 0.08) * data.decayRadius, Math.sin(a - 0.08) * data.decayRadius);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as ShigarakiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Crimson-Black Rivet Stab Tendrils lashing at targets inside Decay Field!
    if (owner && data.rivetBurstFired) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      for (const f of fighters) {
        if (!f.alive || f.uid === owner.uid) continue;
        if (Math.hypot(f.x - data.decayX, f.y - data.decayY) <= data.decayRadius + 40) {
          ctx.beginPath();
          ctx.moveTo(owner.x, owner.y);
          ctx.lineTo(f.x, f.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  },
};
