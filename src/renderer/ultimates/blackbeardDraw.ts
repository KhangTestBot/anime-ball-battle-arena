import type { BlackbeardUltimateData } from '../../physics/ultimates/blackbeard';
import type { UltimateRenderer } from './types';

export const blackbeardUltimateRenderer: UltimateRenderer = {
  characterId: 'blackbeard',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as BlackbeardUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Swirling Pitch-Black & Violet Yami Yami Void Vortex beneath Blackbeard
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const grad = ctx.createRadialGradient(0, 0, owner.radius * 0.5, 0, 0, data.vortexRadius);
    grad.addColorStop(0, 'rgba(9, 9, 11, 0.72)');
    grad.addColorStop(0.6, 'rgba(88, 28, 135, 0.35)');
    grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.vortexRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([14, 10]);
    ctx.lineDashOffset = t * 48;
    ctx.beginPath();
    ctx.arc(0, 0, data.vortexRadius * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as BlackbeardUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Gura Gura No Mi Spatial White-Glass Cracks radiating from Blackbeard!
    if (owner && data.quakeFlash > 0) {
      const p = Math.max(0, Math.min(1, data.quakeFlash / 1.2));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#bae6fd';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3.2;

      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8 + 0.25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
        ctx.lineTo(Math.cos(a + 0.14) * 115, Math.sin(a + 0.14) * 115);
        ctx.lineTo(Math.cos(a - 0.1) * 235, Math.sin(a - 0.1) * 235);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
