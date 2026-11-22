import type { ZombiemanUltimateData } from '../../physics/ultimates/zombieman';
import type { UltimateRenderer } from './types';

export const zombiemanUltimateRenderer: UltimateRenderer = {
  characterId: 'zombieman',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#3f0713';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Immortal crimson regeneration aura
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.75);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 12 + Math.sin(t * 9) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ZombiemanUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 14 * a;
    ctx.shadowColor = '#94a3b8';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.25 - data.flash) * 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
