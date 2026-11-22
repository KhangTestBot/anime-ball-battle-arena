import type { JiraiyaUltimateData } from '../../physics/ultimates/jiraiya';
import type { UltimateRenderer } from './types';

export const jiraiyaUltimateRenderer: UltimateRenderer = {
  characterId: 'jiraiya',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as JiraiyaUltimateData;
    // Toad Oil Puddles -> Goemon Crimson Flame Seas!
    for (const pool of data.pools) {
      const a = Math.max(0, Math.min(1, pool.life / 1.2));
      ctx.save();
      ctx.globalAlpha = a * 0.72;
      ctx.fillStyle = pool.ignited ? 'rgba(234, 88, 12, 0.55)' : 'rgba(120, 53, 15, 0.55)';
      ctx.strokeStyle = pool.ignited ? '#fde047' : '#d97706';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius + Math.sin(t * 7) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as JiraiyaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Elder Toad Sages (Fukasaku & Shima) silhouettes perched on Jiraiya's shoulders!
    if (owner) {
      ctx.save();
      for (const side of [-1, 1]) {
        const sx = owner.x + side * (owner.radius + 7);
        const sy = owner.y - owner.radius * 0.65 + Math.sin(t * 8 + side) * 2;
        ctx.fillStyle = side === -1 ? '#16a34a' : '#7e22ce';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Chō Ōdama Rasengan colossal cyan-white burst!
    if (data.odamaFlash > 0) {
      const a = Math.max(0, Math.min(1, data.odamaFlash / 1.05));
      ctx.save();
      ctx.globalAlpha = a;
      const grad = ctx.createRadialGradient(
        data.odamaX,
        data.odamaY,
        10,
        data.odamaX,
        data.odamaY,
        130,
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.odamaX, data.odamaY, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
