import type { NobaraUltimateData } from '../../physics/ultimates/nobara';
import type { UltimateRenderer } from './types';

export const nobaraUltimateRenderer: UltimateRenderer = {
  characterId: 'nobara',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as NobaraUltimateData;
    const target = data.targetUid
      ? fighters.find((f) => f.uid === data.targetUid && f.alive)
      : null;

    // Sympathetic Straw-Doll Resonance link thread bridging Nobara's Doll -> Target!
    if (target) {
      ctx.save();
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.72)';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(data.dollX, data.dollY);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as NobaraUltimateData;

    // 1. Floating Straw Doll Voodoo Charm
    ctx.save();
    ctx.translate(data.dollX, data.dollY);
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-5, 0, 10, 11);
    ctx.strokeRect(-5, 0, 10, 11);
    ctx.restore();

    // 2. 5 Floating Cursed Iron Nails!
    for (let i = 0; i < data.nails.length; i++) {
      const nail = data.nails[i];
      if (nail.detonated) continue;
      ctx.save();
      ctx.translate(nail.x, nail.y + Math.sin(t * 7 + i) * 3);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-2.5, -10, 5, 20);
      ctx.strokeRect(-2.5, -10, 5, 20);
      ctx.fillRect(-6, -11, 12, 3);
      ctx.restore();
    }

    // 3. HAIRPIN Multi-Explosion Burst!
    if (data.hairpinFlash > 0) {
      const a = Math.max(0, Math.min(1, data.hairpinFlash));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6 * a;
      for (const nail of data.nails) {
        ctx.beginPath();
        ctx.arc(nail.x, nail.y, 35 + (1 - a) * 55, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
