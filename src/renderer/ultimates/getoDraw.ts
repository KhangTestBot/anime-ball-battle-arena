import type { GetoUltimateData } from '../../physics/ultimates/geto';
import type { UltimateRenderer } from './types';

export const getoUltimateRenderer: UltimateRenderer = {
  characterId: 'geto',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as GetoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Swirling Grotesque Violet-Black Uzumaki Cursed Vortex behind Geto
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.spiralRot);
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.72)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const a = i * 0.45;
      const r = owner.radius + 10 + i * 2.1;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as GetoUltimateData;

    if (data.stage === 'uzumaki-beam' && data.beamTimer > 0) {
      const a = Math.max(0, Math.min(1, data.beamTimer / 1.05));
      const w = 34 + data.condensedCount * 8;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = w * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#7e22ce';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(data.beamX1, data.beamY1);
      ctx.lineTo(data.beamX2, data.beamY2);
      ctx.stroke();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = w * 0.45 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
