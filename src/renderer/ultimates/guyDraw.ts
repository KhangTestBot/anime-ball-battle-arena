import type { GuyUltimateData } from '../../physics/ultimates/guy';
import type { UltimateRenderer } from './types';

export const guyUltimateRenderer: UltimateRenderer = {
  characterId: 'guy',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Gate of Death Boiling Crimson Blood-Vapor Steam Aura!
    ctx.save();
    const grad = ctx.createRadialGradient(
      owner.x,
      owner.y,
      owner.radius * 0.5,
      owner.x,
      owner.y,
      owner.radius + 54,
    );
    grad.addColorStop(0, 'rgba(220, 38, 38, 0.55)');
    grad.addColorStop(0.65, 'rgba(185, 28, 28, 0.25)');
    grad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 54 + Math.sin(t * 14) * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as GuyUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Sekizo Compressed-Air Cannon Rings
    for (const p of data.pulses) {
      const a = Math.max(0, Math.min(1, p.life / 0.9));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. NIGHT GUY Crimson Blood-Dragon Silhouette enveloping Guy!
    if (owner && (data.stage === 'night-guy-charge' || data.dragonFlash > 0)) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(owner.facingAngle);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.44)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(owner.radius + 42, 0);
      ctx.lineTo(0, -owner.radius - 20);
      ctx.lineTo(-owner.radius * 1.4, 0);
      ctx.lineTo(0, owner.radius + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
