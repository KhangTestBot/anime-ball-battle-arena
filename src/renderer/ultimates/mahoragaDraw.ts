import type { MahoragaUltimateData } from '../../physics/ultimates/mahoraga';
import type { UltimateRenderer } from './types';

export const mahoragaUltimateRenderer: UltimateRenderer = {
  characterId: 'mahoraga',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MahoragaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Giant Ornate 8-Handled Golden Dharma Wheel spinning behind Mahoraga!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.wheelAngle);

    const wheelR = owner.radius + 34;
    ctx.strokeStyle = '#eab308';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * wheelR * 0.42, Math.sin(a) * wheelR * 0.42);
      ctx.lineTo(Math.cos(a) * (wheelR + 12), Math.sin(a) * (wheelR + 12));
      ctx.stroke();

      ctx.fillStyle = i < data.adaptTurns ? '#fef08a' : '#ca8a04';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (wheelR + 14), Math.sin(a) * (wheelR + 14), 5.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as MahoragaUltimateData;

    // Blinding White-Gold-Crimson World-Cutting Spatial Rift Slash!
    if (data.slashFlash > 0) {
      const p = Math.max(0, Math.min(1, data.slashFlash / 1.35));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.strokeStyle = '#facc15';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 36 * p;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12 * p;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
