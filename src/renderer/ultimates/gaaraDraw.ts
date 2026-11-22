import type { GaaraUltimateData } from '../../physics/ultimates/gaara';
import type { UltimateRenderer } from './types';

export const gaaraUltimateRenderer: UltimateRenderer = {
  characterId: 'gaara',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as GaaraUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Quicksand arena whirlpool around Sand Coffin target
    ctx.save();
    const grad = ctx.createRadialGradient(
      data.coffinX,
      data.coffinY,
      12,
      data.coffinX,
      data.coffinY,
      165,
    );
    grad.addColorStop(0, 'rgba(217, 119, 6, 0.42)');
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.16)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(data.coffinX, data.coffinY, 165, 0, Math.PI * 2);
    ctx.fill();

    // Mother's Absolute Sand Shield Dome protecting Gaara
    if (owner) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.72)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 42, t * 2, t * 2 + Math.PI * 1.45);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as GaaraUltimateData;

    // Sand Coffin wrapping target before crush
    if (data.stage === 'sand-coffin') {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(data.coffinX, data.coffinY, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Stepped GRAND SAND MAUSOLEUM PYRAMID!!
    if (data.crushFlash > 0) {
      const a = Math.max(0, Math.min(1, data.crushFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(data.coffinX, data.coffinY);
      ctx.fillStyle = 'rgba(217, 119, 6, 0.58)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;

      for (let tier = 0; tier < 3; tier++) {
        const w = 132 - tier * 34;
        const h = 32;
        const y = 34 - tier * 30;
        ctx.fillRect(-w * 0.5, y - h * 0.5, w, h);
        ctx.strokeRect(-w * 0.5, y - h * 0.5, w, h);
      }
      ctx.restore();
    }
  },
};
