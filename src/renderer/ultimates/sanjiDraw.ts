import type { SanjiUltimateData } from '../../physics/ultimates/sanji';
import type { UltimateRenderer } from './types';

export const sanjiUltimateRenderer: UltimateRenderer = {
  characterId: 'sanji',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as SanjiUltimateData;

    // White-Cobalt Blue Ifrit Jambe Plasma Ember Trail
    for (const pt of data.trailPoints) {
      const a = Math.max(0, Math.min(1, pt.life / 0.65));
      ctx.save();
      ctx.globalAlpha = a * 0.75;
      const grad = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, 14);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#60a5fa');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as SanjiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Mid-air Geometric Sky Walk Sonic Kick Rings!
    for (const ring of data.rings) {
      const a = Math.max(0, Math.min(1, ring.life / 0.75));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(ring.x, ring.y, 26 * (1.3 - a * 0.4), 10 * (1.3 - a * 0.4), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. White-Hot Cobalt Plasma Aura + Electric Sparks around Sanji's legs!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 16;
      for (let i = 0; i < 4; i++) {
        const a = t * 13 + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, owner.radius + 9, a, a + 0.9);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
