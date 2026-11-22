import type { MahoragaUltimateData } from '../../physics/ultimates/mahoraga';
import type { UltimateRenderer } from './types';

export const mahoragaUltimateRenderer: UltimateRenderer = {
  characterId: 'mahoraga',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#291c04';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Radiant Divine General Positive Energy blade halo around Giant Mahoraga!
    if (owner) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + t * 2.2;
        ctx.strokeStyle = i % 2 === 0 ? '#fef08a' : '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(
          owner.x + Math.cos(ang) * (owner.radius + 8),
          owner.y + Math.sin(ang) * (owner.radius + 8),
        );
        ctx.lineTo(
          owner.x + Math.cos(ang) * (owner.radius + 68),
          owner.y + Math.sin(ang) * (owner.radius + 68),
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds) {
    const data = state.data as unknown as MahoragaUltimateData;
    if (data.pillarFlash <= 0) return;

    // Colossal Golden-White Positive Energy Cross-Pillar Eruption across the entire arena!
    const p = Math.max(0, Math.min(1, data.pillarFlash / 1.45));
    const w = 54 * p;
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 32;
    ctx.fillRect(data.pillarX - w * 0.5, 0, w, bounds.fullSize);
    ctx.fillRect(0, data.pillarY - w * 0.5, bounds.fullSize, w);

    const core = 20 * p;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(data.pillarX - core * 0.5, 0, core, bounds.fullSize);
    ctx.fillRect(0, data.pillarY - core * 0.5, bounds.fullSize, core);
    ctx.restore();
  },
};
