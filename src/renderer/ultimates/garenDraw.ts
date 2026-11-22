import type { GarenUltimateData } from '../../physics/ultimates/garen';
import type { UltimateRenderer } from './types';

export const garenUltimateRenderer: UltimateRenderer = {
  characterId: 'garen',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as GarenUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive || data.justiceDropped) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.78);
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.spinAngle);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 155, 0, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as GarenUltimateData;
    if (data.justiceFlash <= 0) return;

    const a = Math.min(1, data.justiceFlash);
    ctx.save();
    ctx.globalAlpha = a;
    // Giant Golden Demacian Justice Sky-Sword descending straight onto target!
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.fillRect(data.justiceX - 18, bounds.top, 36, data.justiceY - bounds.top + 30);
    ctx.strokeRect(data.justiceX - 18, bounds.top, 36, data.justiceY - bounds.top + 30);
    // Golden crossguard near top
    ctx.fillRect(data.justiceX - 52, data.justiceY - 120, 104, 16);
    ctx.strokeRect(data.justiceX - 52, data.justiceY - 120, 104, 16);
    ctx.restore();
  },
};
