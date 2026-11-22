import type { YamamotoUltimateData } from '../../physics/ultimates/yamamoto';
import type { UltimateRenderer } from './types';

export const yamamotoUltimateRenderer: UltimateRenderer = {
  characterId: 'yamamoto',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 15,000,000-Degree West Sun Cloak (Zanjitsu Gokui) blazing around Yamamoto!
    ctx.save();
    const grad = ctx.createRadialGradient(
      owner.x,
      owner.y,
      owner.radius * 0.4,
      owner.x,
      owner.y,
      owner.radius + 54,
    );
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    grad.addColorStop(0.55, 'rgba(249, 115, 22, 0.35)');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 54 + Math.sin(t * 16) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as YamamotoUltimateData;

    // 1. Burnt Ash Skeleton Soldiers rising from South: Kaka Jumanokushi
    for (const sk of data.skeletons) {
      const a = Math.max(0, Math.min(1, sk.life / 2.3));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(sk.x, sk.y);
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -6, 2.5, 2.5);
      ctx.fillRect(1.5, -6, 2.5, 2.5);
      ctx.restore();
    }

    // 2. North: TENCHI KAIJIN Blistering White-Orange Solar Ash Slash!
    if (data.tenchiFlash > 0) {
      const a = Math.max(0, Math.min(1, data.tenchiFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 68 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 18 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
