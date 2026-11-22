import type { JosukeUltimateData } from '../../physics/ultimates/josuke';
import type { UltimateRenderer } from './types';

export const josukeUltimateRenderer: UltimateRenderer = {
  characterId: 'josuke',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Crazy Diamond glowing heart-diamond restoration rings!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 2.2;
        const r = 68 + Math.sin(t * 4 + i) * 10;
        const px = owner.x + Math.cos(ang) * r;
        const py = owner.y + Math.sin(ang) * r;
        ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(px, py - 9);
        ctx.lineTo(px + 7, py);
        ctx.lineTo(px, py + 9);
        ctx.lineTo(px - 7, py);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JosukeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.4 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
