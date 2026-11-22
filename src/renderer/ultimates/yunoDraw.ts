import type { YunoUltimateData } from '../../physics/ultimates/yuno';
import type { UltimateRenderer } from './types';

export const yunoUltimateRenderer: UltimateRenderer = {
  characterId: 'yuno',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    const alpha = Math.min(1, state.elapsed / 0.22, (state.duration - state.elapsed) / 0.45);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha * 0.28);
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, bounds.fullSize, bounds.fullSize);

    // 4 Orbiting Golden Stars connected by emerald Star Magic beams!
    if (owner && owner.alive) {
      ctx.globalAlpha = Math.max(0, alpha * 0.88);
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + t * 2.2;
        pts.push([owner.x + Math.cos(ang) * 86, owner.y + Math.sin(ang) * 86]);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.stroke();

      for (const [x, y] of pts) {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters) {
    const data = state.data as unknown as YunoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);
    if (data.flash <= 0 || !owner) return;

    const a = Math.min(1, data.flash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 18 * a;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(owner.x, owner.y, 46 + (1.45 - data.flash) * 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};
