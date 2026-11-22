import type { SansUltimateData } from '../../physics/ultimates/sans';
import type { UltimateRenderer } from './types';

export const sansUltimateRenderer: UltimateRenderer = {
  characterId: 'sans',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as SansUltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.25);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.4);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    const full = bounds.fullSize;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Stark Pitch-Black Undertale Screen + Thick Crisp White Battle Box!
    ctx.fillStyle = 'rgba(2, 4, 9, 0.86)';
    ctx.fillRect(0, 0, full, full);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(24, 24, full - 48, full - 48);

    // 2. Classic Undertale Bottom "LV 19 · HP / KR" Bar!
    const barY = full - 14;
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('LV 19   HP', 32, barY);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(108, barY - 6, 78, 12);
    ctx.fillStyle = '#d946ef';
    ctx.fillRect(186, barY - 6, 32, 12);
    ctx.fillStyle = '#d946ef';
    ctx.fillText('KR', 226, barY);

    // 3. Directional Blue Soul Gravity Flow Arrows!
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.34)';
    ctx.lineWidth = 2.4;
    const dirAngles = [Math.PI / 2, 0, -Math.PI / 2, Math.PI];
    const gAng = dirAngles[data.gravityDir % 4];
    for (let k = 0; k < 5; k++) {
      const px = 95 + (k * (full - 190)) / 4;
      const py = full * 0.5 + Math.sin(t * 5 + k) * 45;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(gAng);
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, -8);
      ctx.moveTo(14, 0);
      ctx.lineTo(6, 8);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters, t) {
    const data = state.data as unknown as SansUltimateData;
    const full = bounds.fullSize;

    // 1. Glowing Cyan Flaming Left Eye on Sans!
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (owner) {
      ctx.save();
      ctx.translate(owner.x + owner.radius * 0.28, owner.y - owner.radius * 0.12);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      // Rising blue eye-flame trail
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.quadraticCurveTo(8, -10 + Math.sin(t * 25) * 4, 15, -14);
      ctx.quadraticCurveTo(6, -3, -3, 3);
      ctx.fill();
      ctx.restore();
    }

    // 2. Sweeping Pixelated Blue Bone Walls (STAND STILL!) & Orange Bone Walls (KEEP MOVING!)
    for (const wall of data.boneWalls) {
      const col = wall.colorKind === 'blue' ? '#38bdf8' : '#fb923c';
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.fillStyle = col;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;

      // Draw crisp column of stacked Undertale bones spanning the Battle Box height!
      for (let by = 48; by < full - 48; by += 36) {
        // Bone shaft
        ctx.fillRect(wall.x - 5, by - 12, 10, 24);
        // Top & bottom bone knobs
        ctx.beginPath();
        ctx.arc(wall.x - 5, by - 12, 4.5, 0, Math.PI * 2);
        ctx.arc(wall.x + 5, by - 12, 4.5, 0, Math.PI * 2);
        ctx.arc(wall.x - 5, by + 12, 4.5, 0, Math.PI * 2);
        ctx.arc(wall.x + 5, by + 12, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Detailed White Gaster Blaster Dragon Skulls charging & opening jaws around the ring!
    for (const gb of data.blasters) {
      const alpha = gb.fired ? Math.max(0, gb.fadeTimer / 0.55) : 1;
      const jawOpen = gb.fired ? 9 : Math.max(0, (1 - gb.chargeTimer / 0.5) * 6);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(gb.x, gb.y);
      ctx.rotate(gb.angle);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = gb.fired ? 20 : 10;

      // White dragon skull cranium + snout jaws
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-16, -15, 22, 30, 6);
      ctx.fill();
      ctx.stroke();

      // Upper & lower split snout opening wide when firing!
      ctx.fillRect(4, -12 - jawOpen * 0.5, 16, 9);
      ctx.strokeRect(4, -12 - jawOpen * 0.5, 16, 9);
      ctx.fillRect(4, 3 + jawOpen * 0.5, 16, 9);
      ctx.strokeRect(4, 3 + jawOpen * 0.5, 16, 9);

      // Glowing cyan Gaster Blaster eye sockets
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-4, -6, 3.6, 0, Math.PI * 2);
      ctx.arc(-4, 6, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
