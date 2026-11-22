import type { BlazeUltimateData } from '../../physics/ultimates/blaze';
import type { UltimateRenderer } from './types';

export const blazeUltimateRenderer: UltimateRenderer = {
  characterId: 'blaze',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BlazeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.rodAngle);
    // 6 Orbiting Pixelated Golden Blaze Rods!
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      const rx = Math.cos(a) * 64;
      const ry = Math.sin(a) * 64;
      ctx.fillRect(rx - 4, ry - 12, 8, 24);
      ctx.strokeRect(rx - 4, ry - 12, 8, 24);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as BlazeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 14 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 45 + (1.2 - data.flash) * 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
