import type { SkeletonUltimateData } from '../../physics/ultimates/skeleton';
import type { UltimateRenderer } from './types';

export const skeletonUltimateRenderer: UltimateRenderer = {
  characterId: 'skeleton',

  drawBackdrop() {
    // Arrow volleys render cleanly over the stage
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as SkeletonUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    const len = bounds.fullSize * 1.4;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    // Glowing Golden Spectral Arrow Sniper Beam!
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(
      owner.x + Math.cos(data.spectralAngle) * len,
      owner.y + Math.sin(data.spectralAngle) * len,
    );
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(
      owner.x + Math.cos(data.spectralAngle) * len,
      owner.y + Math.sin(data.spectralAngle) * len,
    );
    ctx.stroke();
    ctx.restore();
  },
};
