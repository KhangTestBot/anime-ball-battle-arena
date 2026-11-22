import type { JinxUltimateData } from '../../physics/ultimates/jinx';
import type { UltimateRenderer } from './types';

export const jinxUltimateRenderer: UltimateRenderer = {
  characterId: 'jinx',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as JinxUltimateData;

    // 1. Snapping Steel-Jaw Flame Chompers Traps!
    for (const ch of data.chompers) {
      const chomp = Math.abs(Math.sin(t * 14)) * 4;
      ctx.save();
      ctx.translate(ch.x, ch.y);
      // Danger ring
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Metal monkey-jaw body
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Snapping teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -3 - chomp * 0.4, 12, 2.5);
      ctx.fillRect(-6, 1 + chomp * 0.4, 12, 2.5);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as JinxUltimateData;
    const r = data.rocket;

    // 1. Detailed Shark-Head Super Mega Death Rocket with Neon Graffiti Exhaust!
    if (r.active) {
      const heat = Math.min(1, r.distTraveled / 380);
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.angle);

      // Neon pink-cyan rainbow rocket exhaust
      const trailLen = 36 + heat * 40;
      const exhaust = ctx.createLinearGradient(-16, 0, -16 - trailLen, 0);
      exhaust.addColorStop(0, '#facc15');
      exhaust.addColorStop(0.45, '#ec4899');
      exhaust.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = exhaust;
      ctx.beginPath();
      ctx.moveTo(-14, -9);
      ctx.lineTo(-14 - trailLen, Math.sin(t * 40) * 6);
      ctx.lineTo(-14, 9);
      ctx.closePath();
      ctx.fill();

      // Stabilizer fins
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-16, -8);
      ctx.lineTo(-24, -18);
      ctx.lineTo(-4, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shark fuselage (glows hotter crimson as distance grows!)
      ctx.fillStyle = heat > 0.55 ? '#ef4444' : '#334155';
      ctx.shadowColor = heat > 0.55 ? '#ec4899' : '#38bdf8';
      ctx.shadowBlur = 14 + heat * 12;
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.quadraticCurveTo(14, -13, -16, -10);
      ctx.lineTo(-16, 10);
      ctx.quadraticCurveTo(14, 13, 26, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Grinning shark mouth & pink graffiti X eye!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(18, 2);
      ctx.lineTo(13, 7);
      ctx.lineTo(9, 2);
      ctx.lineTo(5, 7);
      ctx.lineTo(1, 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(6, -6);
      ctx.lineTo(11, -2);
      ctx.moveTo(11, -6);
      ctx.lineTo(6, -2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Arcane Graffiti Neon Scribble Explosion (X_X, POW!, zigzag arcs)
    if (r.exploded && r.explodeTimer > 0) {
      const a = Math.max(0, Math.min(1, r.explodeTimer / 0.85));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(r.explodeX, r.explodeY);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 16;
      // Jagged neon scribble starburst
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI * 2) / 16 + t * 2;
        const rad = i % 2 === 0 ? 118 * (1.15 - a * 0.3) : 64 * (1.15 - a * 0.3);
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('POW!  X_X', 0, -34);
      ctx.restore();
    }
  },
};
