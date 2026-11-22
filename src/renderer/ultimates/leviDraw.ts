import type { LeviUltimateData } from '../../physics/ultimates/levi';
import type { UltimateRenderer } from './types';

export const leviUltimateRenderer: UltimateRenderer = {
  characterId: 'levi',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as LeviUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Taut Steel ODM Grappling Wires anchored directly to arena borders!
    if (owner && !data.snapped && data.zipsLeft > 0) {
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#94a3b8';
      ctx.shadowBlur = 6;
      for (const cable of data.cables) {
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(cable.ax, cable.ay);
        ctx.stroke();

        // Steel grappling hook anchored on the wall!
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cable.ax, cable.ay, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Pressurized ODM Gas Steam Plumes at every Z-turn!
    for (const puff of data.steamPuffs) {
      const a = Math.max(0, Math.min(1, puff.life / 0.65));
      ctx.save();
      ctx.globalAlpha = a * 0.65;
      ctx.translate(puff.x, puff.y);
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 10, Math.sin(ang) * 10, 12 * (1.2 - a * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as LeviUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner || data.snapped || data.zipsLeft <= 0) return;

    // Blinding Beyblade Twin-Snap-Blade Spin Saw-Ring around Levi!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 28);
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 4.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 17, 0, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 17, Math.PI, Math.PI * 1.85);
    ctx.stroke();

    // Twin box-cutter steel snap blades sticking tangentially outward!
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    for (const side of [0, Math.PI]) {
      ctx.save();
      ctx.rotate(side);
      ctx.fillRect(owner.radius + 8, -3, 22, 6);
      ctx.strokeRect(owner.radius + 8, -3, 22, 6);
      ctx.restore();
    }
    ctx.restore();
  },
};
