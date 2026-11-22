import type { TechnobladeUltimateData } from '../../physics/ultimates/technoblade';
import type { UltimateRenderer } from './types';

export const technobladeUltimateRenderer: UltimateRenderer = {
  characterId: 'technoblade',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.25, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Floating Golden Blood God Crown Aura above Technoblade!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.92);
      ctx.translate(owner.x, owner.y - owner.radius - 18 + Math.sin(t * 7) * 3);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.lineTo(-16, -6);
      ctx.lineTo(-8, 0);
      ctx.lineTo(0, -10);
      ctx.lineTo(8, 0);
      ctx.lineTo(16, -6);
      ctx.lineTo(16, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as TechnobladeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 16 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 45 + (1.3 - data.flash) * 230, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
