import type { AizenUltimateData } from '../../physics/ultimates/aizen';
import type { UltimateRenderer } from './types';

export const aizenUltimateRenderer: UltimateRenderer = {
  characterId: 'aizen',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as AizenUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.5);
    if (data.stage === 'kyoka-hypnosis') {
      // Kyoka Suigetsu shatter prism shards tinting the arena glass-violet
      ctx.save();
      ctx.globalAlpha = fade * 0.25;
      ctx.fillStyle = '#581c87';
      ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, t) {
    const data = state.data as unknown as AizenUltimateData;

    // 1. Orbiting Kyoka Suigetsu Mirage Decoys
    for (const d of data.decoys) {
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(t * 9) * 0.15;
      ctx.fillStyle = '#e9d5ff';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Towering Black Gravity Box HADO #90: KUROHITSUGI!
    if (data.stage === 'kurohitsugi-charge') {
      const s = data.coffinSize;
      ctx.save();
      ctx.translate(data.coffinX, data.coffinY);
      ctx.fillStyle = 'rgba(9, 9, 11, 0.78)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#9333ea';
      ctx.shadowBlur = 22;

      // Isometric Coffin Box silhouette
      ctx.fillRect(-s * 0.5, -s * 0.65, s, s * 1.3);
      ctx.strokeRect(-s * 0.5, -s * 0.65, s, s * 1.3);
      // Isometric top cap
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.65);
      ctx.lineTo(-s * 0.25, -s * 0.85);
      ctx.lineTo(s * 0.75, -s * 0.85);
      ctx.lineTo(s * 0.5, -s * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Piercing violet gravity spears closing inward along box walls
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2.6;
      const inAmt = data.spearsProgress * 18;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.65, i * 16);
        ctx.lineTo(-s * 0.5 + inAmt, i * 16);
        ctx.moveTo(s * 0.65, i * 16);
        ctx.lineTo(s * 0.5 - inAmt, i * 16);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Kurohitsugi Gravity Implosion Flash
    if (data.implodeFlash > 0) {
      const a = Math.max(0, Math.min(1, data.implodeFlash / 1.1));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 10 * a;
      ctx.beginPath();
      ctx.arc(data.coffinX, data.coffinY, 35 + a * 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
};
