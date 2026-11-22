import type { WardenUltimateData } from '../../physics/ultimates/warden';
import type { UltimateRenderer } from './types';

let darknessMaskCanvas: HTMLCanvasElement | null = null;

function getDarknessMaskCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!darknessMaskCanvas) {
    darknessMaskCanvas = document.createElement('canvas');
    darknessMaskCanvas.width = 256;
    darknessMaskCanvas.height = 256;
  }
  return darknessMaskCanvas;
}

export const wardenUltimateRenderer: UltimateRenderer = {
  characterId: 'warden',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as WardenUltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.35);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    const cx = bounds.fullSize / 2;
    const cy = bounds.fullSize / 2;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Creeping Deep Dark Teal Sculk Veins linking the 3 Sculk Sensors!
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.42)';
    ctx.lineWidth = 3;
    for (const s of data.sensors) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo((cx + s.x) / 2 + 18, (cy + s.y) / 2 - 18, s.x, s.y);
      ctx.stroke();
    }

    // 2. Render the 3 Blocky Minecraft Sculk Sensors with Animated Vibrating Tendrils!
    for (const s of data.sensors) {
      const isAlert = s.shriekFlash > 0;
      const sway = Math.sin(t * (isAlert ? 36 : 8) + s.x) * (isAlert ? 5 : 2);

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = isAlert ? 22 : 10;

      // Detection aura ring
      ctx.strokeStyle = isAlert ? 'rgba(34, 211, 238, 0.85)' : 'rgba(20, 184, 166, 0.3)';
      ctx.lineWidth = isAlert ? 2.5 : 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, isAlert ? 34 : 26, 0, Math.PI * 2);
      ctx.stroke();

      // Blocky bone-and-sculk sensor base
      ctx.fillStyle = '#0f2933';
      ctx.strokeStyle = '#042f2e';
      ctx.lineWidth = 2;
      ctx.fillRect(-16, -8, 32, 18);
      ctx.strokeRect(-16, -8, 32, 18);
      // Bone top trim
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-16, -10, 32, 5);

      // 4 Wiggling Cyan Sculk Sensor Tendrils!
      ctx.strokeStyle = isAlert ? '#ffffff' : '#22d3ee';
      ctx.lineWidth = 3;
      for (const tx of [-11, -4, 4, 11]) {
        ctx.beginPath();
        ctx.moveTo(tx, -10);
        ctx.lineTo(tx + sway, -24);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters, t) {
    const data = state.data as unknown as WardenUltimateData;
    const fadeIn = Math.min(1, state.elapsed / 0.35);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    const full = bounds.fullSize;

    // 1. Rhythmic Deep Dark Heartbeat Darkness Mask (pulses dark -> dim like Minecraft Darkness effect!)
    const mask = getDarknessMaskCanvas();
    if (mask) {
      const mctx = mask.getContext('2d');
      if (mctx) {
        const mw = mask.width;
        const scale = mw / Math.max(1, full);
        const heartbeat = 0.56 + Math.pow(Math.max(0, Math.sin(data.heartbeatPhase)), 2) * 0.24;
        mctx.clearRect(0, 0, mw, mw);
        mctx.globalCompositeOperation = 'source-over';
        mctx.fillStyle = `rgba(2, 8, 16, ${heartbeat * alpha})`;
        mctx.fillRect(0, 0, mw, mw);

        // Soft visibility halos around fighters & active Sculk Sensors
        mctx.globalCompositeOperation = 'destination-out';
        for (const f of fighters) {
          if (!f.alive) continue;
          const fx = f.x * scale;
          const fy = f.y * scale;
          const visR = (f.character.id === 'warden' ? 120 : 88) * scale;
          const g = mctx.createRadialGradient(fx, fy, visR * 0.22, fx, fy, visR);
          g.addColorStop(0, 'rgba(0,0,0,0.96)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          mctx.fillStyle = g;
          mctx.beginPath();
          mctx.arc(fx, fy, visR, 0, Math.PI * 2);
          mctx.fill();
        }
        for (const s of data.sensors) {
          const sx = s.x * scale;
          const sy = s.y * scale;
          const visR = (s.shriekFlash > 0 ? 78 : 54) * scale;
          const g = mctx.createRadialGradient(sx, sy, visR * 0.2, sx, sy, visR);
          g.addColorStop(0, 'rgba(0,0,0,0.9)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          mctx.fillStyle = g;
          mctx.beginPath();
          mctx.arc(sx, sy, visR, 0, Math.PI * 2);
          mctx.fill();
        }
        mctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(mask, 0, 0, full, full);
      }
    }

    // 2. Glowing Soul-Ribcage Pulse on Warden's chest!
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    if (owner) {
      ctx.save();
      ctx.translate(owner.x, owner.y);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 16;
      const pulse = 0.6 + Math.sin(t * 9) * 0.35;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Traveling White Sound-Vibration Wave Arcs `)))` flying from loud enemies -> Sculk Sensor!
    for (const v of data.vibrations) {
      const sensor = data.sensors.find((s) => s.id === v.sensorId);
      if (!sensor) continue;
      const px = v.fromX + (sensor.x - v.fromX) * v.progress;
      const py = v.fromY + (sensor.y - v.fromY) * v.progress;
      const ang = Math.atan2(sensor.y - v.fromY, sensor.x - v.fromX);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.6;
      for (let arc = 0; arc < 3; arc++) {
        ctx.beginPath();
        ctx.arc(-arc * 7, 0, 10 + arc * 4, -0.75, 0.75);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
