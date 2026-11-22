import type { VegitoUltimateData } from '../../physics/ultimates/vegito';
import type { UltimateRenderer } from './types';

export const vegitoUltimateRenderer: UltimateRenderer = {
  characterId: 'vegito',

  drawBackdrop(ctx, state, bounds, fighters) {
    const data = state.data as unknown as VegitoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    // Golden Spirit Excalibur Energy Blade stretching across the arena
    if (!data.beamFired) {
      const len = bounds.fullSize * 1.25;
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 22;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(
        owner.x + Math.cos(data.swordAngle) * len,
        owner.y + Math.sin(data.swordAngle) * len,
      );
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(
        owner.x + Math.cos(data.swordAngle) * len,
        owner.y + Math.sin(data.swordAngle) * len,
      );
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as VegitoUltimateData;
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
    // Final Kamehameha: Golden Final Flash helix wrapping Turquoise Kamehameha core!
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 62 * a;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 34 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
};
