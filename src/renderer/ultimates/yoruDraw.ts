import type { YoruUltimateData } from '../../physics/ultimates/yoru';
import type { UltimateRenderer } from './types';

export const yoruUltimateRenderer: UltimateRenderer = {
  characterId: 'yoru',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Gun & Tank War Devil crimson aura
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 22 + Math.sin(t * 14) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as YoruUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 19 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.45 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
