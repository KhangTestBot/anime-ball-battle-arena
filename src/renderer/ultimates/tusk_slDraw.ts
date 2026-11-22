import type { TuskSlUltimateData } from '../../physics/ultimates/tusk_sl';
import type { UltimateRenderer } from './types';

export const tuskSlUltimateRenderer: UltimateRenderer = {
  characterId: 'tusk_sl',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.24, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Floating Orb of Avarice orbiting Tusk
    if (owner && owner.alive) {
      const ox = owner.x + Math.cos(t * 5) * (owner.radius + 24);
      const oy = owner.y + Math.sin(t * 5) * (owner.radius + 24);
      ctx.globalAlpha = Math.max(0, alpha * 0.95);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(ox, oy, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as TuskSlUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.dragonFlash <= 0 || !owner) return;

    const a = Math.min(1, data.dragonFlash);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.dragonAngle);
    ctx.globalAlpha = a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, -38 * a, bounds.fullSize * 1.4, 76 * a);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, -15 * a, bounds.fullSize * 1.4, 30 * a);
    ctx.restore();
  },
};
