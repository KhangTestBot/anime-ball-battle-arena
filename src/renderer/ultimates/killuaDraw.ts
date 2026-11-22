import type { KilluaUltimateData } from '../../physics/ultimates/killua';
import type { UltimateRenderer } from './types';

export const killuaUltimateRenderer: UltimateRenderer = {
  characterId: 'killua',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KilluaUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. 125px Godspeed Neural Whirlwind Radar Circle around Killua!
    if (owner && data.reflexesLeft > 0) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.52)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, data.radarRadius, t * 3, t * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Reflex charge pips around radar
      for (let i = 0; i < data.reflexesLeft; i++) {
        const ang = -Math.PI / 2 + i * 0.45;
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.arc(
          Math.cos(ang) * data.radarRadius,
          Math.sin(ang) * data.radarRadius,
          4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Lingering High-Voltage Neural Floor Wires (1.5s slowing zones!)
    for (const tr of data.wireTraces) {
      const a = Math.max(0, Math.min(1, tr.life / 1.5));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5 * a;
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8 * a;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as KilluaUltimateData;

    // Branched Synapse Neural Lightning Arcs firing from Killua's brain to intruders!
    for (const arc of data.reflexArcs) {
      const a = Math.max(0, Math.min(1, arc.life / 0.42));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;

      const mx = (arc.x1 + arc.x2) * 0.5 + (arc.y2 - arc.y1) * 0.16;
      const my = (arc.y1 + arc.y2) * 0.5 - (arc.x2 - arc.x1) * 0.16;
      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      ctx.lineTo(mx, my);
      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();

      // Secondary dendritic neural branch off midpoint!
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 18, my - 18);
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - 14, my + 20);
      ctx.stroke();
      ctx.restore();
    }
  },
};
