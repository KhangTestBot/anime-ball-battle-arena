import type { YutaUltimateData } from '../../physics/ultimates/yuta';
import type { UltimateRenderer } from './types';

export const yutaUltimateRenderer: UltimateRenderer = {
  characterId: 'yuta',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as YutaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Cursed Energy Domain Aura circling Yuta & Rika
    ctx.save();
    ctx.strokeStyle = 'rgba(232, 121, 249, 0.34)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, owner.radius + 42 + Math.sin(t * 7) * 4, 0, Math.PI * 2);
    ctx.stroke();

    // Cursed Speech Megaphone Seal Rings on cast stage
    if (data.stage === 'cursed-speech') {
      const waveR = owner.radius + 30 + (state.elapsed % 0.65) * 260;
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, waveR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as YutaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Full Manifestation Queen of Curses RIKA Silhouette hovering behind Yuta!
    if (owner) {
      ctx.save();
      ctx.translate(data.rikaX, data.rikaY);
      const floatY = Math.sin(t * 5) * 4;
      ctx.translate(0, floatY);

      // Jagged Cursed Spirit Upper Body Silhouette
      ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(24, -18);
      ctx.lineTo(30, 8);
      ctx.lineTo(14, 28);
      ctx.lineTo(-14, 28);
      ctx.lineTo(-30, 8);
      ctx.lineTo(-24, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Piercing Cyclops Eye & Jagged Teeth grin
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -10, 8, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, -10, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Skeletal Claw Hands flanking Yuta
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-24, 6);
      ctx.lineTo(-38, 16);
      ctx.moveTo(24, 6);
      ctx.lineTo(38, 16);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Sky Manipulation Cracked Glass Facets during Thin Ice Breaker
    if (data.stage === 'sky-breaker' && owner) {
      ctx.save();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + 0.2;
        ctx.beginPath();
        ctx.moveTo(owner.x + Math.cos(a) * 32, owner.y + Math.sin(a) * 32);
        ctx.lineTo(owner.x + Math.cos(a) * 95, owner.y + Math.sin(a) * 95);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. DUAL PURE LOVE BEAM Pillar
    if (data.stage === 'pure-love' && data.beamTimer > 0) {
      const a = Math.max(0, Math.min(1, data.beamTimer / 0.95));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#c026d3';
      ctx.lineWidth = 68 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#e879f9';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(data.beamX1, data.beamY1);
      ctx.lineTo(data.beamX2, data.beamY2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 24 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
