import type { MagnaUltimateData } from '../../physics/ultimates/magna';
import type { UltimateRenderer } from './types';

export const magnaUltimateRenderer: UltimateRenderer = {
  characterId: 'magna',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Flaming Soul Chain tethers connecting Magna to every enemy!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.lineDashOffset = -t * 60;
      for (const f of fighters) {
        if (!f.alive || f.uid === owner.uid) continue;
        if (owner.teamId !== null && f.teamId === owner.teamId) continue;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MagnaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 44 + (1.4 - data.flash) * 255, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
