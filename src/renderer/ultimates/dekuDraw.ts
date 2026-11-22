import type { DekuUltimateData } from '../../physics/ultimates/deku';
import type { UltimateRenderer } from './types';

export const dekuUltimateRenderer: UltimateRenderer = {
  characterId: 'deku',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as DekuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Jagged Black-Emerald BLACKWHIP Tendril connecting Deku to Low-Gear Target!
    if (owner && data.whipVisualTimer > 0) {
      const a = Math.max(0, Math.min(1, data.whipVisualTimer / 0.65));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(owner.x, owner.y);
      ctx.quadraticCurveTo(
        (owner.x + data.whipTargetX) * 0.5 + 22,
        (owner.y + data.whipTargetY) * 0.5 - 24,
        data.whipTargetX,
        data.whipTargetY,
      );
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as DekuUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Gearshift Tachometer + Fa Jin Charge Gauge beside Deku!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // Emerald Full Cowling Bio-Lightning Sparks
      if (data.stage === 'overdrive') {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI * 2) / 8 + t * 9;
          const r1 = owner.radius + 4;
          const r2 = owner.radius + 14 + ((i + Math.floor(t * 20)) % 3) * 4;
          ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
          ctx.lineTo(Math.cos(ang + 0.12) * r2, Math.sin(ang + 0.12) * r2);
        }
        ctx.stroke();
      }

      // Crisp Gear & Fa Jin RPM readout pill
      const badgeText =
        data.stage === 'recoil'
          ? 'LOW GEAR · O2'
          : `TOP GEAR · FA JIN ${Math.round(data.faJinCharge)}%`;
      ctx.fillStyle = data.stage === 'recoil' ? '#f97316' : '#34d399';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.5;
      ctx.font = '900 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText(badgeText, 0, -owner.radius - 16);
      ctx.fillText(badgeText, 0, -owner.radius - 16);
      ctx.restore();
    }

    // 2. LOW GEAR Crimson Speed-Slow Gauge above snagged victim!
    if (data.lowGearTimer > 0 && data.lowGearUid) {
      const victim = fighters.find((f) => f.uid === data.lowGearUid && f.alive);
      if (victim) {
        ctx.save();
        ctx.translate(victim.x, victim.y);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, victim.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '900 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GEAR 1 (25%)', 0, victim.radius + 16);
        ctx.restore();
      }
    }

    // 3. Halftone Comic "SMASH!" Pressure Burst on Detroit Smash 120%!
    if (data.stage === 'detroit-smashed' && data.smashFlash > 0) {
      const a = Math.max(0, Math.min(1, data.smashFlash / 0.8));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(data.smashX, data.smashY);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 7 * a;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI * 2) / 16;
        const rad = i % 2 === 0 ? 155 : 95;
        if (i === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 4;
      ctx.font = 'italic 900 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText('SMASH!!', 0, -40);
      ctx.fillText('SMASH!!', 0, -40);
      ctx.restore();
    }
  },
};
