import type { SfxEvent, VoiceMode } from '../types/game';
import { RealVoiceStore } from './voiceStore';

const THROTTLE_MS: Record<SfxEvent['type'], number> = {
  wall: 45,
  hit: 40,
  crit: 90,
  slash: 55,
  'beam-charge': 200,
  'beam-fire': 220,
  powerup: 140,
  heal: 150,
  dodge: 90,
  ko: 180,
  'sudden-death': 400,
  victory: 400,
  'ultimate-cutin': 300,
};

export function getVoiceModeLabel(mode: VoiceMode): string {
  if (mode === 'real') return 'Voice: Real Audio';
  if (mode === 'hybrid') return 'Voice: Real + AI';
  return 'Voice: Off';
}

export class SoundEngine {
  public readonly voiceStore: RealVoiceStore;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private decodedVoices = new Map<string, AudioBuffer>();
  private activeVoiceSource: AudioBufferSourceNode | null = null;
  private muted = false;
  private voiceMode: VoiceMode = 'real';
  private voices: SpeechSynthesisVoice[] = [];
  private lastPlayed: Partial<Record<SfxEvent['type'], number>> = {};

  constructor(voiceStore?: RealVoiceStore) {
    this.voiceStore = voiceStore ?? new RealVoiceStore();
    this.voiceStore.onChange(() => {
      // Clear decoded cache when user uploads or removes clips
      this.decodedVoices.clear();
    });
    this.initSpeechVoices();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getVoiceMode(): VoiceMode {
    return this.voiceMode;
  }

  public setVoiceMode(mode: VoiceMode): void {
    this.voiceMode = mode;
    if (mode === 'off') {
      this.stopActiveVoice();
    }
  }

  public cycleVoiceMode(): VoiceMode {
    const next: VoiceMode =
      this.voiceMode === 'real' ? 'hybrid' : this.voiceMode === 'hybrid' ? 'off' : 'real';
    this.setVoiceMode(next);
    return next;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.42, this.ctx.currentTime, 0.02);
    }
    if (muted) {
      this.stopActiveVoice();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public stopActiveVoice(): void {
    if (this.activeVoiceSource) {
      try {
        this.activeVoiceSource.stop();
      } catch {
        // Ignore already stopped source
      }
      this.activeVoiceSource.disconnect();
      this.activeVoiceSource = null;
    }
    this.cancelSpeech();
  }

  public cancelSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser speech cancellation edge errors
      }
    }
  }

  public unlock(): void {
    if (typeof window === 'undefined') return;
    this.initSpeechVoices();

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.42, this.ctx.currentTime);
      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);

      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  /** Play a character's real audio clip (used for Lobby preview & Ultimate Cut-Ins) */
  public async playRealVoiceClip(characterId: string): Promise<boolean> {
    if (this.muted) return false;
    this.unlock();
    if (!this.ctx || !this.masterGain) return false;

    let audioBuf = this.decodedVoices.get(characterId) ?? null;
    if (!audioBuf) {
      const raw = await this.voiceStore.getAudioBufferCopy(characterId);
      if (!raw) return false;
      try {
        audioBuf = await this.ctx.decodeAudioData(raw);
        this.decodedVoices.set(characterId, audioBuf);
      } catch {
        return false;
      }
    }

    this.stopActiveVoice();
    const src = this.ctx.createBufferSource();
    src.buffer = audioBuf;

    // Dedicated voice gain so real voice clips punch cleanly above battle SFX
    const vGain = this.ctx.createGain();
    vGain.gain.setValueAtTime(1.5, this.ctx.currentTime);

    src.connect(vGain);
    vGain.connect(this.masterGain);
    this.activeVoiceSource = src;
    src.onended = () => {
      if (this.activeVoiceSource === src) {
        this.activeVoiceSource = null;
      }
    };
    src.start(0);
    return true;
  }

  public play(event: SfxEvent): void {
    if (this.muted) return;

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const minGap = THROTTLE_MS[event.type];
    const prev = this.lastPlayed[event.type] ?? 0;
    if (nowMs - prev < minGap) return;
    this.lastPlayed[event.type] = nowMs;

    if (event.type === 'ultimate-cutin') {
      void this.handleUltimateVoice(event);
    }

    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;

    const t = this.ctx.currentTime;
    const intensity = Math.max(0.3, Math.min(1.6, event.intensity ?? 1));

    switch (event.type) {
      case 'wall':
        this.playWall(t, intensity);
        break;
      case 'hit':
        this.playHit(t, intensity);
        break;
      case 'crit':
        this.playCrit(t, intensity);
        break;
      case 'slash':
        this.playSlash(t, intensity);
        break;
      case 'beam-charge':
        this.playBeamCharge(t);
        break;
      case 'beam-fire':
        this.playBeamFire(t, intensity);
        break;
      case 'powerup':
        this.playPowerUp(t);
        break;
      case 'heal':
        this.playHeal(t);
        break;
      case 'dodge':
        this.playDodge(t);
        break;
      case 'ko':
        this.playKo(t);
        break;
      case 'sudden-death':
        this.playSuddenDeath(t);
        break;
      case 'victory':
        this.playVictory(t);
        break;
      case 'ultimate-cutin':
        this.playUltimateCutIn(t);
        break;
    }
  }

  private async handleUltimateVoice(event: SfxEvent): Promise<void> {
    if (this.voiceMode === 'off') return;

    // 1. Always prioritize REAL character audio clip (uploaded or public/voices/)
    if (event.characterId && this.voiceStore.hasRealVoice(event.characterId)) {
      const played = await this.playRealVoiceClip(event.characterId);
      if (played) return;
    }

    // 2. Canonical non-AI game sound signatures (Sans Undertale talk blips, Creeper hiss!)
    if (this.ctx && this.masterGain && this.ctx.state === 'running') {
      if (event.characterId === 'sans') {
        this.playSansTalkBlips(this.ctx.currentTime);
        return;
      }
      if (event.characterId === 'creeper') {
        this.playCreeperFuseHiss(this.ctx.currentTime);
        return;
      }
    }

    // 3. Only fall back to browser AI TTS if user explicitly selected "hybrid" mode!
    if (this.voiceMode === 'hybrid' && event.voiceLine) {
      this.speakVoiceLine(
        event.voiceLine,
        event.voicePitch ?? 1.0,
        event.voiceRate ?? 1.05,
        event.voiceGender ?? 'neutral',
      );
    }
  }

  /** Authentic Undertale Sans chiptune dialogue blip cadence ("eh-eh-eh-eh-eh") */
  private playSansTalkBlips(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const pattern = [0, 0.09, 0.18, 0.31, 0.4, 0.49, 0.58, 0.72, 0.82];
    for (const offset of pattern) {
      const start = t + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(118 + Math.random() * 14, start);
      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.065);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.07);
    }
  }

  /** Authentic Minecraft Creeper rising fuse hiss ("Tsssssss...") */
  private playCreeperFuseHiss(t: number): void {
    if (!this.noiseBuffer) return;
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(5200, t + 0.85);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.92);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(t);
    noise.stop(t + 0.94);
  }

  private initSpeechVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const load = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      load();
      if (this.voices.length === 0) {
        window.speechSynthesis.addEventListener?.('voiceschanged', load);
      }
    } catch {
      // Speech synthesis not supported
    }
  }

  private speakVoiceLine(
    text: string,
    pitch: number,
    rate: number,
    gender: 'male' | 'female' | 'neutral',
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.pitch = Math.max(0.45, Math.min(2.0, pitch));
      utter.rate = Math.max(0.8, Math.min(1.4, rate));
      utter.volume = 0.92;

      const enVoices = this.voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
      if (enVoices.length > 0) {
        const femaleHints = ['samantha', 'victoria', 'karen', 'moira', 'tessa', 'zira', 'ava'];
        const maleHints = ['alex', 'daniel', 'fred', 'aaron', 'david', 'arthur', 'gordon'];
        const hints = gender === 'female' ? femaleHints : maleHints;
        const matched = enVoices.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
        utter.voice = matched ?? enVoices[0];
      }

      synth.speak(utter);
    } catch {
      // Ignore speech block
    }
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 0.8);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private playWall(t: number, intensity: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(165 + Math.random() * 45, t);
    osc.frequency.exponentialRampToValueAtTime(68, t + 0.065);
    gain.gain.setValueAtTime(0.16 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.075);
  }

  private playHit(t: number, intensity: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(195 + Math.random() * 35, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.11);
    gain.gain.setValueAtTime(0.32 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.125);

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, t);
      filter.Q.setValueAtTime(1.4, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.18 * intensity, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(out);
      noise.start(t);
      noise.stop(t + 0.065);
    }
  }

  private playCrit(t: number, intensity: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.24);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(420, t);
    subGain.gain.setValueAtTime(0.45 * intensity, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    sub.connect(lp);
    lp.connect(subGain);
    subGain.connect(out);
    sub.start(t);
    sub.stop(t + 0.27);

    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(920, t);
    snap.frequency.exponentialRampToValueAtTime(220, t + 0.09);
    snapGain.gain.setValueAtTime(0.2 * intensity, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    snap.connect(snapGain);
    snapGain.connect(out);
    snap.start(t);
    snap.stop(t + 0.11);
  }

  private playSlash(t: number, intensity: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(750, t + 0.13);
      filter.Q.setValueAtTime(3.2, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.24 * intensity, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(out);
      noise.start(t);
      noise.stop(t + 0.15);
    }

    const ring = ctx.createOscillator();
    const rGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1850 + Math.random() * 400, t);
    ring.frequency.exponentialRampToValueAtTime(920, t + 0.08);
    rGain.gain.setValueAtTime(0.1 * intensity, t);
    rGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    ring.connect(rGain);
    rGain.connect(out);
    ring.start(t);
    ring.stop(t + 0.1);
  }

  private playBeamCharge(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(960, t + 0.36);
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.39);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  private playBeamFire(t: number, intensity: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc2.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(105, t + 0.45);
    osc2.frequency.setValueAtTime(442, t);
    osc2.frequency.exponentialRampToValueAtTime(208, t + 0.45);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(480, t + 0.45);
    gain.gain.setValueAtTime(0.32 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.5);
    osc2.stop(t + 0.5);
  }

  private playPowerUp(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const start = t + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  private playHeal(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    [880, 1174.66, 1567.98].forEach((freq, idx) => {
      const start = t + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  private playUltimateCutIn(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const sub = ctx.createOscillator();
    const sGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(32, t + 0.45);
    sGain.gain.setValueAtTime(0.55, t);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    sub.connect(sGain);
    sGain.connect(out);
    sub.start(t);
    sub.stop(t + 0.5);

    [329.63, 493.88, 659.25, 987.77].forEach((freq, i) => {
      const start = t + 0.03 + i * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, start + 0.55);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.64);
    });
  }

  private playDodge(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(1920, t + 0.11);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private playKo(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    const boom = ctx.createOscillator();
    const bGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(135, t);
    boom.frequency.exponentialRampToValueAtTime(24, t + 0.55);
    bGain.gain.setValueAtTime(0.6, t);
    bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
    boom.connect(bGain);
    bGain.connect(out);
    boom.start(t);
    boom.stop(t + 0.6);

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 0.45);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.38, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(out);
      noise.start(t);
      noise.stop(t + 0.5);
    }
  }

  private playSuddenDeath(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    [0, 0.22].forEach((offset) => {
      const start = t + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, start);
      osc.frequency.setValueAtTime(440, start + 0.09);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1400, start);
      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.19);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  private playVictory(t: number): void {
    const ctx = this.ctx!;
    const out = this.masterGain!;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      const start = t + i * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  }
}
