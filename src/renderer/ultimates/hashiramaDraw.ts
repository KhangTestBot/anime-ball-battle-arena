import type { HashiramaUltimateData } from '../../physics/ultimates/hashirama';
import type { UltimateRenderer } from './types';

export const hashiramaUltimateRenderer: UltimateRenderer = {
  characterId: 'hashirama',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Deep Forest Emerald Pollen Mist Aura
    ctx.save();
    const grad = ctx.createRadialGradient(owner.x, owner.y, 16, owner.x, owner.y, 220);
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.25)');
    grad.addColorStop(0.65, 'rgba(21, 128, 61, 0.14)');
    grad.addColorStop(1, 'rgba(21, 128, 61, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 220, 0, Math.PI * 2);
    ctx.fill();

    // 1000-Armed Shinsu Senju Golden Wooden Halo Arch behind Hashirama!
    const data = state.data as unknown as HashiramaUltimateData;
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.buddhaAngle);
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.65)';
    ctx.fillStyle = 'rgba(180, 83, 9, 0.42)';
    ctx.lineWidth = 2.4;

    for (let i = -5; i <= 5; i++) {
      const a = Math.PI + i * 0.24 + Math.sin(t * 6 + i) * 0.04;
      const rIn = owner.radius + 8;
      const rOut = owner.radius + 64;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
      ctx.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(Math.cos(a) * rOut, Math.sin(a) * rOut, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(_ctx, _state, _bounds, _fighters, _t) {},
};
