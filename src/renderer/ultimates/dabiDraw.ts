import type { DabiUltimateData } from '../../physics/ultimates/dabi';
import type { UltimateRenderer } from './types';

export const dabiUltimateRenderer: UltimateRenderer = {
  characterId: 'dabi',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.34);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Rising Blueflame embers across the arena
    ctx.globalAlpha = Math.max(0, alpha * 0.55);
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 18; i++) {
      const x = ((i * 83) % (bounds.fullSize - 30)) + 15;
      const y =
        (bounds.fullSize - ((t * 90 + i * 51) % bounds.fullSize) + bounds.fullSize) %
        bounds.fullSize;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as DabiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 40 + (1.25 - data.flash) * 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
