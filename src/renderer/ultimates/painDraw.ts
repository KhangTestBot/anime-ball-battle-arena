import type { PainUltimateData } from '../../physics/ultimates/pain';
import type { UltimateRenderer } from './types';

export const painUltimateRenderer: UltimateRenderer = {
  characterId: 'pain',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const data = state.data as unknown as PainUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);

    ctx.save();
    // Rippled Rinnegan Concentric Violet Gravity Rings around Pain
    if (owner) {
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.36)';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(owner.x, owner.y, owner.radius + i * 18 + Math.sin(t * 6) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Chibaku Tensei Gravity Well Field
    if (data.stage === 'chibaku-pull') {
      const grad = ctx.createRadialGradient(data.coreX, data.coreY, 8, data.coreX, data.coreY, 210);
      grad.addColorStop(0, 'rgba(88, 28, 135, 0.45)');
      grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.16)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.coreX, data.coreY, 210, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as PainUltimateData;
    if (data.stage !== 'chibaku-pull') return;

    // 1. Pitch-Black Chibaku Tensei Gravitational Core Singularity
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(data.coreX, data.coreY, data.coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Orbiting Stone Rubble Chunks compacting onto the Planetoid Core
    for (const rock of data.rocks) {
      const rx = data.coreX + Math.cos(rock.angle) * rock.dist;
      const ry = data.coreY + Math.sin(rock.angle) * rock.dist;
      ctx.fillStyle = '#57534e';
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(rx - 7, ry - 7, 14, 14);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },
};
