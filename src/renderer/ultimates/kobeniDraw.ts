import type { KobeniUltimateData } from '../../physics/ultimates/kobeni';
import type { UltimateRenderer } from './types';

export const kobeniUltimateRenderer: UltimateRenderer = {
  characterId: 'kobeni',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Frantic zig-zag panic dodge ring around Kobeni
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20, t * 14, t * 14 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KobeniUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.35 - data.flash) * 235, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
