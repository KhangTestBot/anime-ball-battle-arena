import type { BeerusUltimateData } from '../../physics/ultimates/beerus';
import type { UltimateRenderer } from './types';

export const beerusUltimateRenderer: UltimateRenderer = {
  characterId: 'beerus',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // God of Destruction Amethyst Destroyer Aura beneath Beerus
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 2.2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.72)';
    ctx.lineWidth = 2.6;
    ctx.strokeRect(
      -(owner.radius + 20),
      -(owner.radius + 20),
      (owner.radius + 20) * 2,
      (owner.radius + 20) * 2,
    );
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as BeerusUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Floating Magenta-Gold Sphere of Destruction Sun Orbs
    for (const orb of data.orbs) {
      if (orb.exploded) continue;
      ctx.save();
      ctx.translate(orb.x, orb.y);
      const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, 22);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.55, '#f97316');
      grad.addColorStop(0.85, '#9333ea');
      grad.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 22 + Math.sin(t * 9) * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Amethyst Void Erasure Wave on HAKAI snap!
    if (owner && data.hakaiFlash > 0) {
      const p = Math.max(0, Math.min(1, data.hakaiFlash / 1.2));
      ctx.save();
      ctx.globalAlpha = p * 0.65;
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 40 + (1 - p) * 240, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('破壊 HAKAI', owner.x, owner.y - owner.radius - 34);
      ctx.restore();
    }
  },
};
