import type { TokoyamiUltimateData } from '../../physics/ultimates/tokoyami';
import type { UltimateRenderer } from './types';

export const tokoyamiUltimateRenderer: UltimateRenderer = {
  characterId: 'tokoyami',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.42);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Towering Dark Shadow Ragnarok abyssal aura & glowing golden eyes!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#7e22ce';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 36 + Math.sin(t * 6) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Twin piercing golden Dark Shadow eyes above Tokoyami
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(owner.x - 16, owner.y - owner.radius - 26, 8, 4, -0.25, 0, Math.PI * 2);
      ctx.ellipse(owner.x + 16, owner.y - owner.radius - 26, 8, 4, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as TokoyamiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#7e22ce';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
