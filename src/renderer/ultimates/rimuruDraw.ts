import type { RimuruUltimateData } from '../../physics/ultimates/rimuru';
import type { UltimateRenderer } from './types';

export const rimuruUltimateRenderer: UltimateRenderer = {
  characterId: 'rimuru',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as RimuruUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 1. Azathoth Swirling Black-Teal Predation Cone + 360° Ciel Auto-Predation Matrix!
    if (!data.beamFired) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // 360° Raphael / Ciel cyan-purple Predation Halo around Rimuru
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.52)';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 68, t * 3, t * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.rotate(data.coneAngle);
      const grad = ctx.createRadialGradient(0, 0, 12, 0, 0, data.coneRange);
      grad.addColorStop(0, 'rgba(9, 9, 11, 0.88)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.38)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, data.coneRange, -0.82, 0.82);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.78)';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Liquid oscillating Slime Viscosity halo + Veldora lightning ring!
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const a = (i * Math.PI * 2) / 20;
        const wr = owner.radius + 11 + Math.sin(a * 4 + t * 11) * 4;
        const px = Math.cos(a) * wr;
        const py = Math.sin(a) * wr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as RimuruUltimateData;
    const enemies = fighters.filter(
      (f) =>
        f.alive && f.uid !== state.ownerUid && (state.teamId === null || f.teamId !== state.teamId),
    );

    // 1. Ciel Hexagonal Analysis Grid Scanning Enemies!
    if (!data.beamFired) {
      for (const e of enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.78)';
        ctx.lineWidth = 1.8;
        const r = e.radius + 11;
        ctx.beginPath();
        for (let h = 0; h < 6; h++) {
          const a = (h * Math.PI * 2) / 6;
          if (h === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#67e8f9';
        ctx.font = '800 8.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CIEL LOCK', 0, -r - 4);
        ctx.restore();
      }
    }

    // 2. Consolidated Void God Azathoth: TURN NULL Destruction Beam!
    if (data.beamFired && data.beamTimer > 0) {
      const a = Math.max(0, Math.min(1, data.beamTimer / 0.95));
      const boostW = 34 + data.devouredCount * 4.5;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = boostW + 16;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(data.beamX1, data.beamY1);
      ctx.lineTo(data.beamX2, data.beamY2);
      ctx.stroke();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = boostW * 0.7;
      ctx.stroke();

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = boostW * 0.35;
      ctx.stroke();
      ctx.restore();
    }
  },
};
