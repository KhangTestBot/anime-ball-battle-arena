import type { LuffyUltimateData } from '../../physics/ultimates/luffy';
import type { UltimateRenderer } from './types';

export const luffyUltimateRenderer: UltimateRenderer = {
  characterId: 'luffy',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as LuffyUltimateData;
    const { left, top, right, bottom } = bounds;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. Toon Force Elastic Rubber Arena Walls (visibly bow outward via Bezier flex!)
    ctx.save();
    ctx.globalAlpha = 0.85 * fade;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#f8fafc';
    ctx.shadowBlur = 14;

    const getFlex = (side: 'left' | 'right' | 'top' | 'bottom') =>
      data.wallFlexes.find((f) => f.side === side);

    // Top rubber wall
    const topF = getFlex('top');
    ctx.beginPath();
    ctx.moveTo(left + 4, top + 4);
    ctx.quadraticCurveTo(
      topF ? topF.pos : (left + right) / 2,
      top + 4 - (topF ? Math.sin(t * 32) * 18 * topF.strength : Math.sin(t * 7) * 3),
      right - 4,
      top + 4,
    );
    ctx.stroke();

    // Bottom rubber wall
    const botF = getFlex('bottom');
    ctx.beginPath();
    ctx.moveTo(left + 4, bottom - 4);
    ctx.quadraticCurveTo(
      botF ? botF.pos : (left + right) / 2,
      bottom - 4 + (botF ? Math.sin(t * 32) * 18 * botF.strength : Math.sin(t * 7) * 3),
      right - 4,
      bottom - 4,
    );
    ctx.stroke();

    // Left rubber wall
    const leftF = getFlex('left');
    ctx.beginPath();
    ctx.moveTo(left + 4, top + 4);
    ctx.quadraticCurveTo(
      left + 4 - (leftF ? Math.sin(t * 32) * 18 * leftF.strength : Math.sin(t * 7) * 3),
      leftF ? leftF.pos : (top + bottom) / 2,
      left + 4,
      bottom - 4,
    );
    ctx.stroke();

    // Right rubber wall
    const rightF = getFlex('right');
    ctx.beginPath();
    ctx.moveTo(right - 4, top + 4);
    ctx.quadraticCurveTo(
      right - 4 + (rightF ? Math.sin(t * 32) * 18 * rightF.strength : Math.sin(t * 7) * 3),
      rightF ? rightF.pos : (top + bottom) / 2,
      right - 4,
      bottom - 4,
    );
    ctx.stroke();
    ctx.restore();

    // 2. Growing Giant Dark Haki Bajrang Gun Ground Shadow (1.15s warning!)
    if (!data.bajrangSlammed) {
      const prog = Math.max(0.15, Math.min(1, 1 - data.bajrangTimer / 1.15));
      const curR = data.bajrangRadius * prog;
      ctx.save();
      ctx.translate(data.bajrangX, data.bajrangY);
      ctx.fillStyle = `rgba(9, 9, 11, ${0.28 + prog * 0.38})`;
      ctx.beginPath();
      ctx.arc(0, 0, curR, 0, Math.PI * 2);
      ctx.fill();

      // Crimson Conqueror's Haki warning rim
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3 + prog * 3;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, data.bajrangRadius, t * 2, t * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as LuffyUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Sun God Nika White Cloud Hagoromo Scarf swirling around Luffy!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 11, t * 5, t * 5 + Math.PI * 1.35);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Colossal Haki-Coated Bajrang Gun Fist Slam Visual!
    if (data.bajrangSlammed && data.slamFlashTimer > 0) {
      const a = Math.max(0, Math.min(1, data.slamFlashTimer / 0.75));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(data.bajrangX, data.bajrangY);

      // Massive black-crimson Armament Haki Fist Silhouette
      const r = data.bajrangRadius * 0.74;
      const fistGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
      fistGrad.addColorStop(0, '#3f3f46');
      fistGrad.addColorStop(0.55, '#18181b');
      fistGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = fistGrad;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.roundRect(-r, -r * 0.82, r * 2, r * 1.64, r * 0.45);
      ctx.fill();
      ctx.stroke();

      // 4 Giant Knuckle ridges
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      for (let k = -1.5; k <= 1.5; k += 1) {
        ctx.beginPath();
        ctx.arc(k * r * 0.42, -r * 0.22, r * 0.22, Math.PI * 0.9, Math.PI * 2.1);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
