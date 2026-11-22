import type { DenjiUltimateData } from '../../physics/ultimates/denji';
import type { UltimateRenderer } from './types';

export const denjiUltimateRenderer: UltimateRenderer = {
  characterId: 'denji',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as DenjiUltimateData;

    // 1. Juicy Crimson Blood Drops splattered on the arena floor (Blood Fuel!)
    for (const drop of data.bloodDrops) {
      const a = Math.min(1, drop.life / 0.4);
      const pulse = 1 + Math.sin(t * 10 + drop.x) * 0.12;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(drop.x, drop.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(9, 0, 0, 9);
      ctx.quadraticCurveTo(-9, 0, 0, -10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as DenjiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 1. Ripcord Chainsaw Hook / Tether Chain Link connecting Denji to prey!
    if (data.hookFlying) {
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.lineTo(data.hookX, data.hookY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(data.hookX, data.hookY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (data.tetheredUid && data.tetherTimer > 0) {
      const prey = fighters.find((f) => f.uid === data.tetheredUid && f.alive);
      if (prey) {
        ctx.save();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(prey.x, prey.y);
        ctx.stroke();

        // Spinning silver steel chain teeth along tether!
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 6]);
        ctx.lineDashOffset = -data.sawSpin * 2;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(prey.x, prey.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Enlarged Triple-Saw Full Devil Chainsaw Ring around Denji!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(data.sawSpin);
    const teeth = 16;
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    for (let i = 0; i < teeth; i++) {
      const a = (i * Math.PI * 2) / teeth;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(owner.radius + 2, -4);
      ctx.lineTo(owner.radius + 17, 1.5);
      ctx.lineTo(owner.radius + 2, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  },
};
