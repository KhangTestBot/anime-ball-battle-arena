import type { KakashiUltimateData } from '../../physics/ultimates/kakashi';
import type { UltimateRenderer } from './types';

export const kakashiUltimateRenderer: UltimateRenderer = {
  characterId: 'kakashi',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Cyan-Blue Perfect Susanoo Wings flanking Kakashi!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2.4;
    const flap = Math.sin(t * 7) * 5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 12, 0);
      ctx.lineTo(side * 58, -28 + flap);
      ctx.lineTo(side * 66, 8 + flap);
      ctx.lineTo(side * 22, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as KakashiUltimateData;

    // 1. Swirling Mangekyo Kamui Shuriken Dimensional Whirlpools
    for (const v of data.vortices) {
      const a = Math.max(0, Math.min(1, v.life / 1.85));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(v.x, v.y);
      ctx.rotate(t * 14);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, v.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3-blade Kamui Mangekyo spiral prongs
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.2;
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, v.radius * 0.85, ang, ang + 0.9);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Dimensional Phasing Tear Beam: KAMUI RAIKIRI!
    if (data.raikiriFlash > 0) {
      const a = Math.max(0, Math.min(1, data.raikiriFlash / 1.05));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 28 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(data.raikiriX1, data.raikiriY1);
      ctx.lineTo(data.raikiriX2, data.raikiriY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 9 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
