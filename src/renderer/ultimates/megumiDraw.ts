import type { MegumiUltimateData } from '../../physics/ultimates/megumi';
import type { UltimateRenderer } from './types';

function drawDharmaWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = '#facc15';
  ctx.fillStyle = '#fde047';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * (r + 6), Math.sin(a) * (r + 6));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (r + 6), Math.sin(a) * (r + 6), 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export const megumiUltimateRenderer: UltimateRenderer = {
  characterId: 'megumi',

  drawBackdrop(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MegumiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Pitch-black rippling Chimera Shadow Garden pool under Megumi!
    ctx.save();
    const grad = ctx.createRadialGradient(owner.x, owner.y, 12, owner.x, owner.y, data.poolRadius);
    grad.addColorStop(0, 'rgba(9, 9, 11, 0.72)');
    grad.addColorStop(0.6, 'rgba(30, 58, 138, 0.35)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, data.poolRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as MegumiUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Glowing Golden Eight-Handled Dharma Adaptation Wheel overhead!
    drawDharmaWheel(ctx, owner.x, owner.y - owner.radius - 26, 17, data.wheelAngle);
  },
};
