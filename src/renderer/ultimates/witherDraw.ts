import type { WitherUltimateData } from '../../physics/ultimates/wither';
import type { UltimateRenderer } from './types';

export const witherUltimateRenderer: UltimateRenderer = {
  characterId: 'wither',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as WitherUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    const fadeIn = Math.min(1, state.elapsed / 0.3);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(owner.x, owner.y);

    // 1. 3 Rotating Conical Purple Tractor Beams sweeping across the arena!
    const beamRange = 275;
    const halfCone = 0.31;
    for (let b = 0; b < 3; b++) {
      const a = data.beamAngle + (b * Math.PI * 2) / 3;
      ctx.save();
      ctx.rotate(a);
      const grad = ctx.createLinearGradient(0, 0, beamRange, 0);
      grad.addColorStop(0, 'rgba(192, 132, 252, 0.56)');
      grad.addColorStop(0.65, 'rgba(126, 34, 206, 0.28)');
      grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, beamRange, -halfCone, halfCone);
      ctx.closePath();
      ctx.fill();

      // Subtle glowing cone edge rails
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(-halfCone) * beamRange, Math.sin(-halfCone) * beamRange);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(halfCone) * beamRange, Math.sin(halfCone) * beamRange);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Flying Voxel Dirt/Stone Debris Cubes visibly sucked inward!
    for (const v of data.voxels) {
      const vx = Math.cos(v.angle) * v.dist;
      const vy = Math.sin(v.angle) * v.dist;
      ctx.fillStyle = v.color;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.2;
      ctx.fillRect(vx - v.size * 0.5, vy - v.size * 0.5, v.size, v.size);
      ctx.strokeRect(vx - v.size * 0.5, vy - v.size * 0.5, v.size, v.size);
    }

    // 3. 3 Undulating Blocky Obsidian Wither Storm Tentacles!
    for (let tent = 0; tent < 3; tent++) {
      const baseA = data.beamAngle + (tent * Math.PI * 2) / 3 + Math.PI / 3;
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      for (let seg = 1; seg <= 4; seg++) {
        const sway = Math.sin(t * 7 + tent * 2 + seg * 0.8) * 0.14;
        const sa = baseA + sway;
        const dist = owner.radius + 8 + seg * 16;
        const sz = 13 - seg * 1.6;
        ctx.fillRect(Math.cos(sa) * dist - sz * 0.5, Math.sin(sa) * dist - sz * 0.5, sz, sz);
        ctx.strokeRect(Math.cos(sa) * dist - sz * 0.5, Math.sin(sa) * dist - sz * 0.5, sz, sz);
      }
    }

    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as WitherUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    ctx.save();
    ctx.translate(owner.x, owner.y);

    // 1. Pulsing Orange-Cyan Minecraft Command Block Core right on Wither Storm!
    const pulse = 1 + Math.sin(t * 14) * 0.1;
    const cs = 11 * pulse;
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.fillRect(-cs, -cs - owner.radius - 10, cs * 2, cs * 2);
    ctx.strokeRect(-cs, -cs - owner.radius - 10, cs * 2, cs * 2);
    // Inner glowing Command Block indicator pixels (cyan/yellow/green)
    ctx.fillStyle = Math.floor(t * 12) % 2 === 0 ? '#22d3ee' : '#facc15';
    ctx.fillRect(-4, -owner.radius - 14, 8, 8);

    // 2. Classic Shimmering Blue-White Minecraft Wither Armor Shell (blocks ranged projectiles!)
    if (data.witherArmorTimer > 0) {
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.setLineDash([7, 5]);
      ctx.lineDashOffset = -t * 60;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },
};
