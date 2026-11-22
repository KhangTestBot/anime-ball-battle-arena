import type { YhwachUltimateData } from '../../physics/ultimates/yhwach';
import type { UltimateRenderer } from './types';

export const yhwachUltimateRenderer: UltimateRenderer = {
  characterId: 'yhwach',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Dark Almighty Shadow Reiatsu studded with Red Almighty Seeing Pupils!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(9, 9, 11, 0.55)';
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 32, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const a = t * 1.6 + (i * Math.PI * 2) / 6;
      const ex = Math.cos(a) * (owner.radius + 20);
      const ey = Math.sin(a) * (owner.radius + 20);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 5, 3, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(ex, ey, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters, _t) {
    const data = state.data as unknown as YhwachUltimateData;

    // 1. Predicted Almighty Future Traps blinking red on target floor tiles
    for (const tr of data.traps) {
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◎ ALMIGHTY', tr.x, tr.y - 30);
      ctx.restore();
    }

    // 2. Towering Heaven-to-Ground AUSWÄHLEN Golden Light Pillars on every enemy!
    if (data.lightFlash > 0) {
      const a = Math.max(0, Math.min(1, data.lightFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = a * 0.8;
      for (const f of fighters) {
        if (
          !f.alive ||
          f.uid === state.ownerUid ||
          (state.teamId !== null && f.teamId === state.teamId)
        )
          continue;
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.fillRect(f.x - 24, bounds.top, 48, f.y - bounds.top + 20);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.strokeRect(f.x - 16, bounds.top, 32, f.y - bounds.top + 20);
      }
      ctx.restore();
    }
  },
};
