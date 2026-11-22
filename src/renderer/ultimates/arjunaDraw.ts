import type { ArjunaUltimateData } from '../../physics/ultimates/arjuna';
import type { UltimateRenderer } from './types';

export const arjunaUltimateRenderer: UltimateRenderer = {
  characterId: 'arjuna',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Pashupata celestial mandala ring behind Arjuna!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 96, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 1.6;
        const px = owner.x + Math.cos(ang) * 96;
        const py = owner.y + Math.sin(ang) * 96;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ArjunaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 21 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
