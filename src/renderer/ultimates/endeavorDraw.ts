import type { EndeavorUltimateData } from '../../physics/ultimates/endeavor';
import type { UltimateRenderer } from './types';

export const endeavorUltimateRenderer: UltimateRenderer = {
  characterId: 'endeavor',

  drawBackdrop(ctx, state, bounds) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as EndeavorUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.beamFlash <= 0 || !owner) return;

    const a = Math.min(1, data.beamFlash);
    const len = bounds.fullSize * 1.4;
    const x2 = owner.x + Math.cos(data.beamAngle) * len;
    const y2 = owner.y + Math.sin(data.beamAngle) * len;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 68 * a;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 34 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
};
