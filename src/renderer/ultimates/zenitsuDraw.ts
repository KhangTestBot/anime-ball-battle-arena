import type { ZenitsuUltimateData } from '../../physics/ultimates/zenitsu';
import type { UltimateRenderer } from './types';

export const zenitsuUltimateRenderer: UltimateRenderer = {
  characterId: 'zenitsu',

  drawBackdrop(_ctx, _state, _bounds, _fighters, _t) {},

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as ZenitsuUltimateData;

    // 1. Six-Fold Godspeed Yellow-Cyan Zig-Zag Lightning Streaks across Arena!
    for (const b of data.bolts) {
      const a = Math.max(0, Math.min(1, b.life / 0.8));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 7 * a;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      const midX = (b.x1 + b.x2) * 0.5 + Math.sin(t * 45) * 14;
      const midY = (b.y1 + b.y2) * 0.5 - Math.cos(t * 45) * 14;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(midX, midY);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5 * a;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Seventh Form: FLAMING THUNDER GOD Golden Thunder Dragon Streak!
    if (data.dragonFlash > 0) {
      const a = Math.max(0, Math.min(1, data.dragonFlash / 1.05));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 34 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(data.dragonX1, data.dragonY1);
      ctx.lineTo(data.dragonX2, data.dragonY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 11 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
