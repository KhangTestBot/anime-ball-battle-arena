import type { TengenUltimateData } from '../../physics/ultimates/tengen';
import type { UltimateRenderer } from './types';

export const tengenUltimateRenderer: UltimateRenderer = {
  characterId: 'tengen',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Orbiting Rose-Gold Musical Score Notes around Tengen!
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.font = 'bold 15px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const notes = ['♪', '♫', '♬', '𝄞'];
    for (let i = 0; i < 4; i++) {
      const a = t * 3.5 + (i * Math.PI * 2) / 4;
      ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#ec4899';
      ctx.fillText(notes[i], Math.cos(a) * (owner.radius + 28), Math.sin(a) * (owner.radius + 28));
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const data = state.data as unknown as TengenUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Blinking Flashy Gunpowder Beads on the arena floor
    for (const b of data.beads) {
      if (b.exploded) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#ec4899';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. String Performance Firework Cleaver Whirlwind Burst
    if (owner && data.flashTimer > 0) {
      const p = Math.max(0, Math.min(1, data.flashTimer / 1.1));
      ctx.save();
      ctx.globalAlpha = p * 0.78;
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 45 + (1 - p) * 190, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
