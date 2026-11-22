import type { VergilUltimateData } from '../../physics/ultimates/vergil';
import type { UltimateRenderer } from './types';

export const vergilUltimateRenderer: UltimateRenderer = {
  characterId: 'vergil',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as VergilUltimateData;
    const { left, top, right, bottom } = bounds;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // Deep Devil Trigger Midnight-Blue Spatial Freeze Backdrop
    ctx.save();
    ctx.fillStyle = data.shattered
      ? `rgba(14, 165, 233, ${0.16 * fade})`
      : `rgba(2, 6, 23, ${0.58 * fade})`;
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as VergilUltimateData;
    const { left, top, right, bottom } = bounds;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.5);

    // Clip all 18 Yamato space-cuts cleanly inside the arena box
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();

    // Draw the 18 Yamato Dimensional Cut Lines -> expand into shattered glass ribbons on *CLICK*!
    for (let i = 0; i < data.cuts.length; i++) {
      const cut = data.cuts[i];
      ctx.save();
      if (!cut.shattered) {
        // Razor-thin silver-cyan telegraph wire (dodgeable intersections!)
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.78)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cut.x1, cut.y1);
        ctx.lineTo(cut.x2, cut.y2);
        ctx.stroke();
      } else {
        // SHATTERED SPACE GLASS! Offset fractured blue-white flash
        const jitter = (i % 2 === 0 ? 1 : -1) * 4.5 * fade;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 7 * fade;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(cut.x1 + jitter, cut.y1 - jitter);
        ctx.lineTo(cut.x2 + jitter, cut.y2 - jitter);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.4 * fade;
        ctx.beginPath();
        ctx.moveTo(cut.x1, cut.y1);
        ctx.lineTo(cut.x2, cut.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();

    // Devil May Cry Iconic Style Rank Badge ("SSS — SMOKIN' SEXY STYLE!") in bottom-right!
    ctx.save();
    ctx.globalAlpha = fade;
    const rx = right - 20;
    const ry = bottom - 26;
    const pulse = 1 + Math.sin(t * 16) * 0.05;
    ctx.translate(rx, ry);
    ctx.scale(pulse, pulse);
    ctx.textAlign = 'right';
    ctx.font = 'italic 900 28px Georgia, serif';
    ctx.fillStyle = data.styleRank === 'SSS' ? '#38bdf8' : '#e2e8f0';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
    ctx.strokeText(data.styleRank, 0, -10);
    ctx.fillText(data.styleRank, 0, -10);

    ctx.font = '900 9px monospace';
    ctx.fillStyle = '#bae6fd';
    ctx.strokeText("SMOKIN' SEXY STYLE!", 0, 5);
    ctx.fillText("SMOKIN' SEXY STYLE!", 0, 5);
    ctx.restore();
  },
};
