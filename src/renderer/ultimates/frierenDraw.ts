import type { FrierenUltimateData } from '../../physics/ultimates/frieren';
import type { UltimateRenderer } from './types';

export const frierenUltimateRenderer: UltimateRenderer = {
  characterId: 'frieren',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as FrierenUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Full Mana Suppression Unleashed Aura (monumental pale-gold & white arcane field!)
    ctx.save();
    ctx.translate(owner.x, owner.y);
    const pulse = 1 + Math.sin(t * 7) * 0.05;
    const manaR = (owner.radius + 95) * pulse;
    const grad = ctx.createRadialGradient(0, 0, owner.radius * 0.5, 0, 0, manaR);
    grad.addColorStop(0, `rgba(254, 249, 195, ${0.48 * data.manaRevealAlpha})`);
    grad.addColorStop(0.65, `rgba(250, 204, 21, ${0.22 * data.manaRevealAlpha})`);
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, manaR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as FrierenUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. 4 Rotating Golden Honeycomb Hexagonal Defensive Barriers!
    if (owner) {
      const orbitR = owner.radius + 32;
      for (let s = 0; s < 4; s++) {
        if (data.shieldHp[s] <= 0) continue;
        const ang = data.shieldAngles[s];
        const sx = owner.x + Math.cos(ang) * orbitR;
        const sy = owner.y + Math.sin(ang) * orbitR;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.34)';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let h = 0; h < 6; h++) {
          const ha = (h * Math.PI * 2) / 6;
          const r = 16;
          if (h === 0) ctx.moveTo(Math.cos(ha) * r, Math.sin(ha) * r);
          else ctx.lineTo(Math.cos(ha) * r, Math.sin(ha) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Madhouse-Style Sleek Ricochet ZOLTRAAK Beams!
    for (const l of data.lasers) {
      const a = Math.max(0, Math.min(1, l.life / 0.48));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 9 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      if (l.bx2 !== undefined && l.by2 !== undefined) {
        ctx.lineTo(l.bx2, l.by2);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.2 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
