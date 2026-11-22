import type { KratosUltimateData } from '../../physics/ultimates/kratos';
import type { UltimateRenderer } from './types';

export const kratosUltimateRenderer: UltimateRenderer = {
  characterId: 'kratos',

  drawBackdrop(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as KratosUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.5);

    // Flaming Spartan Omega (Ω) Symbol branded on the arena floor!
    ctx.save();
    ctx.globalAlpha = 0.55 * fade;
    ctx.translate(data.omegaX, data.omegaY);
    const pulse = 1 + Math.sin(t * 9) * 0.04;
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 7;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, -4, 48, Math.PI * 0.78, Math.PI * 2.22);
    ctx.stroke();
    // Omega feet
    ctx.beginPath();
    ctx.moveTo(-48, 36);
    ctx.lineTo(-22, 36);
    ctx.lineTo(-22, 24);
    ctx.moveTo(48, 36);
    ctx.lineTo(22, 36);
    ctx.lineTo(22, 24);
    ctx.stroke();
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as KratosUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Norse Frost Leviathan Axe (spinning crescent ice blade!)
    if (data.axe.phase !== 'done') {
      const axe = data.axe;
      ctx.save();
      ctx.translate(axe.x, axe.y);
      ctx.rotate(axe.spin);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;

      // Wooden/metal haft
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-3.5, -18, 7, 36);

      // Gleaming Norse Frost crescent axe head
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(2, -14);
      ctx.quadraticCurveTo(24, -18, 22, 4);
      ctx.quadraticCurveTo(10, 0, 2, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing blue frost rune on blade
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.lineTo(14, -4);
      ctx.moveTo(14, -10);
      ctx.lineTo(10, -4);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Twin Chained Blades of Chaos whipping out with glowing ember chain links!
    if (owner) {
      for (const arc of data.whipArcs) {
        const a = Math.max(0, Math.min(1, arc.life / 0.72));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4.2;
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -t * 90;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        const mx = (owner.x + arc.targetX) / 2 + Math.sin(t * 25) * 16;
        const my = (owner.y + arc.targetY) / 2 + Math.cos(t * 25) * 16;
        ctx.quadraticCurveTo(mx, my, arc.targetX, arc.targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Flaming Chaos Blade hook at target end!
        const ang = Math.atan2(arc.targetY - owner.y, arc.targetX - owner.x);
        ctx.translate(arc.targetX, arc.targetY);
        ctx.rotate(ang);
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-8, -9);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  },
};
