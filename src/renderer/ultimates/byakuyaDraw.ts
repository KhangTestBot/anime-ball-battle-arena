import type { ByakuyaUltimateData } from '../../physics/ultimates/byakuya';
import type { UltimateRenderer } from './types';

export const byakuyaUltimateRenderer: UltimateRenderer = {
  characterId: 'byakuya',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as ByakuyaUltimateData;
    if (data.stage !== 'senkei-ring') return;

    // Senkei Circular Pink-Violet Cherry Blossom Domain Ring
    ctx.save();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
    ctx.lineWidth = 3.2;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -t * 32;
    ctx.beginPath();
    ctx.arc(data.ringX, data.ringY, data.ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ByakuyaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. 12 Floating Vertical SENKEI Swords lining the Domain Perimeter!
    if (data.stage === 'senkei-ring') {
      for (let i = 0; i < data.swords.length; i++) {
        const sw = data.swords[i];
        ctx.save();
        ctx.translate(sw.x, sw.y + Math.sin(t * 5 + i) * 3);
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.6;
        ctx.fillRect(-2.5, -14, 5, 28);
        ctx.strokeRect(-2.5, -14, 5, 28);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-6, -15, 12, 3);
        ctx.restore();
      }
    }

    // 2. White Emperor Winged Sword (SHUKEI: HAKUTEIKEN!!) Wings & Halo!
    if (owner && (data.stage === 'hakuteiken' || data.hakuteiFlash > 0)) {
      const a = Math.max(0.35, Math.min(1, data.hakuteiFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(owner.x, owner.y);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 22;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 12, 0);
        ctx.lineTo(side * 72, -38);
        ctx.lineTo(side * 66, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
