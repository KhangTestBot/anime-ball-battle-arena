import type { KatakuriUltimateData } from '../../physics/ultimates/katakuri';
import type { UltimateRenderer } from './types';

export const katakuriUltimateRenderer: UltimateRenderer = {
  characterId: 'katakuri',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KatakuriUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Sticky Cream-White Awakened Mochi Floor Puddles slowing enemies
    for (const puddle of data.puddles) {
      ctx.save();
      ctx.fillStyle = 'rgba(248, 250, 252, 0.25)';
      ctx.strokeStyle = 'rgba(192, 38, 211, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(puddle.x, puddle.y, puddle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Kenbunshoku Future Sight Cyan-Rose Eye Ring around Katakuri
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = t * 24;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KatakuriUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Spinning Spiked Armament-Haki ZAN GIRI MOCHI Donut Mace Slam Flash
    if (owner && data.slamFlash > 0) {
      const p = Math.max(0, Math.min(1, data.slamFlash));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(owner.x, owner.y);
      ctx.rotate(t * 16);
      ctx.strokeStyle = '#c026d3';
      ctx.fillStyle = 'rgba(24, 24, 27, 0.65)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(a - 0.14) * (owner.radius + 30),
          Math.sin(a - 0.14) * (owner.radius + 30),
        );
        ctx.lineTo(Math.cos(a) * (owner.radius + 54), Math.sin(a) * (owner.radius + 54));
        ctx.lineTo(
          Math.cos(a + 0.14) * (owner.radius + 30),
          Math.sin(a + 0.14) * (owner.radius + 30),
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  },
};
