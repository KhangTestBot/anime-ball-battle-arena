import type { SasukeUltimateData } from '../../physics/ultimates/sasuke';
import type { UltimateRenderer } from './types';

export const sasukeUltimateRenderer: UltimateRenderer = {
  characterId: 'sasuke',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as SasukeUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Inextinguishable Amaterasu Black Flame Patches (pitch-black ink core + violet-crimson aura!)
    for (const p of data.amaterasuPatches) {
      const a = Math.min(1, p.life / 0.5);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      // Outer crimson-violet fire rim
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Writhing pitch-black Amaterasu flames
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < 14; i++) {
        const ang = (i * Math.PI * 2) / 14 + t * 2.5;
        const wob = p.radius * (0.68 + Math.sin(t * 14 + i * 2) * 0.16);
        const fx = Math.cos(ang) * wob;
        const fy = Math.sin(ang) * wob;
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Towering Purple PERFECT SUSANOO Ribcage & Wings around Sasuke!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.82)';
      ctx.fillStyle = 'rgba(147, 51, 234, 0.22)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 18;

      // Twin angular Susanoo Wings
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * (owner.radius + 4), -8);
        ctx.lineTo(side * (owner.radius + 48), -32 + Math.sin(t * 8) * 5);
        ctx.lineTo(side * (owner.radius + 36), 8);
        ctx.lineTo(side * (owner.radius + 54), 18);
        ctx.lineTo(side * (owner.radius + 10), 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Susanoo armored ribs circle
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as SasukeUltimateData;

    // 1. 6-Tomoe Rinnegan Portal Ring at Amenotejikara Swap Point!
    if (data.swapFlashTimer > 0) {
      const a = Math.max(0, Math.min(1, data.swapFlashTimer / 0.75));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(data.swapFlashX, data.swapFlashY);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.6;
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath();
        ctx.arc(0, 0, ring * 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      // 6 Tomoe dots spinning
      ctx.fillStyle = '#09090b';
      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI * 2) / 6 + t * 5;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 30, Math.sin(ang) * 30, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. INDRA'S ARROW: Purple Lightning Bow Telegraph -> Piercing Thunderbolt Beam!
    const arrow = data.arrow;
    if (arrow.active && !arrow.fired) {
      // Glowing purple aim telegraph line + Susanoo Bow arc
      ctx.save();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.78)';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(arrow.x1, arrow.y1);
      ctx.lineTo(arrow.x2, arrow.y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Susanoo Lightning Bow drawn in front of Sasuke
      ctx.translate(arrow.x1, arrow.y1);
      ctx.rotate(arrow.angle);
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(12, 0, 38, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      ctx.restore();
    } else if (arrow.fired && arrow.flashTimer > 0) {
      const a = Math.max(0, Math.min(1, arrow.flashTimer / 0.68));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 26 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(arrow.x1, arrow.y1);
      ctx.lineTo(arrow.x2, arrow.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 9 * a;
      ctx.beginPath();
      ctx.moveTo(arrow.x1, arrow.y1);
      ctx.lineTo(arrow.x2, arrow.y2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
