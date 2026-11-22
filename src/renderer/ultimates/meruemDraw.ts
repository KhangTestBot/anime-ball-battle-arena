import type { MeruemUltimateData } from '../../physics/ultimates/meruem';
import type { UltimateRenderer } from './types';

export const meruemUltimateRenderer: UltimateRenderer = {
  characterId: 'meruem',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as MeruemUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Sparkling Emerald-Gold Photonic En Domed Field
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const grad = ctx.createRadialGradient(0, 0, owner.radius, 0, 0, data.enRadius);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
    grad.addColorStop(0.8, 'rgba(250, 204, 21, 0.16)');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, data.enRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -t * 32;
    ctx.beginPath();
    ctx.arc(0, 0, data.enRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Sparkling Photon En Flecks inside field
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 10; i++) {
      const a = t * 1.8 + (i * Math.PI * 2) / 10;
      const r = data.enRadius * (0.35 + ((i * 37) % 60) / 100);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MeruemUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // Post-Rose Golden-Emerald Rage Blast Nuclear Dome
    if (owner && data.blastFlash > 0) {
      const p = Math.max(0, Math.min(1, data.blastFlash / 1.2));
      ctx.save();
      ctx.globalAlpha = p * 0.8;
      const grad = ctx.createRadialGradient(owner.x, owner.y, 12, owner.x, owner.y, 235);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#fde047');
      grad.addColorStop(0.85, '#10b981');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, 235, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
