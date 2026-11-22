import type { TogaUltimateData } from '../../physics/ultimates/toga';
import type { UltimateRenderer } from './types';

export const togaUltimateRenderer: UltimateRenderer = {
  characterId: 'toga',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#4a042e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Sad Man's Parade swirling pink-gold doppelganger rings!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.8);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 2.8;
        const r = 68 + Math.sin(t * 4 + i) * 14;
        const px = owner.x + Math.cos(ang) * r;
        const py = owner.y + Math.sin(ang) * r;
        ctx.fillStyle = i % 2 === 0 ? '#ec4899' : '#facc15';
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as TogaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
