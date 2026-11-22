import type { PiccoloUltimateData } from '../../physics/ultimates/piccolo';
import type { UltimateRenderer } from './types';

export const piccoloUltimateRenderer: UltimateRenderer = {
  characterId: 'piccolo',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Orange Piccolo blazing aura
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20 + Math.sin(t * 14) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as PiccoloUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.sbcFlash <= 0 || !owner) return;

    const a = Math.min(1, data.sbcFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.sbcAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, -28 * a, bounds.fullSize * 1.4, 56 * a);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -10 * a, bounds.fullSize * 1.4, 20 * a);
    ctx.restore();
  },
};
