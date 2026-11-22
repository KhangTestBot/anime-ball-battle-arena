import type { KenpachiUltimateData } from '../../physics/ultimates/kenpachi';
import type { UltimateRenderer } from './types';

export const kenpachiUltimateRenderer: UltimateRenderer = {
  characterId: 'kenpachi',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Towering Golden Demon Skull Reiatsu Silhouette rising over Zaraki!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const scale = 1 + Math.sin(t * 10) * 0.06;
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, -owner.radius * 0.4, owner.radius + 26, Math.PI, 0);
    ctx.lineTo(owner.radius + 22, owner.radius * 0.8);
    ctx.lineTo(0, owner.radius + 14);
    ctx.lineTo(-owner.radius - 22, owner.radius * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Demon Reiatsu Eyes above Zaraki's brow
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-14, -owner.radius * 0.8, 5, 0, Math.PI * 2);
    ctx.arc(14, -owner.radius * 0.8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as KenpachiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Colossal Chipped NOZARASHI Cleave Arc!
    if (owner && data.slashFlash > 0) {
      const a = Math.max(0, Math.min(1, data.slashFlash / 0.85));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.slashAngle);

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 32 * a;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, 175, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10 * a;
      ctx.beginPath();
      ctx.arc(0, 0, 175, -Math.PI * 0.36, Math.PI * 0.36);
      ctx.stroke();
      ctx.restore();
    }
  },
};
