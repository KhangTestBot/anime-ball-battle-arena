import type { JalterUltimateData } from '../../physics/ultimates/jalter';
import type { UltimateRenderer } from './types';

export const jalterUltimateRenderer: UltimateRenderer = {
  characterId: 'jalter',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.38);
    ctx.fillStyle = '#27051b';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // La Grondement du Haine cursed purple-crimson dragon flame spikes!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 - t * 2.2;
        ctx.strokeStyle = i % 2 === 0 ? '#a855f7' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(ang) * 34, owner.y + Math.sin(ang) * 34);
        ctx.lineTo(owner.x + Math.cos(ang) * 130, owner.y + Math.sin(ang) * 130);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as JalterUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 34;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 275, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
