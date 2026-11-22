import type { HakariUltimateData } from '../../physics/ultimates/hakari';
import type { UltimateRenderer } from './types';

export const hakariUltimateRenderer: UltimateRenderer = {
  characterId: 'hakari',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as HakariUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    ctx.save();
    if (data.phase === 'jackpot') {
      // Fever rainbow-emerald disco aura under Hakari!
      const hue = (t * 210) % 360;
      const grad = ctx.createRadialGradient(
        owner.x,
        owner.y,
        owner.radius * 0.4,
        owner.x,
        owner.y,
        owner.radius + 78,
      );
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      grad.addColorStop(0.6, `hsla(${hue}, 90%, 60%, 0.25)`);
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 78, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.38)';
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.arc(owner.x, owner.y, owner.radius + 48, t * 2, t * 2 + Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as HakariUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Subway Train Shutter Doors crushing enemy!
    for (const door of data.doors) {
      ctx.save();
      ctx.translate(door.x, door.y);
      ctx.rotate(door.angle);

      for (const side of [-1, 1]) {
        const dx = side * door.gap;
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.4;
        ctx.fillRect(dx - 8, -28, 16, 56);
        ctx.strokeRect(dx - 8, -28, 16, 56);
        // Subway window pane
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(dx - 4, -18, 8, 16);
      }
      ctx.restore();
    }

    if (!owner) return;

    // 2. Pachinko 3-Reel Slot Machine Display above Hakari!
    ctx.save();
    const hudX = owner.x;
    const hudY = owner.y - owner.radius - 32;
    const isJackpot = data.phase === 'jackpot';

    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = isJackpot ? '#fde047' : '#10b981';
    ctx.lineWidth = isJackpot ? 2.8 : 2;
    ctx.shadowColor = isJackpot ? '#facc15' : '#10b981';
    ctx.shadowBlur = isJackpot ? 16 : 8;
    ctx.fillRect(hudX - 30, hudY - 11, 60, 22);
    ctx.strokeRect(hudX - 30, hudY - 11, 60, 22);

    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) {
      const sx = hudX + (i - 1) * 18;
      ctx.fillStyle = isJackpot ? '#fef08a' : '#6ee7b7';
      ctx.fillText(String(data.reels[i]), sx, hudY);
    }

    // 3. Serrated Rough Cursed Energy spikes & Tuca Donka ♪ notes during Jackpot!
    if (isJackpot) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      const spikes = 16;
      for (let i = 0; i <= spikes; i++) {
        const a = (i * Math.PI * 2) / spikes + t * 5;
        const r = owner.radius + (i % 2 === 0 ? 15 : 6);
        const px = owner.x + Math.cos(a) * r;
        const py = owner.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 14px sans-serif';
      for (let i = 0; i < 4; i++) {
        const a = data.notePhase + (i * Math.PI) / 2;
        const nx = owner.x + Math.cos(a) * (owner.radius + 28);
        const ny = owner.y + Math.sin(a) * (owner.radius + 28);
        ctx.fillText(i % 2 === 0 ? '♪' : '♫', nx, ny);
      }
    }
    ctx.restore();
  },
};
