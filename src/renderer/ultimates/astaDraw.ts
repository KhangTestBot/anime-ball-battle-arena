import type { AstaUltimateData } from '../../physics/ultimates/asta';
import type { UltimateRenderer } from './types';

export const astaUltimateRenderer: UltimateRenderer = {
  characterId: 'asta',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as AstaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Expanding Crimson-Black Anti-Magic Domain Shatter Ring!
    if (data.breakWaveAlpha > 0 && owner) {
      ctx.save();
      ctx.globalAlpha = data.breakWaveAlpha;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 14;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, data.breakWaveRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, data.breakWaveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Devil Union Twin Liebe Black-Crimson Wings & Open 5-Leaf Grimoire behind Asta!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // Hovering Open 5-Leaf Black Clover Grimoire above left shoulder
      ctx.save();
      ctx.translate(-owner.radius - 12, -owner.radius + Math.sin(t * 6) * 3);
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(-10, -7, 20, 14);
      ctx.strokeRect(-10, -7, 20, 14);
      ctx.restore();

      // Twin jagged Devil Union Wings
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * (owner.radius * 0.4), 0);
        ctx.lineTo(side * (owner.radius + 36), -26 + Math.sin(t * 9) * 4);
        ctx.lineTo(side * (owner.radius + 26), 6);
        ctx.lineTo(side * (owner.radius + 40), 22);
        ctx.lineTo(side * (owner.radius * 0.5), 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as AstaUltimateData;

    // Anti-Magic Ink Black & Crimson Infinite Equinox Cross Slashes!
    for (const s of data.slashes) {
      const a = Math.max(0, Math.min(1, s.life / 0.6));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(s.x, s.y);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 11 * a;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(-s.size, -s.size);
      ctx.lineTo(s.size, s.size);
      ctx.moveTo(s.size, -s.size);
      ctx.lineTo(-s.size, s.size);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
