import type { CreeperUltimateData } from '../../physics/ultimates/creeper';
import type { UltimateRenderer } from './types';

export const creeperUltimateRenderer: UltimateRenderer = {
  characterId: 'creeper',

  drawBackdrop(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as CreeperUltimateData;
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.5);

    // Render Terraced Concentric Pixel Minecraft Blast Craters on the arena floor!
    for (const cr of data.craters) {
      ctx.save();
      ctx.globalAlpha = fadeOut * 0.85;
      ctx.translate(cr.x, cr.y);

      const layers: ReadonlyArray<{ frac: number; fill: string; stroke: string }> = [
        { frac: 1.0, fill: '#3f3f46', stroke: '#18181b' }, // Outer cobblestone lip
        { frac: 0.72, fill: '#573b26', stroke: '#291c11' }, // Exposed dirt stair
        { frac: 0.44, fill: '#1e1b24', stroke: '#09090b' }, // Deep blasted bedrock pit
      ];

      for (const layer of layers) {
        const s = cr.radius * layer.frac;
        ctx.fillStyle = layer.fill;
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = 2;
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.strokeRect(-s, -s, s * 2, s * 2);
      }

      // Pixelated slip-hazard sparks inside crater
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(-cr.radius * 0.22, -cr.radius * 0.22, 6, 6);
      ctx.fillRect(cr.radius * 0.14, cr.radius * 0.12, 6, 6);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as CreeperUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    ctx.save();
    ctx.translate(owner.x, owner.y);

    // 1. Classic Flowing Pixelated Charged Creeper Cyan Electric Shell!
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    const wave = Math.sin(t * 24) * 3;
    ctx.strokeRect(
      -(owner.radius + 7 + wave),
      -(owner.radius + 7 + wave),
      (owner.radius + 7 + wave) * 2,
      (owner.radius + 7 + wave) * 2,
    );

    // 2. Bold Pixel Countdown (3 -> 2 -> 1) + Expanding Blast Radius Telegraph Ring!
    if (data.blastsDone < 3) {
      const nextR = data.blastsDone === 2 ? 215 : data.blastsDone === 1 ? 155 : 115;
      const frac = 1 - Math.max(0, data.nextBlastTimer / 0.68);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 + frac * 0.6})`;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, nextR * (0.45 + 0.55 * frac), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Big flashing countdown digit right above Creeper
      ctx.font = '900 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 5;
      const label = `${data.countdownDisplay}`;
      ctx.strokeText(label, 0, -owner.radius - 20);
      ctx.fillStyle = Math.floor(t * 18) % 2 === 0 ? '#ffffff' : '#38bdf8';
      ctx.fillText(label, 0, -owner.radius - 20);
    }

    ctx.restore();
  },
};
