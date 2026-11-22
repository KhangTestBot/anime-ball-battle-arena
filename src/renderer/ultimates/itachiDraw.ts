import type { ItachiUltimateData } from '../../physics/ultimates/itachi';
import type { UltimateRenderer } from './types';

export const itachiUltimateRenderer: UltimateRenderer = {
  characterId: 'itachi',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as ItachiUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const cx = (bounds.left + bounds.right) / 2;
    const cy = (bounds.top + bounds.bottom) / 2;

    // Tsukuyomi Inverted Crimson Sky & Giant Red Full Moon!
    ctx.save();
    ctx.globalAlpha = fade * (data.stage === 'tsukuyomi-crows' ? 0.55 : 0.32);
    ctx.fillStyle = 'rgba(69, 10, 10, 0.52)';
    ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

    const moonR = Math.min(bounds.right - bounds.left, bounds.bottom - bounds.top) * 0.28;
    const moonGrad = ctx.createRadialGradient(cx, cy - 18, moonR * 0.15, cx, cy - 18, moonR);
    moonGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    moonGrad.addColorStop(0.75, 'rgba(185, 28, 28, 0.6)');
    moonGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 18, moonR, 0, Math.PI * 2);
    ctx.fill();

    // High-contrast monochrome cross gridlines of Tsukuyomi dimension
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.2;
    for (let x = bounds.left + 40; x < bounds.right; x += 65) {
      ctx.beginPath();
      ctx.moveTo(x, bounds.top);
      ctx.lineTo(x, bounds.bottom);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as ItachiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Flying Tsukuyomi Crow Silhouettes
    for (let i = 0; i < data.crows.length; i++) {
      const c = data.crows[i];
      const ang = Math.atan2(c.vy, c.vx);
      const flap = Math.sin(t * 22 + i * 1.4) * 7;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(ang);
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.quadraticCurveTo(0, -10 - flap, -10, -12 - flap);
      ctx.lineTo(-4, 0);
      ctx.quadraticCurveTo(0, 10 + flap, -10, 12 + flap);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Sharingan eye dot on crow head
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(5, -1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Crimson Armored Susanoo + Octagonal Yata Mirror Shield
    if (data.stage === 'totsuka-yata' && owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // Translucent Vermilion Susanoo Ribcage
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 16;
      const r = owner.radius + 16;
      for (let s = -1; s <= 1; s++) {
        ctx.beginPath();
        ctx.arc(0, s * 6, r + 4, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, s * 6, r + 4, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }

      // Octagonal Golden-Crimson Yata Mirror Shield in front
      ctx.rotate(owner.facingAngle);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let v = 0; v < 8; v++) {
        const a = (v * Math.PI * 2) / 8;
        const px = owner.radius + 20 + Math.cos(a) * 6;
        const py = Math.sin(a) * 26;
        if (v === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Ethereal Totsuka Gourd Seal Slash
    if (data.totsukaFlash > 0) {
      const a = Math.max(0, Math.min(1, data.totsukaFlash / 0.9));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 22 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(data.slashX1, data.slashY1);
      ctx.lineTo(data.slashX2, data.slashY2);
      ctx.stroke();

      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 7 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
