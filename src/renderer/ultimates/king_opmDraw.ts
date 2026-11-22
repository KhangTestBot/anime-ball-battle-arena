import type { KingOpmUltimateData } from '../../physics/ultimates/king_opm';
import type { UltimateRenderer } from './types';

export const kingOpmUltimateRenderer: UltimateRenderer = {
  characterId: 'king_opm',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Pulsing King Engine heartbeat shock rings!
    if (owner && owner.alive) {
      const pulse = (t * 2.5) % 1;
      ctx.globalAlpha = Math.max(0, alpha * (1 - pulse) * 0.9);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + pulse * 180, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KingOpmUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 50 + (1.45 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
