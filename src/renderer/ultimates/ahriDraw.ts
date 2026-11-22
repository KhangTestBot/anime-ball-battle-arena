import type { AhriUltimateData } from '../../physics/ultimates/ahri';
import type { UltimateRenderer } from './types';

export const ahriUltimateRenderer: UltimateRenderer = {
  characterId: 'ahri',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as AhriUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Spirit Rush Sakura & Spirit Trail ribbons
    for (const tr of data.dashTrails) {
      const a = Math.max(0, Math.min(1, tr.life / 0.55));
      ctx.save();
      ctx.globalAlpha = a * 0.78;
      const g = ctx.createLinearGradient(tr.x1, tr.y1, tr.x2, tr.y2);
      g.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
      g.addColorStop(0.5, 'rgba(236, 72, 153, 0.75)');
      g.addColorStop(1, 'rgba(56, 189, 248, 0.9)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 14 * a;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Translucent 9-Tailed Spirit Fan fanning out behind Ahri!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(owner.facingAngle + Math.PI);
      for (let i = 0; i < 9; i++) {
        const spread = ((i - 4) / 4) * 1.15;
        const sway = Math.sin(t * 9 + i * 0.7) * 0.08;
        ctx.save();
        ctx.rotate(spread + sway);
        const tailLen = owner.radius * 2.25;
        const g = ctx.createLinearGradient(0, 0, tailLen, 0);
        g.addColorStop(0, 'rgba(244, 114, 182, 0.48)');
        g.addColorStop(0.55, 'rgba(56, 189, 248, 0.32)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(owner.radius * 0.5, 0);
        ctx.quadraticCurveTo(tailLen * 0.55, -10, tailLen, 0);
        ctx.quadraticCurveTo(tailLen * 0.55, 10, owner.radius * 0.5, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as AhriUltimateData;

    // 1. Glowing Pink Winged Charm Heart Projectile!
    if (data.heart.active) {
      const h = data.heart;
      ctx.save();
      ctx.translate(h.x, h.y);
      const pulse = 1 + Math.sin(t * 22) * 0.12;
      ctx.scale(pulse, pulse);
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(-15, -2, -13, -15, 0, -6);
      ctx.bezierCurveTo(13, -15, 15, -2, 0, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Homing Cyan-White Spirit Rush Fox-Fire Wisps!
    for (const w of data.wisps) {
      ctx.save();
      ctx.translate(w.x, w.y);
      const ang = Math.atan2(w.vy, w.vx);
      ctx.rotate(ang);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.quadraticCurveTo(-2, -9, -14, 0);
      ctx.quadraticCurveTo(-2, 9, 12, 0);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
