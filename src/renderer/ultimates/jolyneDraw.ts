import type { JolyneUltimateData } from '../../physics/ultimates/jolyne';
import type { UltimateRenderer } from './types';

export const jolyneUltimateRenderer: UltimateRenderer = {
  characterId: 'jolyne',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Stone Free Mobius Strip figure-8 string loop around Jolyne!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const u = (i / 40) * Math.PI * 2 + t * 2.4;
        const px = owner.x + Math.sin(u) * 85;
        const py = owner.y + Math.sin(u * 2) * 42;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JolyneUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
