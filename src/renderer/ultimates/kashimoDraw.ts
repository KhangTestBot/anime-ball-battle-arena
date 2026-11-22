import type { KashimoUltimateData } from '../../physics/ultimates/kashimo';
import type { UltimateRenderer } from './types';

export const kashimoUltimateRenderer: UltimateRenderer = {
  characterId: 'kashimo',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Shifting Amber-Cyan Plasma Discharge Aura around Kashimo!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.8;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let i = 0; i <= 14; i++) {
      const a = (i * Math.PI * 2) / 14;
      const r = owner.radius + 10 + (i % 2 === 0 ? 7 : -2) + Math.sin(t * 25 + i) * 3;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KashimoUltimateData;

    // 1. Floating Positive Charge Counters (+) above charged enemies
    for (const f of fighters) {
      const ch = data.charges[f.uid] ?? 0;
      if (!f.alive || ch <= 0) continue;
      ctx.save();
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      const label = ch === 1 ? '(+)' : '(+)(+) ⚡';
      ctx.fillText(label, f.x, f.y - f.radius - 20);
      ctx.restore();
    }

    // 2. Jagged SURE-HIT RETURN STROKE Lightning Bolt!
    if (data.boltFlash > 0) {
      const a = Math.max(0, Math.min(1, data.boltFlash / 0.75));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 9 * a;
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 24;

      const drawBolt = (x1: number, y1: number, x2: number, y2: number): void => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / len;
        const ny = dx / len;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let i = 1; i < 8; i++) {
          const p = i / 8;
          const j = Math.sin(t * 45 + i * 3) * 16;
          ctx.lineTo(x1 + dx * p + nx * j, y1 + dy * p + ny * j);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };

      drawBolt(data.boltX1, data.boltY1, data.boltX2, data.boltY2);
      // Sky-down lightning Return Stroke finish!
      drawBolt(data.boltX2, data.boltY2 - 180, data.boltX2, data.boltY2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 * a;
      ctx.stroke();
      ctx.restore();
    }
  },
};
