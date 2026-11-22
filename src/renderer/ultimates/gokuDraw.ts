import type { GokuUltimateData } from '../../physics/ultimates/goku';
import type { UltimateRenderer } from './types';

export const gokuUltimateRenderer: UltimateRenderer = {
  characterId: 'goku',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as GokuUltimateData;

    // 16 Converging Blue-White Spirit Energy Streams flowing into the Genki Dama!
    if (data.stage === 'charging') {
      ctx.save();
      for (const s of data.streams) {
        const px = s.sx + (data.orbX - s.sx) * s.progress;
        const py = s.sy + (data.orbY - s.sy) * s.progress;
        const tail = Math.max(0, s.progress - 0.18);
        const tx = s.sx + (data.orbX - s.sx) * tail;
        const ty = s.sy + (data.orbY - s.sy) * tail;

        ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
        ctx.lineWidth = 2.6;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as GokuUltimateData;

    // 1. Radiant Multi-Layered GENKI DAMA Plasma Sphere!
    if (data.stage === 'charging' || data.stage === 'launched') {
      const r = data.orbRadius;
      ctx.save();
      ctx.translate(data.orbX, data.orbY);

      // Outer celestial halo
      const halo = ctx.createRadialGradient(0, 0, r * 0.45, 0, 0, r * 1.48);
      halo.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      halo.addColorStop(0.5, 'rgba(125, 211, 252, 0.78)');
      halo.addColorStop(0.78, 'rgba(56, 189, 248, 0.35)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.48, 0, Math.PI * 2);
      ctx.fill();

      // Solid radiant plasma core
      const core = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.65, '#bae6fd');
      core.addColorStop(1, '#0284c7');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Swirling cyan energy rings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r * (0.72 + i * 0.16), t * (5 + i * 2), t * (5 + i * 2) + Math.PI * 0.95);
        ctx.stroke();
      }

      if (data.absorbedCount > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.font = '900 11px monospace';
        ctx.textAlign = 'center';
        ctx.strokeText(`+${data.absorbedCount * 15}%`, 0, 4);
        ctx.fillText(`+${data.absorbedCount * 15}%`, 0, 4);
      }
      ctx.restore();
    }

    // 2. Blinding White-Blue Genki Dama Detonation Flash!
    if (data.stage === 'detonated' && data.detonateFlash > 0) {
      const a = Math.max(0, Math.min(1, data.detonateFlash / 0.85));
      ctx.save();
      ctx.globalAlpha = a * 0.8;
      const g = ctx.createRadialGradient(
        data.orbX,
        data.orbY,
        12,
        data.orbX,
        data.orbY,
        data.orbRadius * 2.7,
      );
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.55, '#7dd3fc');
      g.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(data.orbX, data.orbY, data.orbRadius * 2.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
