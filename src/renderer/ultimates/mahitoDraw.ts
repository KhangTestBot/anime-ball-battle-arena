import type { MahitoUltimateData } from '../../physics/ultimates/mahito';
import type { UltimateRenderer } from './types';

export const mahitoUltimateRenderer: UltimateRenderer = {
  characterId: 'mahito',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Self-Embodiment of Perfection: Haunting Giant Pale-Blue Palm Wall Circle!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.72)';
    ctx.fillStyle = 'rgba(88, 28, 135, 0.2)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, 235, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orbiting Cursed Hand Silhouettes along Perimeter
    for (let i = 0; i < 8; i++) {
      const a = t * 0.8 + (i * Math.PI * 2) / 8;
      const hx = Math.cos(a) * 225;
      const hy = Math.sin(a) * 225;
      ctx.fillStyle = 'rgba(196, 181, 253, 0.55)';
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MahitoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Idle Transfiguration Purple Soul-Thread Arcs & Flash
    if (owner && data.palmFlash > 0) {
      const p = Math.max(0, Math.min(1, data.palmFlash / 1.15));
      ctx.save();
      ctx.globalAlpha = p * 0.78;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      for (const f of fighters) {
        if (!f.alive || f.uid === owner.uid) continue;
        if (Math.hypot(f.x - owner.x, f.y - owner.y) <= 255) {
          ctx.beginPath();
          ctx.moveTo(owner.x, owner.y);
          ctx.lineTo(f.x, f.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  },
};
