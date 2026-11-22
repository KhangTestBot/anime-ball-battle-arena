import type { GogetaUltimateData } from '../../physics/ultimates/gogeta';
import type { UltimateRenderer } from './types';

export const gogetaUltimateRenderer: UltimateRenderer = {
  characterId: 'gogeta',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as GogetaUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.24);
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rainbow Stardust Breaker orb pulsing before detonation
    if (!data.stardustDetonated) {
      const colors = ['#38bdf8', '#f472b6', '#facc15', '#4ade80'];
      ctx.globalAlpha = Math.max(0, alpha * 0.9);
      for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(
          data.stardustX,
          data.stardustY,
          18 + i * 7 + Math.sin(t * 16 + i) * 3,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as GogetaUltimateData;
    if (data.beamFlash <= 0) return;

    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner) return;

    const a = Math.min(1, data.beamFlash);
    const len = bounds.fullSize * 1.4;
    const x2 = owner.x + Math.cos(data.beamAngle) * len;
    const y2 = owner.y + Math.sin(data.beamAngle) * len;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 54 * a;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 24 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
};
