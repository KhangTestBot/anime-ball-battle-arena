import type { ShanksUltimateData } from '../../physics/ultimates/shanks';
import type { UltimateRenderer } from './types';

function drawZigzagBolt(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
  seed: number,
): void {
  const segs = 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const p = i / segs;
    const jitter = Math.sin(t * 38 + i * 3.1 + seed) * 14 * (1 - Math.abs(p - 0.5));
    ctx.lineTo(x1 + dx * p + nx * jitter, y1 + dy * p + ny * jitter);
  }
  ctx.lineTo(x2, y2);
}

export const shanksUltimateRenderer: UltimateRenderer = {
  characterId: 'shanks',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ShanksUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner) return;

    // Expanding Crimson-Black Haoshoku Haki Wave Dome!
    if (data.hakiPulseAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = data.hakiPulseAlpha * 0.72;
      const grad = ctx.createRadialGradient(
        owner.x,
        owner.y,
        Math.max(1, data.hakiPulseRadius * 0.3),
        owner.x,
        owner.y,
        data.hakiPulseRadius,
      );
      grad.addColorStop(0, 'rgba(127, 29, 29, 0.02)');
      grad.addColorStop(0.7, 'rgba(153, 27, 27, 0.25)');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0.65)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, data.hakiPulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Radiating black-red Conqueror Haki arcs
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8 + t * 2.2;
        const rIn = data.hakiPulseRadius * 0.45;
        const rOut = data.hakiPulseRadius * 1.05;
        ctx.strokeStyle = i % 2 === 0 ? '#09090b' : '#ef4444';
        ctx.lineWidth = 2.6;
        drawZigzagBolt(
          ctx,
          owner.x + Math.cos(ang) * rIn,
          owner.y + Math.sin(ang) * rIn,
          owner.x + Math.cos(ang) * rOut,
          owner.y + Math.sin(ang) * rOut,
          t,
          i,
        );
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ShanksUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    // 1. Wi-Fi Conqueror Haki Pin Tether between Shanks and locked target
    if (owner && data.wifiPinTimer > 0 && data.wifiTargetUid) {
      const target = fighters.find((f) => f.uid === data.wifiTargetUid && f.alive);
      if (target) {
        ctx.save();
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 6;
        drawZigzagBolt(ctx, owner.x, owner.y, target.x, target.y, t, 11);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.6;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 14;
        drawZigzagBolt(ctx, owner.x, owner.y, target.x, target.y, t, 11);
        ctx.stroke();

        // Eye-seal reticle over pinned enemy (Observation Killer)
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(target.x - 10, target.y - 10);
        ctx.lineTo(target.x + 10, target.y + 10);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Single-arm Gryphon Sabre Aura beside Shanks
    if (owner && owner.alive) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(owner.facingAngle);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(owner.radius * 0.4, 8);
      ctx.quadraticCurveTo(owner.radius + 18, 4, owner.radius + 26, -12);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Flying Kamusari Red-Black Crescent Slashes
    for (const arc of data.kamusariArcs) {
      const a = Math.max(0, Math.min(1, arc.life / 1.4));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(arc.x, arc.y);
      ctx.rotate(arc.angle);

      // Black Conqueror's core crescent
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, arc.radius, -Math.PI * 0.48, Math.PI * 0.48);
      ctx.arc(-15, 0, arc.radius * 0.86, Math.PI * 0.42, -Math.PI * 0.42, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner bright scarlet edge
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, arc.radius - 2, -Math.PI * 0.36, Math.PI * 0.36);
      ctx.stroke();
      ctx.restore();
    }
  },
};
