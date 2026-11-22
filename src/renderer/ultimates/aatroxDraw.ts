import type { AatroxUltimateData } from '../../physics/ultimates/aatrox';
import type { UltimateRenderer } from './types';

export const aatroxUltimateRenderer: UltimateRenderer = {
  characterId: 'aatrox',

  drawBackdrop(ctx, state, bounds, fighters) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Demonic crimson World Ender wings silhouette behind Aatrox
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.72);
      ctx.translate(owner.x, owner.y);
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(side * 95, -55);
        ctx.lineTo(side * 72, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as AatroxUltimateData;
    if (data.slamFlash <= 0) return;

    const a = Math.min(1, data.slamFlash / 0.65);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.slamX, data.slamY);
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = 'rgba(220, 38, 38, 0.28)';
    ctx.lineWidth = 6 * a;
    ctx.beginPath();
    ctx.arc(0, 0, 125, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};
