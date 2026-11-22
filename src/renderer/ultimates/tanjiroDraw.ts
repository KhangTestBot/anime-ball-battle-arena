import type { TanjiroUltimateData } from '../../physics/ultimates/tanjiro';
import type { UltimateRenderer } from './types';

export const tanjiroUltimateRenderer: UltimateRenderer = {
  characterId: 'tanjiro',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as TanjiroUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // Warm Golden Sun Halo glow beneath the slithering dragon segments
    ctx.save();
    ctx.globalAlpha = 0.25 * fade;
    for (const seg of data.segments) {
      const g = ctx.createRadialGradient(seg.x, seg.y, 4, seg.x, seg.y, seg.radius * 2.1);
      g.addColorStop(0, '#facc15');
      g.addColorStop(0.6, '#f97316');
      g.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.radius * 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as TanjiroUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // Ukiyo-e Woodblock-Print Flame Dragon (drawn tail-to-head with bold black ink outlines!)
    ctx.save();
    ctx.globalAlpha = fade;

    for (let i = data.segments.length - 1; i >= 1; i--) {
      const seg = data.segments[i];
      ctx.save();
      ctx.translate(seg.x, seg.y);
      ctx.rotate(seg.angle);

      // Flame cloud fins alternating sides (Japanese traditional cloud swirl style!)
      const sway = Math.sin(t * 14 + i * 0.9) * 5;
      ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#f97316';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, sway * 0.25, seg.radius * 1.15, seg.radius * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden woodblock inner scroll swirl
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, seg.radius * 0.48, 0, Math.PI * 1.35);
      ctx.stroke();
      ctx.restore();
    }

    // Dragon Head with Golden Horns & Flowing Whiskers!
    const head = data.segments[0];
    if (head) {
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(head.angle);

      // Flame mustache/whiskers
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.6;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(10, side * 12);
        ctx.quadraticCurveTo(-8, side * (26 + Math.sin(t * 18) * 5), -24, side * 18);
        ctx.stroke();
      }

      // Bold inked Dragon Skull
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.lineTo(-4, -18);
      ctx.lineTo(-18, -10);
      ctx.lineTo(-18, 10);
      ctx.lineTo(-4, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden sweeping Dragon Horns
      ctx.fillStyle = '#facc15';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(-4, side * 10);
        ctx.lineTo(-26, side * 24);
        ctx.lineTo(-12, side * 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Blazing golden eyes
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(6, -6, 3.4, 0, Math.PI * 2);
      ctx.arc(6, 6, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  },
};
