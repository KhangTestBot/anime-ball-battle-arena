import type { HawksUltimateData } from '../../physics/ultimates/hawks';
import type { UltimateRenderer } from './types';

export const hawksUltimateRenderer: UltimateRenderer = {
  characterId: 'hawks',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Orbiting crimson Fierce Wings feathers!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI) / 5 + t * 4.2;
        const r = 64 + (i % 2) * 26;
        const fx = owner.x + Math.cos(ang) * r;
        const fy = owner.y + Math.sin(ang) * r;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(ang + Math.PI * 0.5);
        ctx.fillStyle = i % 3 === 0 ? '#facc15' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as HawksUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
