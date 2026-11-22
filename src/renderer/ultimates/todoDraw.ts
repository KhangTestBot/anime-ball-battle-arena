import type { TodoUltimateData } from '../../physics/ultimates/todo';
import type { UltimateRenderer } from './types';

export const todoUltimateRenderer: UltimateRenderer = {
  characterId: 'todo',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as TodoUltimateData;
    // Boogie Woogie Electric-Blue Swap Teleport Tethers
    for (const ln of data.links) {
      const a = Math.max(0, Math.min(1, ln.life / 0.6));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 4.5 * a;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(ln.x1, ln.y1);
      ctx.lineTo(ln.x2, ln.y2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as TodoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (owner && data.clapFlash > 0) {
      const a = Math.max(0, Math.min(1, data.clapFlash / 0.45));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 16 + (1 - a) * 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('*CLAP!*', owner.x, owner.y - owner.radius - 26);
      ctx.restore();
    }
  },
};
