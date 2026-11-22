import type { SukunaUltimateData } from '../../physics/ultimates/sukuna';
import type { UltimateRenderer } from './types';

export const sukunaUltimateRenderer: UltimateRenderer = {
  characterId: 'sukuna',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as SukunaUltimateData;
    const { left, top, right, bottom } = bounds;
    const cx = (left + right) / 2;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. Blood-Crimson Shrine Sky Backdrop + Silhouetted Malevolent Shrine Torii Gate!
    ctx.save();
    ctx.fillStyle = `rgba(69, 10, 22, ${0.42 * fade})`;
    ctx.fillRect(left, top, right - left, bottom - top);

    ctx.globalAlpha = 0.36 * fade;
    ctx.strokeStyle = '#ff1f5a';
    ctx.fillStyle = '#991b1b';
    ctx.lineWidth = 5;
    // Left & Right Torii Pillars + Curving Crossbeam Kasagi!
    const topY = top + 76;
    ctx.fillRect(cx - 86, topY, 10, 96);
    ctx.fillRect(cx + 76, topY, 10, 96);
    ctx.beginPath();
    ctx.moveTo(cx - 115, topY - 4);
    ctx.quadraticCurveTo(cx, topY + 12, cx + 115, topY - 4);
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillRect(cx - 94, topY + 24, 188, 7);

    // 2. Persistent Carved Cleave & Dismantle Floor Slash Scars!
    ctx.globalAlpha = 0.72 * fade;
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3;
    for (const sc of data.scars) {
      ctx.beginPath();
      ctx.moveTo(sc.x1, sc.y1);
      ctx.lineTo(sc.x2, sc.y2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as SukunaUltimateData;
    const fuga = data.fuga;

    // Divine Flame Arrow FUGA ("■ Open") Charging Bow & Blazing Jet!
    if (fuga.active && !fuga.fired) {
      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(fuga.x1, fuga.y1);
      ctx.lineTo(fuga.x2, fuga.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    } else if (fuga.fired && fuga.blastTimer > 0) {
      const a = Math.max(0, Math.min(1, fuga.blastTimer / 0.85));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 44 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(fuga.x1, fuga.y1);
      ctx.lineTo(fuga.x2, fuga.y2);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 14 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
