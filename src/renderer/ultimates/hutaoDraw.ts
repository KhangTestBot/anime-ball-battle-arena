import type { HuTaoUltimateData } from '../../physics/ultimates/hutao';
import type { UltimateRenderer } from './types';

export const hutaoUltimateRenderer: UltimateRenderer = {
  characterId: 'hutao',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Orbiting Crimson Butterflies around Hu Tao
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.fillStyle = '#f97316';
      for (let i = 0; i < 6; i++) {
        const ang = t * 5 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(owner.x + Math.cos(ang) * 42, owner.y + Math.sin(ang) * 42, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as HuTaoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
