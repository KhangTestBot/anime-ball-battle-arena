import type { GiornoUltimateData } from '../../physics/ultimates/giorno';
import type { UltimateRenderer } from './types';

export const giornoUltimateRenderer: UltimateRenderer = {
  characterId: 'giorno',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Gold-Jade Requiem Mandala + 8 Spinning Chrono-Petals around Giorno
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 1.4);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.72)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 42, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(253, 224, 71, 0.25)' : 'rgba(52, 211, 153, 0.25)';
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(a) * (owner.radius + 26),
        Math.sin(a) * (owner.radius + 26),
        11,
        5,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as GiornoUltimateData;

    // 1. Snapshot Origin Zero Markers & Dashed Rewind Tether Lines
    if (!data.returnedToZero || data.zeroFlash > 0) {
      for (const snap of data.snapshots) {
        const enemy = fighters.find((f) => f.uid === snap.uid && f.alive);
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        if (enemy) {
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y);
          ctx.lineTo(snap.x, snap.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(snap.x, snap.y, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('∅ ZERO', snap.x, snap.y - 22);
        ctx.restore();
      }
    }

    // 2. Blazing Return-to-Zero Golden Flash Wave
    if (data.zeroFlash > 0) {
      const owner = fighters.find((f) => f.uid === state.ownerUid);
      if (owner) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, data.zeroFlash * 0.6);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, 80 + (1 - data.zeroFlash) * 260, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  },
};
