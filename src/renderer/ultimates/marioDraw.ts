import type { MarioUltimateData } from '../../physics/ultimates/mario';
import type { UltimateRenderer } from './types';

export const marioUltimateRenderer: UltimateRenderer = {
  characterId: 'mario',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rainbow Super Star invincibility ring around Mario!
    if (owner && owner.alive) {
      const hue = (t * 360) % 360;
      ctx.globalAlpha = Math.max(0, alpha * 0.92);
      ctx.strokeStyle = `hsl(${hue}, 95%, 60%)`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + Math.sin(t * 14) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as MarioUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
