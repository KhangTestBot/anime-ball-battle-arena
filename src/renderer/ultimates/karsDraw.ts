import type { KarsUltimateData } from '../../physics/ultimates/kars';
import type { UltimateRenderer } from './types';

export const karsUltimateRenderer: UltimateRenderer = {
  characterId: 'kars',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Ultimate Lifeform golden rainbow solar rays!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6 + t * 1.2;
        ctx.strokeStyle = i % 2 === 0 ? '#facc15' : '#a855f7';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 32, owner.y + Math.sin(ang) * 32);
        ctx.lineTo(owner.x + Math.cos(ang) * 145, owner.y + Math.sin(ang) * 145);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KarsUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 21 * a;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
