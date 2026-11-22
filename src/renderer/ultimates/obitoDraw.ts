import type { ObitoUltimateData } from '../../physics/ultimates/obito';
import type { UltimateRenderer } from './types';

export const obitoUltimateRenderer: UltimateRenderer = {
  characterId: 'obito',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ObitoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Swirling Orange-Black Kamui Mask Dimensional Vortex centering on Obito
    if (data.stage === 'intangible') {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(t * 9);
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 18; i++) {
        const ang = i * 0.45;
        const r = i * 2.2;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Ghostly Kamui Phasing Outer Rim
      ctx.strokeStyle = 'rgba(253, 186, 116, 0.45)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as ObitoUltimateData;

    // DNA Double-Helix SWORD OF NUNOBOKO + Truth-Seeking Black Orbs!
    if (data.nunobokoFlash > 0) {
      const a = Math.max(0, Math.min(1, data.nunobokoFlash / 1.05));
      ctx.save();
      ctx.globalAlpha = a;
      const dx = data.slashX2 - data.slashX1;
      const dy = data.slashY2 - data.slashY1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;

      // Double-helix intertwined Truth-Seeking rails
      for (const phase of [1, -1]) {
        ctx.strokeStyle = phase === 1 ? '#09090b' : '#f97316';
        ctx.lineWidth = 8 * a;
        ctx.beginPath();
        for (let i = 0; i <= 14; i++) {
          const p = i / 14;
          const wave = Math.sin(p * Math.PI * 3) * 14 * phase;
          const px = data.slashX1 + dx * p + nx * wave;
          const py = data.slashY1 + dy * p + ny * wave;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Orbiting Black Truth-Seeking Spheres along Nunoboko spine
      for (let i = 1; i <= 5; i++) {
        const p = i / 6;
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#fdba74';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(data.slashX1 + dx * p, data.slashY1 + dy * p, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
