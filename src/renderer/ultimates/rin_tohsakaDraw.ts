import type { RinTohsakaUltimateData } from '../../physics/ultimates/rin_tohsaka';
import type { UltimateRenderer } from './types';

export const rinTohsakaUltimateRenderer: UltimateRenderer = {
  characterId: 'rin_tohsaka',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Orbiting prismatic elemental jewels around Rin!
    if (owner && owner.alive) {
      const colors = ['#ef4444', '#38bdf8', '#22c55e', '#facc15', '#a855f7'];
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5 + t * 2.6;
        const px = owner.x + Math.cos(ang) * 76;
        const py = owner.y + Math.sin(ang) * 76;
        ctx.fillStyle = colors[i];
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
    const data = state.data as unknown as RinTohsakaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
