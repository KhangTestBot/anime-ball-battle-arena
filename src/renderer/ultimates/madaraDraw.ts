import type { MadaraUltimateData } from '../../physics/ultimates/madara';
import type { UltimateRenderer } from './types';

export const madaraUltimateRenderer: UltimateRenderer = {
  characterId: 'madara',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MadaraUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Massive Darkening Meteor Eclipse Shadow over Half the Arena during Shadow phases!
    if (data.stage === 'shadow-1' || data.stage === 'shadow-2') {
      const total = data.stage === 'shadow-1' ? 0.85 : 0.8;
      const prog = Math.max(0.15, Math.min(1, 1 - data.timer / total));
      const maxR = data.stage === 'shadow-1' ? 140 : 190;
      ctx.save();
      ctx.translate(data.impactX, data.impactY);
      ctx.fillStyle = `rgba(9, 9, 11, ${0.26 + prog * 0.44})`;
      ctx.beginPath();
      ctx.arc(0, 0, maxR * prog, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = data.stage === 'shadow-2' ? '#dc2626' : '#f97316';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, maxR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 2. Invisible-Dimension Violet Dashed-Silhouette LIMBO Clone orbiting Madara!
    if (owner) {
      const lx = owner.x + Math.cos(data.limboAngle) * (owner.radius + 30);
      const ly = owner.y + Math.sin(data.limboAngle) * (owner.radius + 30);
      ctx.save();
      ctx.translate(lx, ly);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.72)';
      ctx.fillStyle = 'rgba(88, 28, 135, 0.22)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as MadaraUltimateData;

    // 1. Two-Layer Dust & Magma Impact Ring on Shatter!
    if (data.stage === 'shattered' && data.shatterFlash > 0) {
      const a = Math.max(0, Math.min(1, data.shatterFlash / 0.75));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(data.impactX, data.impactY);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 8 * a;
      ctx.beginPath();
      ctx.arc(0, 0, 175 * (1.2 - a * 0.35), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 4 * a;
      ctx.beginPath();
      ctx.arc(0, 0, 120 * (1.2 - a * 0.35), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. 12 Blazing Meteor Shrapnel Shards bursting 360° from Shattered Rock!
    for (const sh of data.shards) {
      const ang = Math.atan2(sh.vy, sh.vx);
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(ang);
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-9, -6);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-9, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
