import type { ShinobuUltimateData } from '../../physics/ultimates/shinobu';
import type { UltimateRenderer } from './types';

export const shinobuUltimateRenderer: UltimateRenderer = {
  characterId: 'shinobu',

  drawBackdrop(ctx, state) {
    const data = state.data as unknown as ShinobuUltimateData;
    if (data.trailPts.length < 2) return;
    const alpha = Math.min(1, state.elapsed / 0.2, (state.duration - state.elapsed) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.72);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    data.trailPts.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as ShinobuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;
    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 6 * a;
    ctx.beginPath();
    ctx.arc(0, 0, 35 + (1 - a) * 120, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
