import type { PikachuUltimateData } from '../../physics/ultimates/pikachu';
import type { UltimateRenderer } from './types';

export const pikachuUltimateRenderer: UltimateRenderer = {
  characterId: 'pikachu',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as PikachuUltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.3);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(data.webX, data.webY);

    // Glowing Golden Electroweb Hexagonal Spider-Net in the center of the arena!
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 14;

    // 8 radial web spokes
    ctx.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.sin(t * 4) * 0.02;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * data.webRadius, Math.sin(a) * data.webRadius);
      ctx.stroke();
    }

    // 3 concentric hexagonal electric web rings
    for (const ringFrac of [0.35, 0.68, 1.0]) {
      const rr = data.webRadius * ringFrac;
      ctx.lineWidth = ringFrac === 1.0 ? 2.6 : 1.6;
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) {
        const a = (k * Math.PI) / 4;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as PikachuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Ash Ketchum Red-White Cap + Spinning Golden Pikashunium Z-Crystal above Pikachu!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // Iconic Ash Cap sitting on Pikachu's head
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -owner.radius * 0.55, owner.radius * 0.62, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        -owner.radius * 0.35,
        -owner.radius * 0.92,
        owner.radius * 0.7,
        owner.radius * 0.34,
      );
      // Cap visor brim
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-owner.radius * 0.72, -owner.radius * 0.6, owner.radius * 1.44, 5);

      // Spinning Golden Pikashunium Z-Crystal Diamond hovering above!
      ctx.save();
      ctx.translate(0, -owner.radius - 20 + Math.sin(t * 9) * 3);
      ctx.rotate(Math.sin(t * 5) * 0.25);
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 11);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#09090b';
      ctx.font = '900 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Z', 0, 0.5);
      ctx.restore();

      ctx.restore();
    }

    // 2. 7 Vivid Curved Bezier Rainbow Thunderbolts crackling toward targets!
    for (const b of data.bolts) {
      const alpha = b.struck ? Math.max(0, b.fadeTimer / 0.34) : 1;
      const maxT = Math.min(1, b.progress);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 18;

      // Sample jagged points along the quadratic Bezier curve from 0 -> maxT
      const steps = 10;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const u = (s / steps) * maxT;
        const inv = 1 - u;
        let px = inv * inv * b.startX + 2 * inv * u * b.ctrlX + u * u * b.endX;
        let py = inv * inv * b.startY + 2 * inv * u * b.ctrlY + u * u * b.endY;
        if (s > 0 && s < steps) {
          const jit = Math.sin(t * 75 + s * 13 + b.ctrlX) * 7;
          px += jit;
          py -= jit;
        }
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 7.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.restore();
    }
  },
};
