import type { KiraUltimateData } from '../../physics/ultimates/kira';
import type { UltimateRenderer } from './types';

export const kiraUltimateRenderer: UltimateRenderer = {
  characterId: 'kira',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Bites the Dust reverse-spinning golden clock face behind Kira!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 82, 0, Math.PI * 2);
      ctx.stroke();

      // Reverse clock hands
      const hAng = -t * 2.5;
      const mAng = -t * 9.0;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(owner.x + Math.cos(hAng) * 52, owner.y + Math.sin(hAng) * 52);
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(owner.x + Math.cos(mAng) * 72, owner.y + Math.sin(mAng) * 72);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KiraUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
