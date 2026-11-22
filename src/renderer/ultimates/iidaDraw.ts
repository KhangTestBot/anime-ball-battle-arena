import type { IidaUltimateData } from '../../physics/ultimates/iida';
import type { UltimateRenderer } from './types';

export const iidaUltimateRenderer: UltimateRenderer = {
  characterId: 'iida',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Recipro Turbo blue exhaust rings & supersonic speed streaks!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 7.5;
        ctx.strokeStyle = i % 2 === 0 ? '#3b82f6' : '#e2e8f0';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 28, owner.y + Math.sin(ang) * 28);
        ctx.lineTo(owner.x + Math.cos(ang) * 110, owner.y + Math.sin(ang) * 110);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as IidaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#cbd5e1';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
