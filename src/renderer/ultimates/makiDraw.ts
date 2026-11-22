import type { MakiUltimateData } from '../../physics/ultimates/maki';
import type { UltimateRenderer } from './types';

export const makiUltimateRenderer: UltimateRenderer = {
  characterId: 'maki',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Emerald Awakened Heavenly Restriction Speed Vortex
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 18 + Math.sin(t * 14) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MakiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Sweeping 3-Section Crimson Playful Cloud arc!
    if (owner) {
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      let px = owner.x;
      let py = owner.y;
      ctx.moveTo(px, py);
      for (let seg = 1; seg <= 3; seg++) {
        const ang = data.whipAngle + seg * 0.55;
        px = owner.x + Math.cos(ang) * (owner.radius + seg * 18);
        py = owner.y + Math.sin(ang) * (owner.radius + seg * 18);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Emerald-White Split Soul Katana Soul Cut Streak!
    if (data.soulSlashFlash > 0) {
      const a = Math.max(0, Math.min(1, data.soulSlashFlash / 0.9));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 24 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
