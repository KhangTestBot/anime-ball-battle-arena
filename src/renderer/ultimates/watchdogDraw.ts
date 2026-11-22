import type { WatchdogUltimateData } from '../../physics/ultimates/watchdog';
import type { UltimateRenderer } from './types';

export const watchdogUltimateRenderer: UltimateRenderer = {
  characterId: 'watchdog',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.22);
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Q-City Territory boundary ring around Watchdog Man
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.7);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 45 + Math.sin(t * 8) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as WatchdogUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 15 * a;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 42 + (1.25 - data.flash) * 225, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
