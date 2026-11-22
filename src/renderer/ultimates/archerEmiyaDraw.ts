import type { ArcherEmiyaUltimateData } from '../../physics/ultimates/archer_emiya';
import type { UltimateRenderer } from './types';

function drawCog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  const teeth = 10;
  for (let i = 0; i < teeth; i++) {
    const a = (i * Math.PI * 2) / teeth;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
    ctx.lineTo(Math.cos(a) * (r + 11), Math.sin(a) * (r + 11));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export const archerEmiyaUltimateRenderer: UltimateRenderer = {
  characterId: 'archer_emiya',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as ArcherEmiyaUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.55);
    const w = bounds.right - bounds.left;
    const h = bounds.bottom - bounds.top;

    // Unlimited Blade Works Reality Marble: Crimson-Amber Sunset + Towering Spinning Gears!
    ctx.save();
    ctx.globalAlpha = fade * 0.62;
    const grad = ctx.createLinearGradient(0, bounds.top, 0, bounds.bottom);
    grad.addColorStop(0, 'rgba(124, 45, 18, 0.52)');
    grad.addColorStop(0.55, 'rgba(234, 88, 12, 0.25)');
    grad.addColorStop(1, 'rgba(24, 24, 27, 0.48)');
    ctx.fillStyle = grad;
    ctx.fillRect(bounds.left, bounds.top, w, h);

    drawCog(
      ctx,
      bounds.left + w * 0.28,
      bounds.top + h * 0.36,
      68,
      data.gearPhase,
      'rgba(249, 115, 22, 0.32)',
    );
    drawCog(
      ctx,
      bounds.left + w * 0.68,
      bounds.top + h * 0.44,
      86,
      -data.gearPhase * 0.8,
      'rgba(251, 146, 60, 0.26)',
    );
    drawCog(
      ctx,
      bounds.left + w * 0.5,
      bounds.top + h * 0.72,
      54,
      data.gearPhase * 1.3,
      'rgba(239, 68, 68, 0.28)',
    );
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as ArcherEmiyaUltimateData;

    // Draw all ground-planted UBW swords visibly embedded in the Reality Marble!
    for (const sw of data.swords) {
      if (sw.fired) continue;
      ctx.save();
      ctx.translate(sw.x, sw.y);
      ctx.rotate(-0.18);

      // Steel blade planted upright
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-2, -2, 4, 22);
      ctx.strokeRect(-2, -2, 4, 22);

      // Crossguard & crimson hilt pointing upward
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-7, -2);
      ctx.lineTo(7, -2);
      ctx.moveTo(0, -2);
      ctx.lineTo(0, -10);
      ctx.stroke();
      ctx.restore();
    }
  },
};
