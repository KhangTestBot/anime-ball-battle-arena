import type { ErzaUltimateData } from '../../physics/ultimates/erza';
import type { UltimateRenderer } from './types';

export const erzaUltimateRenderer: UltimateRenderer = {
  characterId: 'erza',

  drawBackdrop(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ErzaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (!owner || !owner.alive) return;

    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.85);
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.wheelAngle);

    // 12 Orbiting Heaven's Wheel silver-crimson blades
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.fillRect(62, -2.5, 24, 5);
      ctx.strokeRect(62, -2.5, 24, 5);
      ctx.restore();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters) {
    const data = state.data as unknown as ErzaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    const len = bounds.fullSize * 1.4;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 34 * a;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(
      owner.x + Math.cos(data.slashAngle) * len,
      owner.y + Math.sin(data.slashAngle) * len,
    );
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10 * a;
    ctx.beginPath();
    ctx.moveTo(owner.x, owner.y);
    ctx.lineTo(
      owner.x + Math.cos(data.slashAngle) * len,
      owner.y + Math.sin(data.slashAngle) * len,
    );
    ctx.stroke();
    ctx.restore();
  },
};
