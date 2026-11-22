import type { HerobrineUltimateData } from '../../physics/ultimates/herobrine';
import type { UltimateRenderer } from './types';

let fogMaskCanvas: HTMLCanvasElement | null = null;

function getFogMaskCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!fogMaskCanvas) {
    fogMaskCanvas = document.createElement('canvas');
    fogMaskCanvas.width = 256;
    fogMaskCanvas.height = 256;
  }
  return fogMaskCanvas;
}

export const herobrineUltimateRenderer: UltimateRenderer = {
  characterId: 'herobrine',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as HerobrineUltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.35);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Classic Minecraft Herobrine Shrine (Gold Blocks + Netherrack + Blue Soul-Fire!) in center
    ctx.translate(data.shrineX, data.shrineY);
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2;
    for (const [gx, gy] of [
      [-22, -22],
      [2, -22],
      [-22, 2],
      [2, 2],
    ]) {
      ctx.fillRect(gx, gy, 20, 20);
      ctx.strokeRect(gx, gy, 20, 20);
    }
    // Center Netherrack & flickering Blue Soul Fire
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-10, -10, 20, 20);
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#38bdf8';
    const flameH = 14 + Math.sin(t * 20) * 4;
    ctx.fillRect(-6, -10 - flameH, 12, flameH);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(-3, -8 - flameH * 0.65, 6, flameH * 0.65);
    ctx.restore();

    // 2. Redstone Torch Cross telegraph marks on arena floor!
    for (const st of data.strikes) {
      ctx.save();
      ctx.translate(st.x, st.y);
      if (!st.struck) {
        const prog = 1 - st.timer / Math.max(0.01, st.maxTimer);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.55 + prog * 0.45})`;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 2.6;
        // Classic Redstone Cross (+) warning
        ctx.fillRect(-20, -6, 40, 12);
        ctx.fillRect(-6, -20, 12, 40);
        ctx.strokeRect(-20, -6, 40, 12);
        ctx.strokeRect(-6, -20, 12, 40);
        // Closing square target frame
        const sq = 44 - prog * 22;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-sq, -sq, sq * 2, sq * 2);
      }
      ctx.restore();
    }
    void bounds;
  },

  drawForeground(ctx, state, bounds, fighters, t) {
    const data = state.data as unknown as HerobrineUltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.35);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    const full = bounds.fullSize;

    // 1. Classic Low-Render-Distance White-Grey Minecraft Fog of War (rendered via offscreen mask so fighters shine cleanly through!)
    const mask = getFogMaskCanvas();
    if (mask) {
      const mctx = mask.getContext('2d');
      if (mctx) {
        const mw = mask.width;
        const scale = mw / Math.max(1, full);
        mctx.clearRect(0, 0, mw, mw);
        mctx.globalCompositeOperation = 'source-over';
        mctx.fillStyle = `rgba(203, 213, 225, ${0.58 * alpha})`;
        mctx.fillRect(0, 0, mw, mw);

        mctx.globalCompositeOperation = 'destination-out';
        for (const f of fighters) {
          if (!f.alive) continue;
          const fx = f.x * scale;
          const fy = f.y * scale;
          const visR = (f.character.id === 'herobrine' ? 120 : 94) * scale;
          const g = mctx.createRadialGradient(fx, fy, visR * 0.28, fx, fy, visR);
          g.addColorStop(0, 'rgba(0,0,0,0.95)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          mctx.fillStyle = g;
          mctx.beginPath();
          mctx.arc(fx, fy, visR, 0, Math.PI * 2);
          mctx.fill();
        }
        mctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(mask, 0, 0, full, full);
      }
    }

    // 2. Haunting Faint Glowing White Rectangular Herobrine Eyes Blinking in the Mist!
    ctx.save();
    const eyeBlink = Math.sin(t * 3.8) > -0.3 ? alpha * 0.72 : 0;
    if (eyeBlink > 0.05) {
      ctx.globalAlpha = eyeBlink;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 16;
      for (const [ex, ey] of [
        [full * 0.18, full * 0.22],
        [full * 0.82, full * 0.28],
        [full * 0.22, full * 0.78],
      ]) {
        ctx.fillRect(ex - 14, ey - 3, 10, 5);
        ctx.fillRect(ex + 4, ey - 3, 10, 5);
      }
    }
    ctx.restore();

    // 3. Render 2 Phantom Herobrine Decoys (matching blocky Steve face + glowing white eyes + scanline flicker!)
    for (const d of data.decoys) {
      if (!d.alive) continue;
      const r = d.radius;
      ctx.save();
      ctx.globalAlpha = alpha * (0.82 + Math.sin(t * 28 + d.x) * 0.14);
      ctx.translate(d.x, d.y);

      // Eerie white shadow aura
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#c69269';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Brown hair strip
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI * 1.05, Math.PI * 1.95);
      ctx.closePath();
      ctx.fill();

      // Iconic blinding pure-white rectangular Herobrine eyes!
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-r * 0.56, -r * 0.14, r * 0.42, r * 0.2);
      ctx.fillRect(r * 0.14, -r * 0.14, r * 0.42, r * 0.2);

      // Subtle phantom scanline glitch bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(-r, Math.sin(t * 32) * r * 0.6, r * 2, 2.5);
      ctx.restore();
    }

    // 4. Stepped 90-Degree White Voxel Sky Lightning Strikes!
    for (const st of data.strikes) {
      if (!st.struck) continue;
      const boltA = Math.max(0, st.activeTimer / 0.32);
      ctx.save();
      ctx.globalAlpha = boltA;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 10;
      ctx.lineCap = 'square';
      ctx.beginPath();
      let cy = bounds.top;
      ctx.moveTo(st.x, cy);
      let stepIdx = 0;
      while (cy < st.y) {
        cy = Math.min(st.y, cy + 44);
        const offset = (stepIdx % 2 === 0 ? 1 : -1) * 18;
        ctx.lineTo(st.x + offset, cy);
        ctx.lineTo(st.x, cy);
        stepIdx += 1;
      }
      ctx.stroke();
      ctx.restore();
    }
  },
};
