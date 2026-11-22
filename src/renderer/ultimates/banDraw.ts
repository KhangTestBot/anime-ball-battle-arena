import type { BanUltimateData } from '../../physics/ultimates/ban';
import type { UltimateRenderer } from './types';

export const banUltimateRenderer: UltimateRenderer = {
  characterId: 'ban',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Golden-Emerald Fountain of Youth Immortality mist around Ban
    ctx.save();
    const grad = ctx.createRadialGradient(
      owner.x,
      owner.y,
      owner.radius * 0.4,
      owner.x,
      owner.y,
      owner.radius + 54,
    );
    grad.addColorStop(0, 'rgba(74, 222, 128, 0.12)');
    grad.addColorStop(0.65, 'rgba(239, 68, 68, 0.2)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as BanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Glowing Ruby Snatched Power/Heart Orbs rushing into Ban!
    for (const orb of data.stealOrbs) {
      const a = Math.max(0, Math.min(1, orb.life / 0.7));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#f87171';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. 4-Section Golden-Crimson Courechouse Nunchaku Whip sweeping around Ban!
    if (owner) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.6;
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      let px = owner.x;
      let py = owner.y;
      ctx.moveTo(px, py);
      for (let seg = 1; seg <= 4; seg++) {
        const ang = data.whipAngle + seg * 0.42;
        px = owner.x + Math.cos(ang) * (owner.radius + seg * 28);
        py = owner.y + Math.sin(ang) * (owner.radius + seg * 28);
        ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Golden joint nodes along the 4-section staff
      ctx.fillStyle = '#fbbf24';
      for (let seg = 1; seg <= 4; seg++) {
        const ang = data.whipAngle + seg * 0.42;
        const jx = owner.x + Math.cos(ang) * (owner.radius + seg * 28);
        const jy = owner.y + Math.sin(ang) * (owner.radius + seg * 28);
        ctx.beginPath();
        ctx.arc(jx, jy, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
};
