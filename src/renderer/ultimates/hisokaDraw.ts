import type { HisokaUltimateData } from '../../physics/ultimates/hisoka';
import type { UltimateRenderer } from './types';

export const hisokaUltimateRenderer: UltimateRenderer = {
  characterId: 'hisoka',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Swirling Magician Suit Emblem Halo (♠ ♥ ♦ ♣) around Hisoka
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 2.2);
    const suits = ['♠', '♥', '♦', '♣'];
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      ctx.fillStyle = i % 2 === 0 ? '#ec4899' : '#38bdf8';
      ctx.fillText(suits[i], Math.cos(a) * (owner.radius + 22), Math.sin(a) * (owner.radius + 22));
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as HisokaUltimateData;

    // Neon-Pink Stretchy Elastic BUNGEE GUM Cords connecting Hisoka & Tethered Targets!
    for (const anc of data.anchors) {
      if (anc.snapped) continue;
      const target = fighters.find((f) => f.uid === anc.targetUid && f.alive);
      if (!target) continue;

      ctx.save();
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 4;
      const mx = (anc.anchorX + target.x) / 2 + Math.sin(t * 14) * 14;
      const my = (anc.anchorY + target.y) / 2 + Math.cos(t * 14) * 14;
      ctx.beginPath();
      ctx.moveTo(anc.anchorX, anc.anchorY);
      ctx.quadraticCurveTo(mx, my, target.x, target.y);
      ctx.stroke();

      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
