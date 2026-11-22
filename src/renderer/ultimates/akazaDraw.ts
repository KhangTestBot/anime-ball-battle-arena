import type { AkazaUltimateData } from '../../physics/ultimates/akaza';
import type { UltimateRenderer } from './types';

export const akazaUltimateRenderer: UltimateRenderer = {
  characterId: 'akaza',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as AkazaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Iconic 12-Point Snowflake Compass Needle (Technique Deployment) beneath Akaza!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 0.6);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, data.compassRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, data.compassRadius * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(236, 72, 153, 0.55)';
      ctx.lineWidth = i % 2 === 0 ? 2.4 : 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * data.compassRadius, Math.sin(a) * data.compassRadius);
      ctx.stroke();

      // Snowflake diamond prongs at tips
      const tx = Math.cos(a) * (data.compassRadius * 0.85);
      const ty = Math.sin(a) * (data.compassRadius * 0.85);
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as AkazaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Blue Silver Chaotic Afterglow Starburst Flash
    if (owner && data.afterglowFlash > 0) {
      const p = Math.max(0, Math.min(1, data.afterglowFlash / 1.15));
      ctx.save();
      ctx.globalAlpha = p * 0.75;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 45 + (1 - p) * 185, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
