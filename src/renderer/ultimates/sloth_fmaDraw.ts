import type { SlothFmaUltimateData } from '../../physics/ultimates/sloth_fma';
import type { UltimateRenderer } from './types';

export const slothFmaUltimateRenderer: UltimateRenderer = {
  characterId: 'sloth_fma',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20 + Math.sin(t * 16) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as SlothFmaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
