import type { LuckUltimateData } from '../../physics/ultimates/luck';
import type { UltimateRenderer } from './types';

export const luckUltimateRenderer: UltimateRenderer = {
  characterId: 'luck',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.26);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Crackling cyan-gold Thunder Fiend arcs around Luck!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 6.5;
        ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(owner.x + Math.cos(ang + 0.2) * 52, owner.y + Math.sin(ang + 0.2) * 52);
        ctx.lineTo(owner.x + Math.cos(ang) * 95, owner.y + Math.sin(ang) * 95);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LuckUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.4 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
