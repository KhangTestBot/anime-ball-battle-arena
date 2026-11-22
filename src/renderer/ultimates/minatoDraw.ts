import type { MinatoUltimateData } from '../../physics/ultimates/minato';
import type { UltimateRenderer } from './types';

export const minatoUltimateRenderer: UltimateRenderer = {
  characterId: 'minato',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as MinatoUltimateData;
    // Faint golden Hiraishin warp grid linking planted Kunai nodes
    if (data.kunais.length < 2) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.16)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 7]);
    ctx.lineDashOffset = -t * 36;
    ctx.beginPath();
    for (let i = 0; i < data.kunais.length; i++) {
      const k = data.kunais[i];
      if (i === 0) ctx.moveTo(k.x, k.y);
      else ctx.lineTo(k.x, k.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as MinatoUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Yellow Flash Instantaneous Warp Streaks
    for (const line of data.warpLines) {
      const a = Math.max(0, Math.min(1, line.life / 0.55));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 6 * a;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      const midX = (line.x1 + line.x2) * 0.5 + (line.y2 - line.y1) * 0.08;
      const midY = (line.y1 + line.y2) * 0.5 - (line.x2 - line.x1) * 0.08;
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(midX, midY);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * a;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Planted 3-Pronged Flying Raijin Kunai
    for (let i = 0; i < data.kunais.length; i++) {
      const k = data.kunais[i];
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(-Math.PI / 4 + Math.sin(t * 3 + i) * 0.05);

      // Glowing gold formula halo
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.stroke();

      // 3-Pronged Blade Silhouette
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(2, -5);
      ctx.lineTo(4, -9);
      ctx.lineTo(-4, -3);
      ctx.lineTo(-4, 3);
      ctx.lineTo(4, 9);
      ctx.lineTo(2, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White Hiraishin Talisman Handle + Ring
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(-13, -3, 9, 6);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-16, 0, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Hiraishin Seal Markers pinned on Marked Enemies
    for (const e of fighters) {
      if (!e.alive || !(data.markedUids[e.uid] > 0)) continue;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(t * 2.5);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('飛雷神', 0, -e.radius - 13);
      ctx.restore();
    }

    // 4. Churning Oodama Rasengan orb around Minato's fist
    if (owner) {
      ctx.save();
      const ox = owner.x + Math.cos(owner.facingAngle) * (owner.radius + 8);
      const oy = owner.y + Math.sin(owner.facingAngle) * (owner.radius + 8);
      const rGrad = ctx.createRadialGradient(ox, oy, 1, ox, oy, 12);
      rGrad.addColorStop(0, '#ffffff');
      rGrad.addColorStop(0.55, '#38bdf8');
      rGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
