import type { GohanUltimateData } from '../../physics/ultimates/gohan';
import type { UltimateRenderer } from './types';

export const gohanUltimateRenderer: UltimateRenderer = {
  characterId: 'gohan',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Silver-Crimson Beast Gohan Jagged Aura + Electric Red Sparks
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.22)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12 + Math.sin(t * 10 + i) * 0.1;
      const r = i % 2 === 0 ? owner.radius + 30 : owner.radius + 14;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as GohanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Two-finger Forehead Twin-Helix Ki Charge
    if (owner && data.stage === 'beast-charge') {
      const fx = owner.x + Math.cos(data.aimAngle) * (owner.radius + 12);
      const fy = owner.y + Math.sin(data.aimAngle) * (owner.radius + 12);
      ctx.save();
      ctx.translate(fx, fy);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 2; i++) {
        const a = t * 14 + i * Math.PI;
        ctx.fillStyle = i === 0 ? '#ef4444' : '#a855f7';
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 14, Math.sin(a) * 14, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Faint aiming line toward target
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(data.aimAngle) * 240, Math.sin(data.aimAngle) * 240);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Piercing Twin-Helix Crimson-White MAKANKOSAPPO Beam Flash!
    if (data.beamFlash > 0) {
      const a = Math.max(0, Math.min(1, data.beamFlash / 1.25));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 26 * a;
      ctx.beginPath();
      ctx.moveTo(data.beamX1, data.beamY1);
      ctx.lineTo(data.beamX2, data.beamY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 9 * a;
      ctx.beginPath();
      ctx.moveTo(data.beamX1, data.beamY1);
      ctx.lineTo(data.beamX2, data.beamY2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
