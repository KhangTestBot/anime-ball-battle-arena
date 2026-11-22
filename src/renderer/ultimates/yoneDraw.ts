import type { YoneUltimateData } from '../../physics/ultimates/yone';
import type { UltimateRenderer } from './types';

export const yoneUltimateRenderer: UltimateRenderer = {
  characterId: 'yone',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as YoneUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.78);

    // Soul Unbound Spirit Tether connecting anchor body to Yone
    if (owner && owner.alive && !data.soulSnapped) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(data.anchorX, data.anchorY);
      ctx.lineTo(owner.x, owner.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.strokeStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(data.anchorX, data.anchorY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Fate Sealed Telegraph Corridor before blink
    if (!data.fateSealedFired) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 46;
      ctx.beginPath();
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as YoneUltimateData;
    if (data.slashFlash <= 0) return;

    const a = Math.min(1, data.slashFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    // Dual Azakana Crimson & Steel Cyan Fate Sealed Slash
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 30 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.stroke();

    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 9 * a;
    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.stroke();
    ctx.restore();
  },
};
