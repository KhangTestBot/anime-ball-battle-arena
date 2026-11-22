import type { PitouUltimateData } from '../../physics/ultimates/pitou';
import type { UltimateRenderer } from './types';

export const pitouUltimateRenderer: UltimateRenderer = {
  characterId: 'pitou',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#500724';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Terpsichora puppeteer strings descending onto Pitou!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      for (const ox of [-18, 0, 18]) {
        ctx.beginPath();
        ctx.moveTo(owner.x + ox, 0);
        ctx.lineTo(owner.x + ox + Math.sin(t * 9) * 3, owner.y - owner.radius);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as PitouUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
