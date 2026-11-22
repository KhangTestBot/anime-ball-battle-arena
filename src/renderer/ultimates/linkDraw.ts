import type { LinkUltimateData } from '../../physics/ultimates/link';
import type { UltimateRenderer } from './types';

export const linkUltimateRenderer: UltimateRenderer = {
  characterId: 'link',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Golden Triforce triangle rotating behind Link
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI * 2) / 3 + t * 1.2;
        const r = owner.radius + 26;
        const px = owner.x + Math.cos(ang) * r;
        const py = owner.y + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LinkUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
