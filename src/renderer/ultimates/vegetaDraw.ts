import type { VegetaUltimateData } from '../../physics/ultimates/vegeta';
import type { UltimateRenderer } from './types';

export const vegetaUltimateRenderer: UltimateRenderer = {
  characterId: 'vegeta',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as VegetaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Blazing Deep-Violet Ultra Ego Destroyer Aura around Vegeta!
    if (owner && data.stage === 'ego-absorb') {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#9333ea';
      ctx.shadowBlur = 18;
      // Jagged Destroyer Flame crown
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI * 2) / 16 + t * 3;
        const rad = owner.radius + (i % 2 === 0 ? 18 : 9) + Math.sin(t * 20 + i) * 3;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Expanding Violet Hakai Erasure Wave!
    if (data.stage === 'hakai-detonated' && data.waveFlash > 0 && owner) {
      const a = Math.max(0, Math.min(1, data.waveFlash / 0.9));
      ctx.save();
      ctx.globalAlpha = a * 0.55;
      const g = ctx.createRadialGradient(owner.x, owner.y, 16, owner.x, owner.y, data.waveRadius);
      g.addColorStop(0, 'rgba(9, 9, 11, 0.85)');
      g.addColorStop(0.65, 'rgba(168, 85, 247, 0.72)');
      g.addColorStop(1, 'rgba(232, 121, 249, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, data.waveRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as VegetaUltimateData;

    // Pitch-Black Core & Blazing Violet Rim HAKAI Sphere beating with absorbed damage!
    if (data.stage === 'ego-absorb') {
      const pulse = 1 + Math.sin(t * 22) * 0.08;
      const r = data.sphereRadius * pulse;
      ctx.save();
      ctx.translate(data.sphereX, data.sphereY);

      // Outer violet Destroyer corona
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Absorbed damage counter inside Hakai Sphere!
      if (data.absorbedDamage > 0) {
        ctx.fillStyle = '#f5d0fe';
        ctx.font = '900 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${Math.round(data.absorbedDamage)}`, 0, 0);
      }
      ctx.restore();
    }
  },
};
