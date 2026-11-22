import type { SonicUltimateData } from '../../physics/ultimates/sonic';
import type { UltimateRenderer } from './types';

const EMERALD_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#facc15', // Yellow
  '#22c55e', // Green
  '#22d3ee', // Cyan
  '#f8fafc', // White
  '#a855f7', // Purple
];

export const sonicUltimateRenderer: UltimateRenderer = {
  characterId: 'sonic',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as SonicUltimateData;

    // Physical Golden Sonic Rings bouncing across the arena floor!
    for (const ring of data.rings) {
      const spinX = Math.max(0.28, Math.abs(Math.cos(t * 10 + ring.x * 0.1)));
      ctx.save();
      ctx.translate(ring.x, ring.y);
      ctx.scale(spinX, 1);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-1, -1, 5.8, -Math.PI * 0.8, 0);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as SonicUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 1. 7 Cut-Diamond Chaos Emeralds spiraling into Sonic!
    if (data.emeraldsRadius > 2) {
      for (let i = 0; i < 7; i++) {
        const a = data.emeraldsAngle + (i * Math.PI * 2) / 7;
        const ex = owner.x + Math.cos(a) * data.emeraldsRadius;
        const ey = owner.y + Math.sin(a) * data.emeraldsRadius;
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = EMERALD_COLORS[i];
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = EMERALD_COLORS[i];
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(6, -2);
        ctx.lineTo(4, 7);
        ctx.lineTo(-4, 7);
        ctx.lineTo(-6, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Supersonic Mach Boom Cone streaming around Super Sonic Pinball!
    if (data.bouncesLeft > 0) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.machAngle);
      const coneGrad = ctx.createLinearGradient(owner.radius + 16, 0, -owner.radius * 2.8, 0);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.88)');
      coneGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.35)');
      coneGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(owner.radius + 18, 0);
      ctx.lineTo(-owner.radius * 2.6, -owner.radius * 1.45);
      ctx.lineTo(-owner.radius * 1.9, 0);
      ctx.lineTo(-owner.radius * 2.6, owner.radius * 1.45);
      ctx.closePath();
      ctx.fill();

      // Remaining bounces counter badge above Sonic
      ctx.rotate(-data.machAngle);
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.6;
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText(`⚡x${data.bouncesLeft}`, 0, -owner.radius - 16);
      ctx.fillText(`⚡x${data.bouncesLeft}`, 0, -owner.radius - 16);
      ctx.restore();
    }
  },
};
