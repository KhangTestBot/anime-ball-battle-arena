import type { IchigoUltimateData } from '../../physics/ultimates/ichigo';
import type { UltimateRenderer } from './types';

export const ichigoUltimateRenderer: UltimateRenderer = {
  characterId: 'ichigo',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const { left, top, right, bottom } = bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. Monochrome Sumi-e Ink Sky Backdrop + Giant Fading Kanji "無月"
    ctx.save();
    ctx.fillStyle = `rgba(15, 23, 42, ${0.46 * fade})`;
    ctx.fillRect(left, top, right - left, bottom - top);

    // Monumental calligraphic Kanji "無月"
    ctx.globalAlpha = 0.24 * fade;
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 135px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('無月', cx, cy);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as IchigoUltimateData;
    const { left, top, right, bottom } = bounds;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();

    if (!data.slashActive) {
      // Thin white spiritual edge telegraph line before cleave
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Colossal Pitch-Black Mugetsu Void Ribbon bisecting the entire arena!
      ctx.globalAlpha = fade;
      const w = data.wallHalfThickness * 2;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = w + 10;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.stroke();

      // Solid pitch-black abyssal ink cleave core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = w - 2;
      ctx.beginPath();
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.stroke();

      // Drifting silver-white spiritual smoke filaments along blade edge
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.7)';
      ctx.lineWidth = 2;
      const dx = data.x2 - data.x1;
      const dy = data.y2 - data.y1;
      for (let i = 1; i <= 5; i++) {
        const frac = i / 6;
        const px = data.x1 + dx * frac + Math.sin(t * 10 + i) * 6;
        const py = data.y1 + dy * frac + Math.cos(t * 10 + i) * 6;
        ctx.beginPath();
        ctx.arc(px, py, 10 + (i % 3) * 4, 0, Math.PI);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};
