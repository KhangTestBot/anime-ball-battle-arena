import type { ScorpionUltimateData } from '../../physics/ultimates/scorpion';
import type { UltimateRenderer } from './types';

export const scorpionUltimateRenderer: UltimateRenderer = {
  characterId: 'scorpion',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Netherrealm Hellfire ring around Scorpion
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 20 + Math.sin(t * 13) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ScorpionUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 17 * a;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.35 - data.flash) * 240, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
