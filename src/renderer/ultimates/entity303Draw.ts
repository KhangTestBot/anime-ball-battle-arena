import type { Entity303UltimateData } from '../../physics/ultimates/entity303';
import type { UltimateRenderer } from './types';

export const entity303UltimateRenderer: UltimateRenderer = {
  characterId: 'entity303',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as Entity303UltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.25);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.4);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Dashed crimson Redstone Data Cables linking the 3 Corrupted Chunks!
    if (data.chunks.length >= 2) {
      ctx.strokeStyle = 'rgba(255, 31, 90, 0.72)';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([10, 6]);
      ctx.lineDashOffset = -t * 75;
      ctx.beginPath();
      ctx.moveTo(data.chunks[0].x, data.chunks[0].y);
      for (let i = 1; i < data.chunks.length; i++) {
        ctx.lineTo(data.chunks[i].x, data.chunks[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Render the 3 Missing-Texture Purple-Black Checkerboard Corrupted Chunks!
    for (const ch of data.chunks) {
      const half = ch.size * 0.5;
      const cell = ch.size / 4;
      const jitterX = ch.flashTimer > 0 ? Math.sin(t * 90) * 3 : 0;

      ctx.save();
      ctx.translate(ch.x + jitterX, ch.y);
      ctx.shadowColor = '#ff1f5a';
      ctx.shadowBlur = ch.flashTimer > 0 ? 22 : 12;

      // Iconic Minecraft Missing Texture 4x4 checkerboard!
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const isMag = (row + col) % 2 === 0;
          ctx.fillStyle = ch.flashTimer > 0 && isMag ? '#ff1f5a' : isMag ? '#d946ef' : '#09090b';
          ctx.fillRect(-half + col * cell, -half + row * cell, cell, cell);
        }
      }

      // Red error border + X cursor
      ctx.strokeStyle = '#ff1f5a';
      ctx.lineWidth = 2.6;
      ctx.strokeRect(-half, -half, ch.size, ch.size);

      // Flickering monospace error code label
      ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.fillRect(-half + 4, -9, ch.size - 8, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch.code, 0, 0.5);
      ctx.restore();
    }

    ctx.restore();
    void bounds;
  },

  drawForeground(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as Entity303UltimateData;
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.4);
    const full = bounds.fullSize;

    // 1. Orbiting Crimson-Black Glitch Scythes that corrupt & bend enemy projectiles!
    for (const sc of data.scythes) {
      ctx.save();
      ctx.globalAlpha = fadeOut;
      ctx.translate(sc.x, sc.y);
      ctx.rotate(sc.angle + t * 9);
      ctx.shadowColor = '#ff1f5a';
      ctx.shadowBlur = 16;

      // Scythe handle
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();

      // Jagged crimson-black glitch scythe crescent blade
      ctx.fillStyle = '#ff1f5a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(12, -4);
      ctx.quadraticCurveTo(28, -22, 2, -26);
      ctx.quadraticCurveTo(14, -12, 8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Subtle RGB Horizontal Chromatic Tear Bars during cast & peak corruption!
    if (data.glitchIntensity > 0.2) {
      ctx.save();
      ctx.globalAlpha = data.glitchIntensity * 0.32;
      for (let i = 0; i < 6; i++) {
        const y = (t * 420 + i * 113) % full;
        const h = 4 + (i % 3) * 4;
        ctx.fillStyle = i % 2 === 0 ? '#ff1f5a' : '#22d3ee';
        ctx.fillRect(0, y, full, h);
      }
      ctx.restore();
    }
  },
};
