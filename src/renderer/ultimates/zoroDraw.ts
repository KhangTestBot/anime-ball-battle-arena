import type { ZoroUltimateData } from '../../physics/ultimates/zoro';
import type { UltimateRenderer } from './types';

export const zoroUltimateRenderer: UltimateRenderer = {
  characterId: 'zoro',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ZoroUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. 3-Headed 6-Armed Ashura Phantom Silhouette + King of Hell Emerald-Violet Aura!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // Conqueror's Haki dark emerald-violet smoke rings
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.55)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#16a34a';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 26, 0, Math.PI * 2);
      ctx.stroke();

      // 6 Silhouette Ghost Arms holding 6 Enma swords behind Zoro!
      for (let arm = 0; arm < 6; arm++) {
        const side = arm < 3 ? -1 : 1;
        const slot = arm % 3;
        const ang = (slot - 1) * 0.42 + Math.sin(t * 7 + arm) * 0.06;
        ctx.save();
        ctx.scale(side, 1);
        ctx.rotate(ang);
        // Translucent demon arm
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.42)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(owner.radius * 0.4, 0);
        ctx.lineTo(owner.radius + 26, -6);
        ctx.stroke();
        // Glowing blade silhouette
        ctx.strokeStyle = 'rgba(187, 247, 208, 0.72)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(owner.radius + 22, -6);
        ctx.lineTo(owner.radius + 48, -14);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // 2. Straight-line Blitz Telegraph during Ashura stance
    if (data.stage === 'stance') {
      ctx.save();
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.78)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(data.dashX, data.dashY);
      ctx.lineTo(data.dashEndX, data.dashEndY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as ZoroUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. 9 Gleaming Enma Katanas Orbiting in Dual Rings (inner 3, outer 6)
    if (owner) {
      for (let i = 0; i < 9; i++) {
        const isInner = i < 3;
        const r = owner.radius + (isInner ? 24 : 44);
        const speedMult = isInner ? 1.4 : -1.0;
        const ang = data.orbitAngle * speedMult + (i * Math.PI * 2) / (isInner ? 3 : 6);
        const sx = owner.x + Math.cos(ang) * r;
        const sy = owner.y + Math.sin(ang) * r;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = isInner ? '#bbf7d0' : '#4ade80';
        ctx.strokeStyle = '#7e22ce';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(13, 0);
        ctx.lineTo(-10, -2.8);
        ctx.lineTo(-10, 2.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Delayed Ashura X-Slashes ("Chém xong tra kiếm mới bung!")
    for (const cut of data.delayedCuts) {
      ctx.save();
      ctx.translate(cut.x, cut.y);
      if (!cut.detonated) {
        // Subtle green hairline lock X before sheathe snap!
        ctx.strokeStyle = '#bbf7d0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-22, -22);
        ctx.lineTo(22, 22);
        ctx.moveTo(22, -22);
        ctx.lineTo(-22, 22);
        ctx.stroke();
      } else {
        const a = Math.max(0, Math.min(1, cut.fadeTimer / 0.65));
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 8 * a;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(-58, -58);
        ctx.lineTo(58, 58);
        ctx.moveTo(58, -58);
        ctx.lineTo(-58, 58);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 * a;
        ctx.beginPath();
        ctx.moveTo(-64, -64);
        ctx.lineTo(64, 64);
        ctx.moveTo(64, -64);
        ctx.lineTo(-64, 64);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
