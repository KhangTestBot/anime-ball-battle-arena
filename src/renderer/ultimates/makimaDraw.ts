import type { MakimaUltimateData } from '../../physics/ultimates/makima';
import type { UltimateRenderer } from './types';

export const makimaUltimateRenderer: UltimateRenderer = {
  characterId: 'makima',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.72);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    // Crimson Control Chains linking Makima to every living enemy!
    for (const f of fighters) {
      if (!f.alive || f.uid === owner.uid) continue;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(f.x, f.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as MakimaUltimateData;
    if (data.bangFlash <= 0) return;

    const a = Math.min(1, data.bangFlash / 0.5);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.bangX, data.bangY);
    // Invisible kinetic BANG! concentric red pressure rings
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8 * a;
    ctx.beginPath();
    ctx.arc(0, 0, 26 + (1 - a) * 115, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 * a;
    ctx.beginPath();
    ctx.arc(0, 0, 14 + (1 - a) * 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
