import type { DioUltimateData } from '../../physics/ultimates/dio';
import type { UltimateRenderer } from './types';

export const dioUltimateRenderer: UltimateRenderer = {
  characterId: 'dio',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as DioUltimateData;
    const { left, top, right, bottom } = bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. ZA WARUDO Monochrome Time-Stop Aura + Giant Golden Roman Clockwork!
    ctx.save();
    if (data.stage === 'time-stopped') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.56)';
      ctx.fillRect(left, top, right - left, bottom - top);
    }

    const r = (right - left) * 0.36;
    ctx.globalAlpha = 0.72 * fade;
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // Roman Numerals XII, III, VI, IX
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('XII', 0, -r * 0.92);
    ctx.fillText('III', r * 0.92, 0);
    ctx.fillText('VI', 0, r * 0.92);
    ctx.fillText('IX', -r * 0.92, 0);

    // Stopped clock hands
    const handAng = data.stage === 'time-stopped' ? -Math.PI / 2 : state.elapsed * 12;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(handAng) * r * 0.65, Math.sin(handAng) * r * 0.65);
    ctx.stroke();
    ctx.restore();

    // 2. Road Roller Landing Warning Shadow during final moments of Time Stop!
    if (!data.rollerSlammed) {
      ctx.save();
      ctx.translate(data.rollerX, data.rollerY);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-52, -26, 104, 52);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-52, -26, 104, 52);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as DioUltimateData;

    // 1. Frozen / Launching Silver Throwing Knives!
    for (const kn of data.knives) {
      ctx.save();
      ctx.translate(kn.x, kn.y);
      ctx.rotate(kn.angle);
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(-9, -3);
      ctx.lineTo(-9, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Iconic Yellow "ROADA ROLLA DA!" Steamroller falling & smashing!
    if (data.stage === 'roller-drop') {
      const dropAlpha = data.rollerSlammed ? Math.max(0, Math.min(1, data.flashTimer / 0.8)) : 1.0;
      const offsetY = (1 - data.rollerFall) * -170;
      ctx.save();
      ctx.globalAlpha = dropAlpha;
      ctx.translate(data.rollerX, data.rollerY + offsetY);

      // Yellow Steamroller Cab + Cylindrical Heavy Steel Front Drum!
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.fillRect(-46, -24, 62, 42);
      ctx.strokeRect(-46, -24, 62, 42);

      // Heavy steel roller drum
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(14, -18, 34, 40, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROADA ROLLA!', 0, -30);
      ctx.restore();
    }
  },
};
