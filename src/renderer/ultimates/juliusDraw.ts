import type { JuliusUltimateData } from '../../physics/ultimates/julius';
import type { UltimateRenderer } from './types';

export const juliusUltimateRenderer: UltimateRenderer = {
  characterId: 'julius',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Chrono Anastasis giant golden-cyan clockwork ring!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 96, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(owner.x + Math.cos(t * 2) * 65, owner.y + Math.sin(t * 2) * 65);
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(owner.x + Math.cos(-t * 5) * 86, owner.y + Math.sin(-t * 5) * 86);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JuliusUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 21 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
