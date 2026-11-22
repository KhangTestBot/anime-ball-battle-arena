import type { AceUltimateData } from '../../physics/ultimates/ace';
import type { UltimateRenderer } from './types';

export const aceUltimateRenderer: UltimateRenderer = {
  characterId: 'ace',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as AceUltimateData;
    // Blazing cinder floor patches scorching the arena
    for (const patch of data.patches) {
      const a = Math.max(0, Math.min(1, patch.life / 1.5));
      ctx.save();
      ctx.globalAlpha = a * 0.65;
      const grad = ctx.createRadialGradient(patch.x, patch.y, 4, patch.x, patch.y, patch.radius);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.72)');
      grad.addColorStop(0.55, 'rgba(249, 115, 22, 0.55)');
      grad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(patch.x, patch.y, patch.radius + Math.sin(t * 9) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as AceUltimateData;

    // 1. Growing overhead miniature Flame Sun (DAI ENKAI: ENTEI!)
    if (data.stage === 'hiken-pillars' || data.stage === 'dai-enkai') {
      ctx.save();
      ctx.translate(data.sunX, data.sunY);
      const grad = ctx.createRadialGradient(
        0,
        0,
        data.sunRadius * 0.15,
        0,
        0,
        data.sunRadius * 1.25,
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#fde047');
      grad.addColorStop(0.7, '#f97316');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, data.sunRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Spinning solar corona flame arcs
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const a = t * 5 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, data.sunRadius + 6, a, a + 0.7);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. ENTEI Detonation Blinding Flare!
    if (data.detonateFlash > 0) {
      const a = Math.max(0, Math.min(1, data.detonateFlash / 1.1));
      const r = 70 + (1 - a) * 180;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 14 * a;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(data.sunX, data.sunY, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
