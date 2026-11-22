import type { AntaresUltimateData } from '../../physics/ultimates/antares';
import type { UltimateRenderer } from './types';

export const antaresUltimateRenderer: UltimateRenderer = {
  characterId: 'antares',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.26, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Monarch of Destruction crimson dragon aura
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 22 + Math.sin(t * 12) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as AntaresUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.breathFlash <= 0 || !owner) return;

    const a = Math.min(1, data.breathFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.breathAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, -44 * a, bounds.fullSize * 1.4, 88 * a);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -18 * a, bounds.fullSize * 1.4, 36 * a);
    ctx.restore();
  },
};
