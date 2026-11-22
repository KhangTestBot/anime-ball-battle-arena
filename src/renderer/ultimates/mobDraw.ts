import type { MobUltimateData } from '../../physics/ultimates/mob';
import type { UltimateRenderer } from './types';

const MOB_RAINBOW = ['#ef4444', '#facc15', '#22c55e', '#38bdf8', '#a855f7'];

export const mobUltimateRenderer: UltimateRenderer = {
  characterId: 'mob',

  drawBackdrop(ctx, state, bounds, fighters, t) {
    const data = state.data as unknown as MobUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Studio Bones Rainbow Crayon Sketch Aura + Pure-Black White-Eye ???% Silhouette!
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);

      for (let r = 0; r < 5; r++) {
        ctx.strokeStyle = MOB_RAINBOW[r];
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let i = 0; i <= 18; i++) {
          const ang = (i * Math.PI * 2) / 18 + t * (r % 2 === 0 ? 4 : -4);
          const rad = owner.radius + 10 + r * 5 + Math.sin(t * 25 + i * 3 + r) * 4;
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Wavy Telekinetic Rainbow Tether Line lifting Grabbed Victim!
    if (data.grabbedUid && data.stage !== 'aftermath' && owner) {
      const prey = fighters.find((f) => f.uid === data.grabbedUid && f.alive);
      if (prey) {
        ctx.save();
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        for (let i = 1; i <= 6; i++) {
          const frac = i / 6;
          const wx = owner.x + (prey.x - owner.x) * frac + Math.sin(t * 22 + i) * 9;
          const wy = owner.y + (prey.y - owner.y) * frac + Math.cos(t * 22 + i) * 9;
          ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Telekinetic grab aura ring around victim
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(prey.x, prey.y, prey.radius + 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Hand-Drawn Escalating Emotion Meter (98% -> 99% -> ???%)!
    ctx.save();
    const mx = (bounds.left + bounds.right) / 2;
    const my = bounds.bottom - 26;
    ctx.fillStyle = data.percentText === '???%' ? '#e879f9' : '#ffffff';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 4;
    ctx.font = '900 22px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText(`MOB: ${data.percentText}`, mx, my);
    ctx.fillText(`MOB: ${data.percentText}`, mx, my);
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, _t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Glowing White Void Eyes drawn starkly atop darkened Mob center
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.fillStyle = 'rgba(9, 9, 11, 0.72)';
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius * 0.92, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(-7, -2, 4.2, 2.6, -0.15, 0, Math.PI * 2);
    ctx.ellipse(7, -2, 4.2, 2.6, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
