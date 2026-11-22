import type { IllumiUltimateData } from '../../physics/ultimates/illumi';
import type { UltimateRenderer } from './types';

export const illumiUltimateRenderer: UltimateRenderer = {
  characterId: 'illumi',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Sinister emerald Zoldyck bloodlust ring
    if (owner && owner.alive) {
      const pulse = (t * 2.4) % 1;
      ctx.globalAlpha = Math.max(0, alpha * (1 - pulse) * 0.85);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + pulse * 185, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as IllumiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
