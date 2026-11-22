import type { EnkiduUltimateData } from '../../physics/ultimates/enkidu';
import type { UltimateRenderer } from './types';

export const enkiduUltimateRenderer: UltimateRenderer = {
  characterId: 'enkidu',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.3);
    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Chains of Heaven binding every enemy & emerald Counter Force halo!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([12, 6]);
      ctx.lineDashOffset = -t * 70;
      for (const f of fighters) {
        if (!f.alive || f.uid === owner.uid) continue;
        if (owner.teamId !== null && f.teamId === owner.teamId) continue;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 92, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as EnkiduUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 22 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 36;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 48 + (1.5 - data.flash) * 280, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
