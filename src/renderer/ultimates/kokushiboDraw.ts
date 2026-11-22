import type { KokushiboUltimateData } from '../../physics/ultimates/kokushibo';
import type { UltimateRenderer } from './types';

export const kokushiboUltimateRenderer: UltimateRenderer = {
  characterId: 'kokushibo',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 6-Eyed Upper Rank One Crimson-Violet Lunar Aura around Kokushibo
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 26 + Math.sin(t * 7) * 2, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * 0.75 + (i * Math.PI) / 5;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(a) * (owner.radius + 16),
        Math.sin(a) * (owner.radius + 16),
        4,
        2.2,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as KokushiboUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Erratically Spinning Miniature Chaotic Moon Crescents flying across the arena
    for (const m of data.chaoticMoons) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.spin);
      ctx.strokeStyle = '#f0abfc';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0.35, Math.PI * 1.45);
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }

    // 2. 16th Form Moonbow Halved Moon Crescent Slash Flash
    if (owner && data.slashFlash > 0) {
      const p = Math.max(0, Math.min(1, data.slashFlash / 1.2));
      ctx.save();
      ctx.globalAlpha = p * 0.75;
      ctx.strokeStyle = '#e879f9';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 55 + (1 - p) * 190, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
