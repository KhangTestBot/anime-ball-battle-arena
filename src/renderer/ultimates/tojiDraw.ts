import type { TojiUltimateData } from '../../physics/ultimates/toji';
import type { UltimateRenderer } from './types';

export const tojiUltimateRenderer: UltimateRenderer = {
  characterId: 'toji',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Cursed Inventory Worm coiling around Toji's neck/shoulders + kinetic burst cone
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.72)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 7, Math.PI * 0.75 + Math.sin(t * 8) * 0.1, Math.PI * 2.15);
    ctx.stroke();

    // Worm segments
    ctx.strokeStyle = '#d8b4fe';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 7, Math.PI * 0.75, Math.PI * 2.15);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as TojiUltimateData;

    // Chain of a Thousand Miles + 3-Pronged Sai INVERTED SPEAR OF HEAVEN!
    if (data.chainFlash > 0) {
      const a = Math.max(0, Math.min(1, data.chainFlash / 0.55));
      ctx.save();
      ctx.globalAlpha = a;

      // Dashed metallic chain links bridging Toji -> target
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(data.chainX1, data.chainY1);
      ctx.lineTo(data.chainX2, data.chainY2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Iconic 3-prong Inverted Spear of Heaven tip at impact point!
      const ang = Math.atan2(data.chainY2 - data.chainY1, data.chainX2 - data.chainX1);
      ctx.translate(data.chainX2, data.chainY2);
      ctx.rotate(ang);
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-4, -9);
      ctx.lineTo(2, -3);
      ctx.lineTo(-10, 0);
      ctx.lineTo(2, 3);
      ctx.lineTo(-4, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
