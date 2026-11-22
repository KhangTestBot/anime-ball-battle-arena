import type { WhitebeardUltimateData } from '../../physics/ultimates/whitebeard';
import type { UltimateRenderer } from './types';

export const whitebeardUltimateRenderer: UltimateRenderer = {
  characterId: 'whitebeard',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as WhitebeardUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.5);

    // Spider-webbed White-Cyan Air Crack Fissures (Gura Gura no Mi shattered space!)
    ctx.save();
    ctx.globalAlpha = fade * 0.85;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    for (const c of data.cracks) {
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo((c.x1 + c.x2) * 0.5, (c.y1 + c.y2) * 0.5);
      ctx.lineTo(c.branchX, c.branchY);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as WhitebeardUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Twin Gura Gura Quake Bubble Spheres around Whitebeard's fists
    ctx.save();
    for (const side of [-1, 1]) {
      const a = owner.facingAngle + side * 0.72;
      const hx = owner.x + Math.cos(a) * (owner.radius + 8);
      const hy = owner.y + Math.sin(a) * (owner.radius + 8);
      const grad = ctx.createRadialGradient(hx, hy, 2, hx, hy, 18);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.65, 'rgba(125, 211, 252, 0.45)');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(hx, hy, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(hx, hy, 13 + Math.sin(t * 22 + side) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Seismic tilt ripple ring on impact
    if (data.shakeFlash > 0) {
      const a = Math.max(0, Math.min(1, data.shakeFlash));
      ctx.globalAlpha = a * 0.7;
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 7 * a;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + (1 - a) * 210, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};
