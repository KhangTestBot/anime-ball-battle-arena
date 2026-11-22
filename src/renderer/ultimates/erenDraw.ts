import type { ErenUltimateData } from '../../physics/ultimates/eren';
import type { UltimateRenderer } from './types';

export const erenUltimateRenderer: UltimateRenderer = {
  characterId: 'eren',

  drawBackdrop(ctx, state, bounds, fighters, _t) {
    const data = state.data as unknown as ErenUltimateData;
    const { left, top, right, bottom } = bounds;
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. Apocalyptic Fiery Rumbling Sky Glow
    ctx.save();
    ctx.fillStyle = `rgba(180, 83, 9, ${0.22 * fade})`;
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();

    // 2. Towering White Founding Titan Ribcage & Spine Silhouette around Eren!
    if (owner) {
      ctx.save();
      ctx.globalAlpha = 0.55 * fade;
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      // Colossal arching Founding Titan ribs!
      for (let rib = -3; rib <= 3; rib++) {
        ctx.beginPath();
        ctx.ellipse(
          0,
          rib * 11,
          owner.radius + 32 - Math.abs(rib) * 5,
          16,
          0,
          Math.PI * 0.1,
          Math.PI * 0.9,
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. 4 Sunken Glowing-Ember Colossal Titan Footprint Craters marching with Safe Gaps!
    ctx.save();
    ctx.globalAlpha = fade;
    for (const fp of data.footprints) {
      ctx.save();
      ctx.translate(fp.x, fp.y);

      // Scorched crater footprint sole + 5 Colossal Titan toes
      ctx.fillStyle = 'rgba(28, 25, 23, 0.72)';
      ctx.strokeStyle = fp.stompPulse > 0.35 ? '#fb923c' : '#78350f';
      ctx.lineWidth = 3 + fp.stompPulse * 2;
      ctx.beginPath();
      ctx.ellipse(0, 4, fp.radius * 0.72, fp.radius * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (let toe = -2; toe <= 2; toe++) {
        ctx.beginPath();
        ctx.arc(toe * 9, -fp.radius * 0.78 + Math.abs(toe) * 2, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Billowing Titan Steam Aura around footstep
      if (fp.stompPulse > 0.05) {
        ctx.strokeStyle = `rgba(248, 250, 252, ${fp.stompPulse * 0.65})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, fp.radius * (1.05 + (1 - fp.stompPulse) * 0.65), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as ErenUltimateData;
    const { left, top, right, bottom } = bounds;

    // Warm Golden Transformation Lightning Flash on activation
    if (data.lightningFlash > 0) {
      const a = Math.max(0, Math.min(1, data.lightningFlash / 0.72));
      ctx.save();
      ctx.fillStyle = `rgba(250, 204, 21, ${0.22 * a})`;
      ctx.fillRect(left, top, right - left, bottom - top);
      ctx.restore();
    }
  },
};
