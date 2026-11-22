import type { GojoUltimateData } from '../../physics/ultimates/gojo';
import type { UltimateRenderer } from './types';

export const gojoUltimateRenderer: UltimateRenderer = {
  characterId: 'gojo',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as GojoUltimateData;
    const { left, top, right, bottom } = bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. Pitch-Black Unlimited Void Horizon & Glowing White Event Horizon Circle
    ctx.save();
    ctx.fillStyle = `rgba(3, 5, 16, ${0.65 * fade})`;
    ctx.fillRect(left, top, right - left, bottom - top);

    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();

    // 2. Cascading Infinite Cosmic Information Streams gliding horizontally!
    ctx.globalAlpha = 0.55 * fade;
    for (let i = 0; i < 16; i++) {
      const y = top + 34 + i * ((bottom - top - 68) / 15);
      const xShift =
        ((data.dataWaveOffset * (1 + (i % 3) * 0.45) + i * 75) % (right - left + 160)) - 80;
      const col = i % 2 === 0 ? '#7dd3fc' : '#c084fc';
      ctx.strokeStyle = col;
      ctx.lineWidth = i % 3 === 0 ? 3 : 1.6;
      ctx.beginPath();
      ctx.moveTo(left + xShift, y);
      ctx.lineTo(left + xShift + 85, y);
      ctx.stroke();
    }

    // Event horizon white singularity ring
    ctx.globalAlpha = 0.9 * fade;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#7dd3fc';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, (right - left) * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Crossed-Finger Unlimited Void Domain Mudra Icon above Gojo!
    ctx.save();
    ctx.translate(owner.x, owner.y - owner.radius - 18);
    ctx.fillStyle = '#e0f2fe';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.4;
    ctx.font = '900 13px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('∞ 🤞', 0, 0);
    ctx.fillText('∞ 🤞', 0, 0);
    ctx.restore();
  },
};
