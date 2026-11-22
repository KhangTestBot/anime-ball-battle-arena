import type { YujiUltimateData } from '../../physics/ultimates/yuji';
import type { UltimateRenderer } from './types';

export const yujiUltimateRenderer: UltimateRenderer = {
  characterId: 'yuji',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crimson & Cyan Divergent Fist twin aura around Yuji
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 14 + Math.sin(t * 16) * 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 22, t * 8, t * 8 + Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as YujiUltimateData;

    // Black Flash 4-Spoked Pitch-Black & Crimson Spatial Distortion Stars!
    for (const b of data.bolts) {
      const a = Math.max(0, Math.min(1, b.life / 0.45));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(b.x, b.y);
      ctx.rotate(t * 10);

      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 20;
      const spikes = 4;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const ang = (i * Math.PI) / spikes;
        const rad = i % 2 === 0 ? 48 : 10;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
