import type { SaberUltimateData } from '../../physics/ultimates/saber';
import type { UltimateRenderer } from './types';

export const saberUltimateRenderer: UltimateRenderer = {
  characterId: 'saber',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as SaberUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    ctx.save();
    if (data.stage === 'avalon') {
      // Golden Celtic Scabbard Sanctuary Dome around Artoria
      const r = owner.radius + 54;
      const grad = ctx.createRadialGradient(owner.x, owner.y, r * 0.25, owner.x, owner.y, r);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.08)');
      grad.addColorStop(0.75, 'rgba(250, 204, 21, 0.28)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0.55)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Celtic diamond cross inlays
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(t * 1.4);
      ctx.strokeStyle = 'rgba(254, 249, 195, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-r * 0.55, -r * 0.55, r * 1.1, r * 1.1);
      ctx.restore();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as SaberUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Swirling Invisible Air emerald-gold wind strips
    if (owner && data.stage === 'avalon') {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.6;
      for (let i = 0; i < 3; i++) {
        const a = data.windAngle + (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, owner.radius + 26 + i * 8, a, a + 1.35);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Colossal Golden EXCALIBUR Holy Starlight Pillar!
    if (data.stage === 'excalibur' && data.beamTimer > 0) {
      const a = Math.max(0, Math.min(1, data.beamTimer / 1.45));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 86 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.moveTo(data.beamX1, data.beamY1);
      ctx.lineTo(data.beamX2, data.beamY2);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 48 * a;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 20 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
