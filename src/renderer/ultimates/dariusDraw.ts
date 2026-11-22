import type { DariusUltimateData } from '../../physics/ultimates/darius';
import type { UltimateRenderer } from './types';

export const dariusUltimateRenderer: UltimateRenderer = {
  characterId: 'darius',

  drawBackdrop(ctx, state, bounds, fighters) {
    const data = state.data as unknown as DariusUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spinning crimson Decimate axe ring around Darius
    if (owner && owner.alive && !data.dunked) {
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.spinAngle);
      ctx.globalAlpha = Math.max(0, alpha * 0.72);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 175, 0, Math.PI * 1.45);
      ctx.stroke();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 182, 0, Math.PI * 1.35);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as DariusUltimateData;
    if (data.dunkFlash <= 0) return;

    const a = Math.min(1, data.dunkFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.dunkX, data.dunkY);
    // Noxian Guillotine giant crimson vertical axe-cleave crater
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 14 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, -135);
    ctx.lineTo(0, 135);
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4 * a;
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(0, 120);
    ctx.stroke();
    ctx.restore();
  },
};
