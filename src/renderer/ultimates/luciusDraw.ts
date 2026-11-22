import type { LuciusUltimateData } from '../../physics/ultimates/lucius';
import type { UltimateRenderer } from './types';

export const luciusUltimateRenderer: UltimateRenderer = {
  characterId: 'lucius',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.36);
    ctx.fillStyle = '#291d05';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Paladin Emperor golden halo & twin sacred time-rings!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 104, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + t * 1.6;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 40, owner.y + Math.sin(ang) * 40);
        ctx.lineTo(owner.x + Math.cos(ang) * 140, owner.y + Math.sin(ang) * 140);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as LuciusUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 36;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 280, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
