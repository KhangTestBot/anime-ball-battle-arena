import type { LichtUltimateData } from '../../physics/ultimates/licht';
import type { UltimateRenderer } from './types';

export const lichtUltimateRenderer: UltimateRenderer = {
  characterId: 'licht',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Conquering Eon radiant golden elf-light swords converging!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + t * 1.4;
        ctx.strokeStyle = i % 2 === 0 ? '#fde047' : '#f8fafc';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 38, owner.y + Math.sin(ang) * 38);
        ctx.lineTo(owner.x + Math.cos(ang) * 135, owner.y + Math.sin(ang) * 135);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LichtUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 20 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 265, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
