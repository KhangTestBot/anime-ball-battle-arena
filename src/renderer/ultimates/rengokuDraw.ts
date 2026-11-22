import type { RengokuUltimateData } from '../../physics/ultimates/rengoku';
import type { UltimateRenderer } from './types';

export const rengokuUltimateRenderer: UltimateRenderer = {
  characterId: 'rengoku',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crimson-Gold Flame Tiger Vortex encircling Rengoku!
    ctx.save();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 4.2;
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 18;
    for (let i = 0; i < 4; i++) {
      const a = t * 9 + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 24, a, a + 1.15);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as RengokuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Ninth Form: RENGOKU! Towering Blazing Fire Dragon Charge Silhouette!
    if (owner && (data.stage === 'purgatory-dragon' || data.dragonFlash > 0)) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.dragonAngle);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.45)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(owner.radius + 44, 0);
      ctx.lineTo(4, -owner.radius - 22);
      ctx.lineTo(-owner.radius * 1.45, -14);
      ctx.lineTo(-owner.radius * 1.75, 0);
      ctx.lineTo(-owner.radius * 1.45, 14);
      ctx.lineTo(4, owner.radius + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
