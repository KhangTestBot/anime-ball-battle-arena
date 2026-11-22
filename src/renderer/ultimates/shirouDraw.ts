import type { ShirouUltimateData } from '../../physics/ultimates/shirou';
import type { UltimateRenderer } from './types';

export const shirouUltimateRenderer: UltimateRenderer = {
  characterId: 'shirou',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Tracing cyan magic circuit arcs & glowing golden-orange gears!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 2.4;
        ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 32, owner.y + Math.sin(ang) * 32);
        ctx.lineTo(owner.x + Math.cos(ang) * 96, owner.y + Math.sin(ang) * 96);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ShirouUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
