import type { NatsuUltimateData } from '../../physics/ultimates/natsu';
import type { UltimateRenderer } from './types';

export const natsuUltimateRenderer: UltimateRenderer = {
  characterId: 'natsu',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.25);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // Swirling Fire Dragon Slayer aura sucking in flames around Natsu
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.78);
      ctx.translate(owner.x, owner.y);
      ctx.rotate(t * 7);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      for (let i = 0; i < 3; i++) {
        const start = (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, 88, start, start + 1.25);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state) {
    const data = state.data as unknown as NatsuUltimateData;
    if (data.fistFlash <= 0) return;

    const a = Math.min(1, data.fistFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(data.fistX, data.fistY);
    // Fire Dragon King's Demolition Fist blazing crimson-gold inferno burst!
    const r = 45 + (1.25 - data.fistFlash) * 160;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 14 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 5 * a;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
