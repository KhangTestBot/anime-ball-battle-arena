import type { KaidoUltimateData } from '../../physics/ultimates/kaido';
import type { UltimateRenderer } from './types';

export const kaidoUltimateRenderer: UltimateRenderer = {
  characterId: 'kaido',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KaidoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Azure Homura-gumo (Flame Cloud) rings rotating under Kaido
    ctx.save();
    const isFlameDragon = data.phase === 'kaen-daiko';
    const ringColor = isFlameDragon ? 'rgba(249, 115, 22, 0.38)' : 'rgba(56, 189, 248, 0.28)';
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 6;
    for (let i = 0; i < 6; i++) {
      const a = t * 2.8 + (i * Math.PI * 2) / 6;
      const rx = owner.x + Math.cos(a) * (owner.radius + 22);
      const ry = owner.y + Math.sin(a) * (owner.radius + 22);
      ctx.beginPath();
      ctx.arc(rx, ry, 11 + Math.sin(t * 6 + i) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KaidoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Phase 1: Drunken Dragon ("WORORORO") wobble indicator
    if (data.phase === 'drunk-dodge') {
      ctx.save();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(
        owner.x + Math.cos(t * 14) * 5,
        owner.y + Math.sin(t * 14) * 5,
        owner.radius + 14,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();
    }

    // Phase 2: Sweeping BORO BREATH fiery cone
    if (data.phase === 'boro-breath') {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.breath.angle);

      const grad = ctx.createLinearGradient(0, 0, 360, 0);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.92)');
      grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.72)');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0.08)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(owner.radius * 0.6, 0);
      ctx.lineTo(360, -52);
      ctx.lineTo(360, 52);
      ctx.closePath();
      ctx.fill();

      // Core blast beam & roaring thermal rings
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(owner.radius * 0.7, 0);
      ctx.lineTo(340, 0);
      ctx.stroke();

      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2.5;
      for (let i = 1; i <= 4; i++) {
        const d = i * 76 + ((t * 180) % 76);
        if (d < 350) {
          ctx.beginPath();
          ctx.ellipse(d, 0, 8, 12 + d * 0.1, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Phase 3: KAEN DAIKO — Colossal Flame Bagua Dragon Silhouette enveloping Kaido!
    if (data.phase === 'kaen-daiko') {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      const heading =
        Math.hypot(owner.vx, owner.vy) > 40 ? Math.atan2(owner.vy, owner.vx) : owner.facingAngle;
      ctx.rotate(heading);

      const cloakR = owner.radius + 26;
      ctx.fillStyle = 'rgba(234, 88, 12, 0.34)';
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 22;

      // Dragon snout & horns facing velocity!
      ctx.beginPath();
      ctx.moveTo(cloakR + 30, 0);
      ctx.lineTo(cloakR - 4, -cloakR * 0.88);
      ctx.lineTo(-cloakR * 1.1, -cloakR * 0.62);
      ctx.lineTo(-cloakR * 1.35, 0);
      ctx.lineTo(-cloakR * 1.1, cloakR * 0.62);
      ctx.lineTo(cloakR - 4, cloakR * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blazing dragon eyes + curved horns
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cloakR * 0.35, -13, 4.5, 0, Math.PI * 2);
      ctx.arc(cloakR * 0.35, 13, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -cloakR * 0.65);
      ctx.quadraticCurveTo(-24, -cloakR - 14, -46, -cloakR + 4);
      ctx.moveTo(0, cloakR * 0.65);
      ctx.quadraticCurveTo(-24, cloakR + 14, -46, cloakR - 4);
      ctx.stroke();
      ctx.restore();
    }
  },
};
