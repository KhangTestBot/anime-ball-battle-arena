import type { YasuoUltimateData } from '../../physics/ultimates/yasuo';
import type { UltimateRenderer } from './types';

export const yasuoUltimateRenderer: UltimateRenderer = {
  characterId: 'yasuo',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as YasuoUltimateData;

    // 1. LoL Blue Skillshot Lane Indicator while Q3 Tornado is travelling!
    if (data.stage === 'tornado') {
      ctx.save();
      ctx.translate(data.tornadoX, data.tornadoY);
      ctx.rotate(data.tornadoAngle);
      const laneGrad = ctx.createLinearGradient(0, 0, 220, 0);
      laneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      laneGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = laneGrad;
      ctx.fillRect(0, -data.tornadoRadius * 0.72, 220, data.tornadoRadius * 1.44);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(0, -data.tornadoRadius * 0.72, 210, data.tornadoRadius * 1.44);
      ctx.restore();
    }

    // 2. Erect Ionian Wind Wall Curtain (blocks projectiles!)
    if (data.windWall.life > 0) {
      const ww = data.windWall;
      const alpha = Math.min(1, ww.life / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ww.x, ww.y);
      ctx.rotate(ww.angle);

      // Luminous wind curtain base
      const grad = ctx.createLinearGradient(0, -14, 0, 14);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(186, 230, 253, 0.72)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-ww.halfLen, -14, ww.halfLen * 2, 28);

      // Flowing horizontal gale ribbons + maple leaves
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      for (let r = -1; r <= 1; r++) {
        ctx.beginPath();
        for (let x = -ww.halfLen; x <= ww.halfLen; x += 14) {
          const y = r * 5 + Math.sin(x * 0.08 - t * 14 + r) * 3.5;
          if (x === -ww.halfLen) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as YasuoUltimateData;

    // 1. Swirling Q3 Tornado Vortex!
    if (data.stage === 'tornado') {
      ctx.save();
      ctx.translate(data.tornadoX, data.tornadoY);
      for (let ring = 0; ring < 4; ring++) {
        const rr = data.tornadoRadius * (0.35 + ring * 0.22);
        ctx.strokeStyle = ring % 2 === 0 ? '#e0f2fe' : '#38bdf8';
        ctx.lineWidth = 3.2 - ring * 0.4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, rr, t * (12 - ring * 2), t * (12 - ring * 2) + Math.PI * 1.45);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Last Breath Mid-Air Jade-White Slashes!
    for (const s of data.slashVisuals) {
      const a = Math.max(0, Math.min(1, s.life / 0.45));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(-74, 0);
      ctx.quadraticCurveTo(0, -18, 74, 0);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-88, 4);
      ctx.quadraticCurveTo(0, 14, 88, 4);
      ctx.stroke();
      ctx.restore();
    }
  },
};
