import type { ShulkerUltimateData } from '../../physics/ultimates/shulker';
import type { UltimateRenderer } from './types';

export const shulkerUltimateRenderer: UltimateRenderer = {
  characterId: 'shulker',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    // Pixelated End City Purple Shulker Box Shell around owner!
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    const sz = owner.radius + 12;
    ctx.strokeRect(owner.x - sz, owner.y - sz, sz * 2, sz * 2);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ShulkerUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 10 * a;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 45 + (1.2 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
