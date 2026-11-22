import type { GilgameshUltimateData } from '../../physics/ultimates/gilgamesh';
import type { UltimateRenderer } from './types';

export const gilgameshUltimateRenderer: UltimateRenderer = {
  characterId: 'gilgamesh',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (!owner) return;

    // Babylonian Golden Crest halo under King of Heroes
    ctx.save();
    ctx.translate(owner.x, owner.y);
    ctx.rotate(t * 0.8);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, owner.radius + 42, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (owner.radius + 26), Math.sin(a) * (owner.radius + 26));
      ctx.lineTo(Math.cos(a) * (owner.radius + 46), Math.sin(a) * (owner.radius + 46));
      ctx.stroke();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as GilgameshUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    // 1. Golden Enkidu Chains of Heaven coiling around bound enemy
    if (data.chainTargetUid) {
      const target = fighters.find((f) => f.uid === data.chainTargetUid && f.alive);
      if (target && target.stunKind === 'chained') {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.2;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + 0.4;
          ctx.beginPath();
          ctx.moveTo(target.x, target.y);
          ctx.lineTo(target.x + Math.cos(a) * 140, target.y + Math.sin(a) * 140);
          ctx.stroke();
        }
        // Coiled golden links circling target ball
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. 8 Golden Gate of Babylon Ripple Portals
    for (let i = 0; i < data.gates.length; i++) {
      const g = data.gates[i];
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);

      const pulse = 1 + g.flash * 0.25;
      ctx.fillStyle = `rgba(251, 191, 36, ${0.22 + g.flash * 0.45})`;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, 5.5 * pulse, 15 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.8 * pulse, 9 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. 3-Cylinder Sword of Rupture: EA
    if (owner && (data.stage === 'enuma-charge' || data.stage === 'enuma-fire')) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.rotate(data.eaAngle);
      for (let seg = 0; seg < 3; seg++) {
        const sx = owner.radius + 10 + seg * 12;
        const spinH = 7 + Math.sin(data.spinPhase + seg * 2) * 3;
        ctx.fillStyle = seg % 2 === 0 ? '#dc2626' : '#09090b';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.fillRect(sx, -spinH, 10, spinH * 2);
        ctx.strokeRect(sx, -spinH, 10, spinH * 2);
      }
      ctx.restore();
    }

    // 4. Scarlet Spatial Rift ENUMA ELISH!!
    if (data.eaFlash > 0) {
      const a = Math.max(0, Math.min(1, data.eaFlash / 1.25));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 72 * a;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.moveTo(data.eaX1, data.eaY1);
      ctx.lineTo(data.eaX2, data.eaY2);
      ctx.stroke();

      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 26 * a;
      ctx.stroke();

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 8 * a;
      ctx.beginPath();
      ctx.moveTo(data.eaX1 + Math.sin(t * 25) * 4, data.eaY1);
      ctx.lineTo(data.eaX2, data.eaY2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
