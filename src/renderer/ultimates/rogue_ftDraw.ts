import type { RogueFtUltimateData } from '../../physics/ultimates/rogue_ft';
import type { UltimateRenderer } from './types';

export const rogueFtUltimateRenderer: UltimateRenderer = {
  characterId: 'rogue_ft',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as RogueFtUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    const len = bounds.fullSize * 1.4;
    const x2 = owner.x + Math.cos(data.roarAngle) * len;
    const y2 = owner.y + Math.sin(data.roarAngle) * len;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 56 * a;
    ctx.shadowColor = '#7c3aed';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 20 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
};
