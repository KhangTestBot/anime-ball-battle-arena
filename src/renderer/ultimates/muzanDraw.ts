import type { MuzanUltimateData } from '../../physics/ultimates/muzan';
import type { UltimateRenderer } from './types';

export const muzanUltimateRenderer: UltimateRenderer = {
  characterId: 'muzan',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crimson Demon King Blood-Pool Halo beneath Muzan
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(127, 29, 29, 0.42)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as MuzanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 9 Sinuous Bone-Tipped Black Blood Spine Whips lashing out around Muzan!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    for (let i = 0; i < 9; i++) {
      const a = data.whipAngle + (i * Math.PI * 2) / 9;
      const midA = a + Math.sin(t * 9 + i) * 0.25;
      const tipX = Math.cos(a) * data.whipRadius;
      const tipY = Math.sin(a) * data.whipRadius;

      ctx.strokeStyle = i % 2 === 0 ? '#dc2626' : '#09090b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(midA) * (data.whipRadius * 0.55),
        Math.sin(midA) * (data.whipRadius * 0.55),
        tipX,
        tipY,
      );
      ctx.stroke();

      // Bone-white fang tip on every biowhip
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};
