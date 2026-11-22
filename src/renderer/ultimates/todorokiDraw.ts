import type { TodorokiUltimateData } from '../../physics/ultimates/todoroki';
import type { UltimateRenderer } from './types';

export const todorokiUltimateRenderer: UltimateRenderer = {
  characterId: 'todoroki',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Split Half-Cold Cyan Frost (Left) & Half-Hot Crimson Fire (Right) around Shoto!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 32, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 32, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.fill();

    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 2.4;
    ctx.rotate(t * 2.5);
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as TodorokiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Violet-Ice Phosphor Thermal Vapor Detonation Dome
    if (owner && data.phosphorFlash > 0) {
      const p = Math.max(0, Math.min(1, data.phosphorFlash / 1.2));
      ctx.save();
      ctx.globalAlpha = p * 0.78;
      const grad = ctx.createRadialGradient(owner.x, owner.y, 14, owner.x, owner.y, 245);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#38bdf8');
      grad.addColorStop(0.85, '#c084fc');
      grad.addColorStop(1, 'rgba(192, 132, 252, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 245, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
