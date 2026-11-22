import type { EscanorUltimateData } from '../../physics/ultimates/escanor';
import type { UltimateRenderer } from './types';

export const escanorUltimateRenderer: UltimateRenderer = {
  characterId: 'escanor',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as EscanorUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // 12:00 HIGH NOON Lion's Pride Halo & Sundial behind Escanor
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const haloR = owner.radius + 36;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, haloR, 0, Math.PI * 2);
    ctx.stroke();

    // 12 Solar Clock Spikes
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12 + t * 0.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (haloR - 6), Math.sin(a) * (haloR - 6));
      ctx.lineTo(Math.cos(a) * (haloR + 10), Math.sin(a) * (haloR + 10));
      ctx.stroke();
    }

    // Advancing Sundial Clock Hand toward 12:00 (-PI/2)
    const handAng = -Math.PI + data.noonProgress * (Math.PI / 2);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(handAng) * haloR, Math.sin(handAng) * haloR);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☀ 12:00 THE ONE', 0, -haloR - 10);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as EscanorUltimateData;

    // 1. Hovering Boiling Plasma CRUEL SUN Orb
    if (data.sunActive) {
      ctx.save();
      ctx.translate(data.sunX, data.sunY);
      const grad = ctx.createRadialGradient(
        0,
        0,
        data.sunRadius * 0.2,
        0,
        0,
        data.sunRadius * 1.45,
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#fde047');
      grad.addColorStop(0.75, '#f97316');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, data.sunRadius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Flickering solar flare corona petals
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = t * 5 + (i * Math.PI) / 4;
        const flare = data.sunRadius + 8 + Math.sin(t * 14 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (data.sunRadius * 0.8), Math.sin(a) * (data.sunRadius * 0.8));
        ctx.lineTo(Math.cos(a) * flare, Math.sin(a) * flare);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Vertical DIVINE SWORD ESCANOR!! Chop Slashes
    if (data.chopFlash > 0) {
      const a = Math.max(0, Math.min(1, data.chopFlash));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 34 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(data.chopX, data.chopY - 190);
      ctx.lineTo(data.chopX, data.chopY + 150);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
