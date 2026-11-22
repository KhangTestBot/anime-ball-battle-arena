import type { RicardoMilosUltimateData } from '../../physics/ultimates/ricardo_milos';
import type { UltimateRenderer } from './types';

export const ricardoMilosUltimateRenderer: UltimateRenderer = {
  characterId: 'ricardo_milos',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    const neonColors = ['#ec4899', '#38bdf8', '#facc15', '#ef4444'];
    const activeColor = neonColors[Math.floor(t * 8) % neonColors.length];

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#1e0629';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Flashing U Got That disco spotlight beams sweeping the arena!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 3.5;
        ctx.strokeStyle = neonColors[i % neonColors.length];
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(owner.x + Math.cos(ang) * 165, owner.y + Math.sin(ang) * 165);
        ctx.stroke();
      }
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as RicardoMilosUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 21 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 270, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
