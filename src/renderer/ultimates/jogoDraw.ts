import type { JogoUltimateData } from '../../physics/ultimates/jogo';
import type { UltimateRenderer } from './types';

export const jogoUltimateRenderer: UltimateRenderer = {
  characterId: 'jogo',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Glowing magma fissures across Coffin of the Iron Mountain floor
    ctx.globalAlpha = Math.max(0, alpha * 0.45);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    const step = 110;
    for (let x = 60; x < bounds.fullSize; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(t * 2 + x) * 18, bounds.fullSize);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as JogoUltimateData;
    if (data.meteorImpacted) return;

    const p = data.meteorProgress;
    const dropY = bounds.top - 60 + (data.meteorY - (bounds.top - 60)) * (p * p);

    ctx.save();
    // Shrinking target magma ring on floor
    ctx.strokeStyle = '#f97316';
    ctx.fillStyle = `rgba(234, 88, 12, ${0.15 + p * 0.35})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(data.meteorX, data.meteorY, 32 + (1 - p) * 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Colossal descending volcanic Maximum: Meteor!
    ctx.translate(data.meteorX, dropY);
    ctx.fillStyle = '#292524';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-26, -18);
    ctx.lineTo(4, 2);
    ctx.lineTo(30, -14);
    ctx.moveTo(4, 2);
    ctx.lineTo(-14, 30);
    ctx.stroke();
    ctx.restore();
  },
};
