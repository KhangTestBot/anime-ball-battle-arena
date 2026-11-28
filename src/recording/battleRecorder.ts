import type { BattleEngine } from '../physics/engine';
import type { FighterState } from '../types/game';

export interface RecordedVideo {
  blob: Blob;
  url: string;
  filename: string;
  mimeType: string;
  ext: 'mp4' | 'webm';
  durationSec: number;
  sizeBytes: number;
}

export interface RecorderFrameOptions {
  verticalMode: boolean;
  countdownLabel: string | null;
}

export interface MimeSelection {
  mimeType: string;
  ext: 'mp4' | 'webm';
}

// Prioritize hardware-accelerated H.264 and fast VP8 ahead of CPU-heavy software VP9 to avoid dropped/laggy frames
const PREFERRED_MIME_TYPES: readonly MimeSelection[] = [
  { mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
  { mimeType: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4' },
  { mimeType: 'video/mp4', ext: 'mp4' },
  { mimeType: 'video/webm;codecs=h264,opus', ext: 'webm' },
  { mimeType: 'video/webm;codecs=h264', ext: 'webm' },
  { mimeType: 'video/webm;codecs=vp8,opus', ext: 'webm' },
  { mimeType: 'video/webm;codecs=vp8', ext: 'webm' },
  { mimeType: 'video/webm;codecs=vp9,opus', ext: 'webm' },
  { mimeType: 'video/webm', ext: 'webm' },
];

const RECORD_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / RECORD_FPS;

export function pickSupportedVideoMime(isTypeSupported?: (mime: string) => boolean): MimeSelection {
  const checker =
    isTypeSupported ??
    (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function'
      ? (m: string) => MediaRecorder.isTypeSupported(m)
      : null);

  if (checker) {
    for (const candidate of PREFERRED_MIME_TYPES) {
      try {
        if (checker(candidate.mimeType)) {
          return candidate;
        }
      } catch {
        // Ignore unsupported codec query errors
      }
    }
  }
  return { mimeType: 'video/webm', ext: 'webm' };
}

/** Macroblock-aligned (divisible by 16) HD resolutions for fast, smooth hardware encoding */
export function getRecordingDimensions(verticalMode: boolean): { width: number; height: number } {
  return verticalMode ? { width: 720, height: 1280 } : { width: 768, height: 912 };
}

export function buildRecordingFilename(fighters: FighterState[], ext: 'mp4' | 'webm'): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 22);

  let base = 'anime-ball-battle';
  if (fighters.length === 2) {
    base = `${slug(fighters[0].displayName)}-vs-${slug(fighters[1].displayName)}`;
  } else if (fighters.length > 2) {
    base = `${fighters.length}-fighters-battle`;
  }
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  return `${base}-${stamp}.${ext}`;
}

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export class BattleRecorder {
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private combinedStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private recording = false;
  private paused = false;
  private startPerfMs = 0;
  private pausedAccumMs = 0;
  private pauseStartMs = 0;
  private lastCapturedMs = 0;
  private verticalMode = false;
  private selectedMime: MimeSelection = { mimeType: 'video/webm', ext: 'webm' };
  private pendingFilename = 'battle.webm';
  private truncatedCache = new Map<string, string>();

  public static isSupported(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    if (typeof MediaRecorder === 'undefined') return false;
    const probe = document.createElement('canvas');
    return typeof probe.captureStream === 'function';
  }

  public isRecording(): boolean {
    return this.recording;
  }

  public getElapsedSec(): number {
    if (!this.recording) return 0;
    const now = this.paused ? this.pauseStartMs : performance.now();
    return Math.max(0, (now - this.startPerfMs - this.pausedAccumMs) / 1000);
  }

  public setPaused(paused: boolean): void {
    if (!this.recording || !this.mediaRecorder || this.paused === paused) return;
    this.paused = paused;
    if (paused) {
      this.pauseStartMs = performance.now();
      try {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.pause();
        }
      } catch {
        // Some browsers do not support MediaRecorder.pause()
      }
    } else {
      this.pausedAccumMs += Math.max(0, performance.now() - this.pauseStartMs);
      this.lastCapturedMs = 0;
      try {
        if (this.mediaRecorder.state === 'paused') {
          this.mediaRecorder.resume();
        }
      } catch {
        // Ignore resume errors
      }
    }
  }

  public start(
    sourceCanvas: HTMLCanvasElement,
    engine: BattleEngine,
    audioStream: MediaStream | null,
    opts: RecorderFrameOptions,
  ): boolean {
    if (this.recording) return true;
    if (!BattleRecorder.isSupported()) return false;

    this.verticalMode = opts.verticalMode;
    this.truncatedCache.clear();
    const { width, height } = getRecordingDimensions(this.verticalMode);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return false;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    this.offscreenCanvas = canvas;
    this.offscreenCtx = ctx;

    // Render initial frame before capturing stream so first frame is never blank
    this.drawCompositeFrame(sourceCanvas, engine, opts);

    const videoStream = canvas.captureStream(RECORD_FPS);
    const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
    if (audioStream) {
      for (const track of audioStream.getAudioTracks()) {
        tracks.push(track);
      }
    }
    this.combinedStream = new MediaStream(tracks);
    this.selectedMime = pickSupportedVideoMime();
    this.pendingFilename = buildRecordingFilename(engine.fighters, this.selectedMime.ext);
    this.chunks = [];

    try {
      const options: MediaRecorderOptions = {
        videoBitsPerSecond: 4_000_000,
        audioBitsPerSecond: 128_000,
      };
      if (MediaRecorder.isTypeSupported(this.selectedMime.mimeType)) {
        options.mimeType = this.selectedMime.mimeType;
      }
      this.mediaRecorder = new MediaRecorder(this.combinedStream, options);
    } catch {
      try {
        this.mediaRecorder = new MediaRecorder(this.combinedStream);
      } catch {
        this.cleanupStreams();
        return false;
      }
    }

    this.mediaRecorder.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) {
        this.chunks.push(ev.data);
      }
    };

    // Larger 1500ms chunk timeslice prevents frequent main-thread Blob flushes & encoder hiccups
    this.mediaRecorder.start(1500);
    this.recording = true;
    this.paused = false;
    this.startPerfMs = performance.now();
    this.pausedAccumMs = 0;
    this.lastCapturedMs = this.startPerfMs;
    return true;
  }

  public captureFrame(
    sourceCanvas: HTMLCanvasElement,
    engine: BattleEngine,
    opts: RecorderFrameOptions,
    force = false,
  ): void {
    if (!this.recording || this.paused || !this.offscreenCtx || !this.offscreenCanvas) return;

    // Pace composite redraws to steady 30 FPS so encoder never drops frames or lags the game loop
    const now = performance.now();
    if (!force && now - this.lastCapturedMs < FRAME_INTERVAL_MS - 2) {
      return;
    }
    this.lastCapturedMs = now;

    this.drawCompositeFrame(sourceCanvas, engine, {
      ...opts,
      verticalMode: this.verticalMode,
    });
  }

  public stop(): Promise<RecordedVideo | null> {
    if (!this.recording || !this.mediaRecorder) {
      return Promise.resolve(null);
    }
    const durationSec = Math.max(0.1, this.getElapsedSec());
    this.recording = false;
    this.paused = false;
    const recorder = this.mediaRecorder;
    const mimeType = recorder.mimeType || this.selectedMime.mimeType;
    const ext: 'mp4' | 'webm' = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = this.pendingFilename.replace(/\.(mp4|webm)$/i, `.${ext}`);

    return new Promise<RecordedVideo | null>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this.chunks = [];
        this.cleanupStreams();
        this.mediaRecorder = null;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;

        if (blob.size <= 0) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          filename,
          mimeType,
          ext,
          durationSec,
          sizeBytes: blob.size,
        });
      };

      try {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        } else {
          this.cleanupStreams();
          resolve(null);
        }
      } catch {
        this.cleanupStreams();
        resolve(null);
      }
    });
  }

  public cancel(): void {
    if (!this.recording) return;
    this.recording = false;
    this.paused = false;
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch {
        // Ignore stop errors during cancel
      }
      this.mediaRecorder = null;
    }
    this.chunks = [];
    this.cleanupStreams();
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }

  public static triggerDownload(video: RecordedVideo): void {
    const a = document.createElement('a');
    a.href = video.url;
    a.download = video.filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public static revoke(video: RecordedVideo | null): void {
    if (video?.url) {
      URL.revokeObjectURL(video.url);
    }
  }

  private cleanupStreams(): void {
    if (this.combinedStream) {
      // Stop only the canvas video tracks; keep shared SoundEngine audio track alive
      for (const track of this.combinedStream.getVideoTracks()) {
        track.stop();
      }
      this.combinedStream = null;
    }
  }

  private truncateCached(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    const key = `${ctx.font}|${Math.round(maxWidth)}|${text}`;
    const hit = this.truncatedCache.get(key);
    if (hit !== undefined) return hit;

    let out = text;
    if (ctx.measureText(text).width > maxWidth) {
      let cut = text;
      while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
        cut = cut.slice(0, -1);
      }
      out = `${cut}…`;
    }
    if (this.truncatedCache.size > 160) {
      this.truncatedCache.clear();
    }
    this.truncatedCache.set(key, out);
    return out;
  }

  private drawCompositeFrame(
    sourceCanvas: HTMLCanvasElement,
    engine: BattleEngine,
    opts: RecorderFrameOptions,
  ): void {
    const ctx = this.offscreenCtx;
    const canvas = this.offscreenCanvas;
    if (!ctx || !canvas) return;

    const W = canvas.width;
    const H = canvas.height;
    const isVert = opts.verticalMode;

    // 1. Clean opaque studio backdrop
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, W, H);

    // 2. Layout geometry: Top HUD + Centered Square Arena + Optional Footer
    const sidePad = isVert ? 24 : 24;
    const arenaSize = W - sidePad * 2;
    const hudTop = isVert ? 54 : 16;
    const arenaY = isVert ? Math.round((H - arenaSize) * 0.56) : H - arenaSize - 20;
    const hudHeight = Math.max(112, arenaY - hudTop - 12);

    // 3. Draw Broadcast Top HUD (Timer + Fighters HP/ULT/Form)
    this.drawBroadcastHud(ctx, engine, sidePad, hudTop, arenaSize, hudHeight, isVert);

    // 4. Draw Live Arena Canvas directly (no expensive path clip per frame)
    ctx.drawImage(sourceCanvas, sidePad, arenaY, arenaSize, arenaSize);

    ctx.strokeStyle = engine.suddenDeathActive
      ? 'rgba(251, 55, 101, 0.72)'
      : 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 3;
    ctx.strokeRect(sidePad + 1, arenaY + 1, arenaSize - 2, arenaSize - 2);

    // 5. Countdown overlay (3 - 2 - 1 - FIGHT!)
    if (opts.countdownLabel) {
      const isGo = opts.countdownLabel === 'FIGHT!';
      ctx.save();
      if (!isGo) {
        ctx.fillStyle = 'rgba(4, 7, 15, 0.28)';
        ctx.fillRect(sidePad, arenaY, arenaSize, arenaSize);
      }
      ctx.font = `900 ${isGo ? Math.round(arenaSize * 0.14) : Math.round(arenaSize * 0.19)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cx = sidePad + arenaSize * 0.5;
      const cy = arenaY + arenaSize * 0.5;
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#09090b';
      ctx.strokeText(opts.countdownLabel, cx, cy);
      ctx.fillStyle = isGo ? '#facc15' : '#f8fafc';
      ctx.fillText(opts.countdownLabel, cx, cy);
      ctx.restore();
    }

    // 6. Post-KO Victory Banner drawn onto recorded video
    if (engine.finished && engine.matchResult) {
      const bannerH = 84;
      const bannerY = arenaY + arenaSize - bannerH - 20;
      ctx.save();
      drawRoundedRect(ctx, sidePad + 20, bannerY, arenaSize - 40, bannerH, 12);
      ctx.fillStyle = 'rgba(6, 10, 20, 0.88)';
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 15px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('MATCH WINNER', sidePad + arenaSize * 0.5, bannerY + 26);

      ctx.font = '900 30px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#facc15';
      const winText = this.truncateCached(
        ctx,
        `${engine.matchResult.winnerName.toUpperCase()} WINS!`,
        arenaSize - 84,
      );
      ctx.fillText(winText, sidePad + arenaSize * 0.5, bannerY + 58);
      ctx.restore();
    }

    // 7. Subtle footer in 9:16 Vertical mode
    if (isVert) {
      ctx.save();
      ctx.font = '800 18px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.52)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ANIME BALL BATTLE ARENA', W * 0.5, H - 48);
      ctx.restore();
    }
  }

  private drawBroadcastHud(
    ctx: CanvasRenderingContext2D,
    engine: BattleEngine,
    x: number,
    y: number,
    w: number,
    h: number,
    isVert: boolean,
  ): void {
    ctx.save();

    // Clock & Sudden Death pill at top center
    const clockStr = formatClock(engine.elapsed);
    ctx.font = '800 19px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(clockStr, x + w * 0.5, y);

    if (engine.suddenDeathActive) {
      const badgeW = 140;
      const badgeH = 22;
      const bx = x + w * 0.5 + 46;
      drawRoundedRect(ctx, bx, y - 1, badgeW, badgeH, 6);
      ctx.fillStyle = 'rgba(251, 55, 101, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#fb3765';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = '800 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#fda4af';
      ctx.textBaseline = 'middle';
      ctx.fillText('SUDDEN DEATH', bx + badgeW * 0.5, y + badgeH * 0.5 - 1);
    }

    const fighters = engine.fighters;
    const bodyY = y + 28;

    if (fighters.length === 2) {
      const [a, b] = fighters;
      const formA = engine.getForm(a);
      const formB = engine.getForm(b);
      const colGap = 20;
      const colW = (w - colGap) * 0.5;
      const leftX = x;
      const rightX = x + colW + colGap;

      // Fighter Names + "VS"
      const titleFont = isVert ? 25 : 26;
      ctx.font = `900 ${titleFont}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = 'top';

      ctx.textAlign = 'left';
      ctx.fillStyle = a.character.primaryColor;
      ctx.fillText(this.truncateCached(ctx, a.displayName.toUpperCase(), colW - 14), leftX, bodyY);

      ctx.textAlign = 'center';
      ctx.font = '800 16px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('VS', x + w * 0.5, bodyY + 5);

      ctx.font = `900 ${titleFont}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillStyle = b.character.primaryColor;
      ctx.fillText(
        this.truncateCached(ctx, b.displayName.toUpperCase(), colW - 14),
        rightX + colW,
        bodyY,
      );

      // HP Bars
      const barY = bodyY + titleFont + 10;
      const barH = 28;
      this.drawDuelHpBar(ctx, a, leftX, barY, colW, barH, false);
      this.drawDuelHpBar(ctx, b, rightX, barY, colW, barH, true);

      // Ultimate Bars
      const ultY = barY + barH + 8;
      const ultH = 11;
      this.drawDuelUltBar(ctx, a, leftX, ultY, colW, ultH, false);
      this.drawDuelUltBar(ctx, b, rightX, ultY, colW, ultH, true);

      // Form names
      const metaY = ultY + ultH + 8;
      ctx.font = '800 14px Inter, system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = formA.auraColor;
      ctx.fillText(this.truncateCached(ctx, formA.name, colW), leftX, metaY);

      ctx.textAlign = 'right';
      ctx.fillStyle = formB.auraColor;
      ctx.fillText(this.truncateCached(ctx, formB.name, colW), rightX + colW, metaY);
    } else {
      // Multi-fighter compact grid (FFA / Team Battles)
      const cols = fighters.length <= 4 ? 2 : 4;
      const rows = Math.ceil(fighters.length / cols);
      const gap = 8;
      const cellW = (w - gap * (cols - 1)) / cols;
      const availH = Math.max(72, h - 30);
      const cellH = Math.min(44, (availH - gap * (rows - 1)) / Math.max(1, rows));

      for (let i = 0; i < fighters.length; i++) {
        const f = fighters[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = x + col * (cellW + gap);
        const cy = bodyY + row * (cellH + gap);

        ctx.fillStyle = f.alive ? 'rgba(15, 23, 42, 0.92)' : 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(cx, cy, cellW, cellH);
        ctx.strokeStyle =
          f.teamId === 0
            ? 'rgba(56, 189, 248, 0.65)'
            : f.teamId === 1
              ? 'rgba(251, 113, 133, 0.65)'
              : 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx, cy, cellW, cellH);

        ctx.font = '800 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = f.alive ? '#f8fafc' : '#64748b';
        ctx.fillText(this.truncateCached(ctx, f.displayName, cellW - 52), cx + 8, cy + 5);

        ctx.textAlign = 'right';
        ctx.fillStyle = f.alive ? '#cbd5e1' : '#ef4444';
        ctx.fillText(f.alive ? `${Math.ceil(f.hp)}` : 'KO', cx + cellW - 8, cy + 5);

        const hpRatio = Math.max(0, Math.min(1, f.hp / Math.max(1, f.maxHp)));
        const trackY = cy + cellH - 11;
        const trackW = cellW - 16;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx + 8, trackY, trackW, 6);
        if (hpRatio > 0) {
          ctx.fillStyle = f.character.primaryColor;
          ctx.fillRect(cx + 8, trackY, trackW * hpRatio, 6);
        }
      }
    }

    ctx.restore();
  }

  private drawDuelHpBar(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    x: number,
    y: number,
    w: number,
    h: number,
    alignRight: boolean,
  ): void {
    const ratio = Math.max(0, Math.min(1, f.hp / Math.max(1, f.maxHp)));
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    if (ratio > 0) {
      const fillW = w * ratio;
      const fx = alignRight ? x + (w - fillW) : x;
      ctx.fillStyle = f.character.primaryColor;
      ctx.fillRect(fx, y, fillW, h);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '800 14px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    const label = f.alive ? `${Math.ceil(f.hp)} / ${f.maxHp}` : 'KO';
    ctx.fillText(label, x + w * 0.5, y + h * 0.5 + 1);
  }

  private drawDuelUltBar(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    x: number,
    y: number,
    w: number,
    h: number,
    alignRight: boolean,
  ): void {
    const ratio = Math.max(0, Math.min(1, f.ultimateCharge / 100));
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    if (ratio > 0) {
      const fillW = w * ratio;
      const fx = alignRight ? x + (w - fillW) : x;
      ctx.fillStyle = ratio >= 1 ? '#facc15' : '#a855f7';
      ctx.fillRect(fx, y, fillW, h);
    }

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}
