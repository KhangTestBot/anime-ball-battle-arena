import type { KurapikaUltimateData } from '../../physics/ultimates/kurapika';
import type { UltimateRenderer } from './types';

export const kurapikaUltimateRenderer: UltimateRenderer = {
  characterId: 'kurapika',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Scarlet Eyes & Golden Chain Jail ring around Kurapika
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24, t * 4, t * 4 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as KurapikaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.4 - data.flash) * 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
