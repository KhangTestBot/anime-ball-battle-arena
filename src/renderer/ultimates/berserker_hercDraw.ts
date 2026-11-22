import type { BerserkerHercUltimateData } from '../../physics/ultimates/berserker_herc';
import type { UltimateRenderer } from './types';

export const berserkerHercUltimateRenderer: UltimateRenderer = {
  characterId: 'berserker_herc',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#290808';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // God Hand 12 glowing crimson labor-stars orbiting Heracles!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6 + t * 1.4;
        const px = owner.x + Math.cos(ang) * 86;
        const py = owner.y + Math.sin(ang) * 86;
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#a8a29e';
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BerserkerHercUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#78716c';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 275, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
