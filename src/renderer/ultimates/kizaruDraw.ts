import type { KizaruUltimateData } from '../../physics/ultimates/kizaru';
import type { UltimateRenderer } from './types';

export const kizaruUltimateRenderer: UltimateRenderer = {
  characterId: 'kizaru',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Glowing Sun-Gold Pika Pika Light Aura around Borsalino
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 20 + Math.sin(t * 14) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as KizaruUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Sharp Golden YATA NO KAGAMI Zig-Zag Mirror Light Paths!
    for (const tr of data.trails) {
      const p = Math.max(0, Math.min(1, tr.life / 0.75));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 4.5 * p;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Blinding Yasakani Sacred Jewel Light Flash
    if (owner && data.kickFlash > 0) {
      const p = Math.max(0, Math.min(1, data.kickFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = p * 0.7;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 45 + (1 - p) * 165, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
