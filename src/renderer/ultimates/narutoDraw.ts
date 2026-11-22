import type { NarutoUltimateData } from '../../physics/ultimates/naruto';
import type { UltimateRenderer } from './types';

export const narutoUltimateRenderer: UltimateRenderer = {
  characterId: 'naruto',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as NarutoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Translucent Golden-Orange KURAMA AVATAR (9 Chakra Tails + Fox Ears!) wrapping Naruto!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      // 9 Swaying Chakra Tails
      for (let i = 0; i < 9; i++) {
        const ang = owner.facingAngle + Math.PI + ((i - 4) / 4) * 1.35 + Math.sin(t * 10 + i) * 0.1;
        ctx.save();
        ctx.rotate(ang);
        const len = owner.radius * 2.3;
        const g = ctx.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, 'rgba(251, 146, 60, 0.52)');
        g.addColorStop(0.7, 'rgba(250, 204, 21, 0.34)');
        g.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(owner.radius * 0.5, 0);
        ctx.quadraticCurveTo(len * 0.5, -11, len, 0);
        ctx.quadraticCurveTo(len * 0.5, 11, owner.radius * 0.5, 0);
        ctx.fill();
        ctx.restore();
      }

      // Towering translucent Kurama Fox Head Silhouette
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.78)';
      ctx.fillStyle = 'rgba(251, 146, 60, 0.16)';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Iconic pointed Kurama Fox Ears
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * (owner.radius * 0.45), -owner.radius - 6);
        ctx.lineTo(side * (owner.radius + 12), -owner.radius - 32);
        ctx.lineTo(side * (owner.radius + 10), -owner.radius * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Cellular Rasenshuriken Wind Dome on Floor (2.2s slicing vortex!)
    const sh = data.shuriken;
    if (sh.phase === 'expanding-dome') {
      const a = Math.min(1, sh.domeTimer / 0.45);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(sh.x, sh.y);

      const domeGrad = ctx.createRadialGradient(0, 0, 12, 0, 0, sh.radius);
      domeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      domeGrad.addColorStop(0.55, 'rgba(186, 230, 253, 0.42)');
      domeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.14)');
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sh.radius, 0, Math.PI * 2);
      ctx.fill();

      // Hundreds of tiny whirling cellular wind needles
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI * 2) / 16 + t * 14;
        const rr = sh.radius * (0.3 + (i % 4) * 0.19);
        ctx.beginPath();
        ctx.arc(0, 0, rr, ang, ang + 0.45);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as NarutoUltimateData;

    // 1. 4 Tactical Shadow Clones (+ classic white ninja POOF smoke clouds!)
    for (const c of data.clones) {
      if (c.alive) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.fillStyle = 'rgba(251, 146, 60, 0.82)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#fb923c';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Headband slash mark
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-9, -6, 18, 4);
        ctx.restore();
      } else if (c.poofTimer > 0) {
        const a = Math.max(0, Math.min(1, c.poofTimer / 0.45));
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.translate(c.x, c.y);
        ctx.fillStyle = '#f8fafc';
        for (let p = 0; p < 5; p++) {
          const ang = (p * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 10, Math.sin(ang) * 10, 10 * (1.3 - a * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 2. Spinning 4-Blade Rasenshuriken Core!
    const sh = data.shuriken;
    if (sh.phase === 'flying' || sh.phase === 'expanding-dome') {
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.spin);
      const bladeLen = sh.phase === 'flying' ? 32 : 52;
      ctx.fillStyle = 'rgba(224, 242, 254, 0.92)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#bae6fd';
      ctx.shadowBlur = 16;

      for (let b = 0; b < 4; b++) {
        ctx.save();
        ctx.rotate((b * Math.PI) / 2);
        ctx.beginPath();
        ctx.moveTo(6, -5);
        ctx.quadraticCurveTo(bladeLen * 0.65, -14, bladeLen, 0);
        ctx.quadraticCurveTo(bladeLen * 0.65, 9, 6, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, sh.phase === 'flying' ? 11 : 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
