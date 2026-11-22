import type { NanamiUltimateData } from '../../physics/ultimates/nanami';
import type { UltimateRenderer } from './types';

export const nanamiUltimateRenderer: UltimateRenderer = {
  characterId: 'nanami',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as NanamiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (owner && data.collapseFlash > 0) {
      const a = Math.max(0, Math.min(1, data.collapseFlash));
      ctx.save();
      ctx.globalAlpha = a * 0.7;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 8 * a;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + (1 - a) * 185, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as NanamiUltimateData;
    const target = data.targetUid
      ? fighters.find((f) => f.uid === data.targetUid && f.alive)
      : null;

    // Iconic 10-Division Scale Bar locking the exact 7:3 Ratio Weak Point over enemy!
    if (target && !data.collapsed) {
      ctx.save();
      ctx.translate(target.x, target.y - target.radius - 20);
      const barW = 70;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-barW / 2, -6, barW, 12);
      ctx.strokeRect(-barW / 2, -6, barW, 12);

      // 10-unit notches & glowing 7:3 Weakpoint bracket!
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 10; i++) {
        const nx = -barW / 2 + (barW * i) / 10;
        ctx.beginPath();
        ctx.moveTo(nx, -6);
        ctx.lineTo(nx, 6);
        ctx.stroke();
      }
      const x73 = -barW / 2 + barW * 0.7;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x73 - 3, -8, 6, 16);
      ctx.restore();
    }
  },
};
