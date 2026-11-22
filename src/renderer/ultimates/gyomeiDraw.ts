import type { GyomeiUltimateData } from '../../physics/ultimates/gyomei';
import type { UltimateRenderer } from './types';

export const gyomeiUltimateRenderer: UltimateRenderer = {
  characterId: 'gyomei',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as GyomeiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    const fx = owner.x + Math.cos(data.flailAngle) * 165;
    const fy = owner.y + Math.sin(data.flailAngle) * 165;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    // Heavy steel chain connecting Gyomei to his spiked Flail!
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#57534e';
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(fx, fy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as GyomeiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.swingFlash <= 0 || !owner) return;
    const a = Math.min(1, data.swingFlash / 0.55);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 8 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 195, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
