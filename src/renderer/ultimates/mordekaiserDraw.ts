import type { MordekaiserUltimateData } from '../../physics/ultimates/mordekaiser';
import type { UltimateRenderer } from './types';

export const mordekaiserUltimateRenderer: UltimateRenderer = {
  characterId: 'mordekaiser',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as MordekaiserUltimateData;
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.42);
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Spectral Teal-Emerald Death Realm Boundary Ring with iron spikes
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#2dd4bf';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(data.centerX, data.centerY, data.realmRadius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12 + t * 0.4;
      const x1 = data.centerX + Math.cos(a) * (data.realmRadius - 12);
      const y1 = data.centerY + Math.sin(a) * (data.realmRadius - 12);
      const x2 = data.centerX + Math.cos(a) * (data.realmRadius + 14);
      const y2 = data.centerY + Math.sin(a) * (data.realmRadius + 14);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as MordekaiserUltimateData;
    if (data.slamFlash <= 0) return;

    const a = Math.min(1, data.slamFlash / 0.65);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.slamX, data.slamY);
    // Spectral Nightfall Mace impact cross & emerald shock ring
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 8 * a;
    ctx.shadowColor = '#14b8a6';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 120 * (1.2 - a * 0.3), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(45, 212, 191, 0.25)';
    ctx.fillRect(-18, -95, 36, 190);
    ctx.restore();
  },
};
