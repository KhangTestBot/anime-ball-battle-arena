import type { BakugoUltimateData } from '../../physics/ultimates/bakugo';
import type { UltimateRenderer } from './types';

export const bakugoUltimateRenderer: UltimateRenderer = {
  characterId: 'bakugo',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Swirling Nitroglycerin Howitzer Cyclone Ring around Bakugo
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 10);
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.moveTo(Math.cos(a) * (owner.radius + 8), Math.sin(a) * (owner.radius + 8));
      ctx.lineTo(
        Math.cos(a + 0.35) * (owner.radius + 34),
        Math.sin(a + 0.35) * (owner.radius + 34),
      );
    }
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as BakugoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Sizzling Nitroglycerin Cluster Sweat Beads awaiting detonation
    for (const sp of data.sparks) {
      if (sp.detonated) continue;
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Spiky Manga Blast Explosion Starburst on Howitzer Impact!
    if (owner && data.howitzerFlash > 0) {
      const p = Math.max(0, Math.min(1, data.howitzerFlash / 1.15));
      ctx.save();
      ctx.globalAlpha = p * 0.82;
      ctx.translate(owner.x, owner.y);
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        const rad = (i % 2 === 0 ? 175 : 88) * (1.15 - p * 0.25);
        if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
};
