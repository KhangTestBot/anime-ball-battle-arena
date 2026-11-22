import type { NeteroUltimateData } from '../../physics/ultimates/netero';
import type { UltimateRenderer } from './types';

export const neteroUltimateRenderer: UltimateRenderer = {
  characterId: 'netero',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;

    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.globalAlpha = Math.max(0, alpha * 0.72);

    // Colossal Golden 100-Type Guanyin Bodhisattva radiating multi-armed halo!
    ctx.strokeStyle = '#facc15';
    ctx.fillStyle = 'rgba(250, 204, 21, 0.14)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 118 + Math.sin(t * 8) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 16 radiating golden Bodhisattva palm rays
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16 + t * 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
      ctx.lineTo(Math.cos(a) * 142, Math.sin(a) * 142);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 145, Math.sin(a) * 145, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as NeteroUltimateData;
    if (data.zeroFlash <= 0) return;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner) return;

    const a = Math.min(1, data.zeroFlash);
    const len = bounds.fullSize * 1.4;
    const x2 = owner.x + Math.cos(data.zeroAngle) * len;
    const y2 = owner.y + Math.sin(data.zeroAngle) * len;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 66 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 22 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },
};
