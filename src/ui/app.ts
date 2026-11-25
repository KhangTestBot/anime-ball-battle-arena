import { SoundEngine } from '../audio/sfx';
import { BattleEngine } from '../physics/engine';
import { ArenaRenderer } from '../renderer/canvas';
import {
  createTournament,
  getCurrentTournamentMatch,
  getTournamentRoundLabel,
  recordTournamentMatchResult,
} from '../tournament/bracket';
import type { MatchConfig, SimSpeedOption, TournamentSize, TournamentState } from '../types/game';
import { BattleView } from './hud';
import { createInitialLobbyState, LobbyView } from './lobby';
import { VoiceManagerModal } from './voiceModal';

const FIXED_DT = 1 / 60;

export class AnimeBattleApp {
  private root: HTMLElement;
  private sfx = new SoundEngine();
  private lobby: LobbyView;
  private battleView: BattleView;

  private screen: 'lobby' | 'battle' = 'lobby';
  private activeConfig: MatchConfig | null = null;
  private tournamentBaseConfig: MatchConfig | null = null;
  private tournament: TournamentState | null = null;

  private engine: BattleEngine | null = null;
  private renderer: ArenaRenderer | null = null;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private accumulator = 0;
  private simSpeed: SimSpeedOption = 1;
  private paused = false;
  private summaryShown = false;
  private renderTime = 0;
  private countdownRemaining = 0;
  private countdownGoTimer = 0;
  private lastCountdownDigit = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    const initialState = createInitialLobbyState(this.sfx.isMuted(), this.sfx.getVoiceMode());

    this.lobby = new LobbyView(root, initialState, this.sfx.voiceStore, {
      onStartMatch: (config, tournamentSize) => {
        this.sfx.unlock();
        this.startFromLobby(config, tournamentSize);
      },
      onToggleMute: () => {
        this.sfx.unlock();
        return this.sfx.toggleMute();
      },
      onCycleVoiceMode: () => {
        this.sfx.unlock();
        return this.sfx.cycleVoiceMode();
      },
      onOpenVoiceManager: () => {
        this.sfx.unlock();
        const modalHost = this.root.querySelector<HTMLElement>('[data-el="lobby-modal"]');
        if (!modalHost) return;
        const modal = new VoiceManagerModal(modalHost, this.sfx, () => {
          if (this.screen === 'lobby') this.lobby.render();
        });
        modal.open();
      },
      onQuickUploadVoice: async (charId, file) => {
        this.sfx.unlock();
        await this.sfx.voiceStore.saveVoiceFile(charId, file);
      },
      onPreviewVoice: (charId) => {
        this.sfx.unlock();
        void this.sfx.playRealVoiceClip(charId);
      },
    });

    this.battleView = new BattleView(root, {
      onBackToLobby: () => this.showLobby(),
      onRematch: () => {
        this.sfx.unlock();
        this.rematchCurrent();
      },
      onTogglePause: () => this.togglePause(),
      onChangeSpeed: (speed) => {
        this.simSpeed = speed;
        this.lobby.syncSimSpeed(speed);
      },
      onToggleMute: () => {
        this.sfx.unlock();
        const muted = this.sfx.toggleMute();
        this.lobby.syncMute(muted);
        return muted;
      },
      onCycleVoiceMode: () => {
        this.sfx.unlock();
        const mode = this.sfx.cycleVoiceMode();
        this.lobby.syncVoiceMode(mode);
        return mode;
      },
      onToggleVertical: (vertical) => {
        if (this.activeConfig) this.activeConfig.verticalMode = vertical;
        if (this.tournamentBaseConfig) this.tournamentBaseConfig.verticalMode = vertical;
        this.lobby.syncVerticalMode(vertical);
      },
      onNextTournamentMatch: () => {
        this.sfx.unlock();
        this.launchNextTournamentMatch();
      },
      onRestartTournament: () => {
        this.sfx.unlock();
        if (this.tournamentBaseConfig && this.tournament) {
          this.tournament = createTournament(this.tournamentBaseConfig.slots, this.tournament.size);
          this.launchNextTournamentMatch();
        }
      },
    });

    this.bindKeyboardShortcuts();
    this.showLobby();

    // Load persisted real voices from IndexedDB and public/voices/manifest.json
    void this.sfx.voiceStore.init().then(() => {
      if (this.screen === 'lobby') {
        this.lobby.render();
      }
    });
  }

  private showLobby(): void {
    this.stopLoop();
    this.sfx.stopActiveVoice();
    this.screen = 'lobby';
    this.engine = null;
    this.renderer = null;
    this.tournament = null;
    this.paused = false;
    this.lobby.syncMute(this.sfx.isMuted());
    this.lobby.syncVoiceMode(this.sfx.getVoiceMode());
    this.lobby.render();
  }

  private startFromLobby(config: MatchConfig, tournamentSize?: TournamentSize): void {
    this.simSpeed = config.simSpeed;
    if (config.mode === 'tournament' && tournamentSize) {
      this.tournamentBaseConfig = { ...config, slots: config.slots.map((s) => ({ ...s })) };
      this.tournament = createTournament(config.slots, tournamentSize);
      this.launchNextTournamentMatch();
      return;
    }

    this.tournament = null;
    this.tournamentBaseConfig = null;
    this.launchBattle(config);
  }

  private launchNextTournamentMatch(): void {
    if (!this.tournament || !this.tournamentBaseConfig) return;
    const match = getCurrentTournamentMatch(this.tournament);
    if (!match || !match.fighterA || !match.fighterB) return;

    const roundLabel = getTournamentRoundLabel(this.tournament.rounds.length, match.roundIndex);
    const subtitle =
      this.tournament.rounds[match.roundIndex].length > 1
        ? `${roundLabel.toUpperCase()} #${match.matchIndex + 1} · TOURNAMENT`
        : `${roundLabel.toUpperCase()} · TOURNAMENT`;

    const duelConfig: MatchConfig = {
      ...this.tournamentBaseConfig,
      mode: 'tournament',
      simSpeed: this.simSpeed,
      slots: [
        { ...match.fighterA, teamId: null },
        { ...match.fighterB, teamId: null },
      ],
    };

    this.launchBattle(duelConfig, subtitle);
  }

  private rematchCurrent(): void {
    if (!this.activeConfig) return;
    const config: MatchConfig = {
      ...this.activeConfig,
      simSpeed: this.simSpeed,
    };
    const subtitle =
      this.tournament && getCurrentTournamentMatch(this.tournament)
        ? `${getTournamentRoundLabel(
            this.tournament.rounds.length,
            this.tournament.currentRound,
          ).toUpperCase()} · TOURNAMENT`
        : undefined;
    this.launchBattle(config, subtitle);
  }

  private launchBattle(config: MatchConfig, tournamentSubtitle?: string): void {
    this.stopLoop();
    this.sfx.stopActiveVoice();
    this.screen = 'battle';
    this.activeConfig = config;
    this.paused = false;
    this.summaryShown = false;
    this.accumulator = 0;

    this.engine = new BattleEngine(config, (ev) => this.sfx.play(ev));
    const canvas = this.battleView.mount(this.engine, {
      verticalMode: config.verticalMode,
      muted: this.sfx.isMuted(),
      voiceMode: this.sfx.getVoiceMode(),
      simSpeed: this.simSpeed,
      tournamentSubtitle,
    });
    this.renderer = new ArenaRenderer(canvas);
    this.renderer.render(this.engine, 0);

    // Start every match with a 3-2-1 countdown before fighters engage
    this.countdownRemaining = 2.7;
    this.countdownGoTimer = 0;
    this.lastCountdownDigit = 3;
    this.battleView.setCountdown('3');
    this.sfx.playCountdown(3);

    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  private togglePause(): boolean {
    if (this.screen !== 'battle' || this.summaryShown) return false;
    this.paused = !this.paused;
    if (this.paused) {
      this.sfx.stopActiveVoice();
    }
    this.battleView.setPaused(this.paused);
    if (!this.paused) {
      this.lastTimestamp = performance.now();
    }
    return this.paused;
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (now: number): void => {
    this.rafId = requestAnimationFrame(this.loop);
    if (!this.engine || !this.renderer) return;

    const frameSec = Math.min(0.05, Math.max(0, (now - this.lastTimestamp) / 1000));
    this.lastTimestamp = now;

    if (!this.paused) {
      if (this.countdownRemaining > 0) {
        this.countdownRemaining = Math.max(0, this.countdownRemaining - frameSec);
        const digit = Math.ceil(this.countdownRemaining / 0.9);
        if (digit > 0 && digit !== this.lastCountdownDigit) {
          this.lastCountdownDigit = digit;
          this.battleView.setCountdown(String(digit));
          this.sfx.playCountdown(digit as 3 | 2 | 1);
        } else if (this.countdownRemaining <= 0) {
          this.lastCountdownDigit = 0;
          this.countdownGoTimer = 0.55;
          this.battleView.setCountdown('FIGHT!');
          this.sfx.playCountdown('go');
        }
        this.renderer.render(this.engine, this.renderTime);
        return;
      }

      if (this.countdownGoTimer > 0) {
        this.countdownGoTimer = Math.max(0, this.countdownGoTimer - frameSec);
        if (this.countdownGoTimer <= 0) {
          this.battleView.setCountdown(null);
        }
      }

      if (this.engine.activeCutIn) {
        this.renderTime += frameSec;
        this.engine.step(frameSec);
      } else {
        this.renderTime += frameSec * this.simSpeed;
        this.accumulator += frameSec * this.simSpeed;

        let steps = 0;
        while (this.accumulator >= FIXED_DT && steps < 6) {
          this.engine.step(FIXED_DT);
          this.accumulator -= FIXED_DT;
          steps += 1;
          if (this.engine.activeCutIn) {
            this.accumulator = 0;
            break;
          }
        }
        if (steps >= 6) {
          this.accumulator = 0;
        }
      }

      this.battleView.updateHud(this.engine);

      if (this.engine.finished && this.engine.matchResult && !this.summaryShown) {
        this.summaryShown = true;
        if (this.tournament) {
          recordTournamentMatchResult(this.tournament, this.engine.matchResult);
          this.battleView.showTournamentBracket(this.tournament, this.engine.matchResult);
        } else {
          this.battleView.showMatchSummary(this.engine.matchResult, this.engine.fighters);
        }
      }
    }

    this.renderer.render(this.engine, this.renderTime);
  };

  private bindKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && this.screen === 'battle' && !this.summaryShown) {
        e.preventDefault();
        this.togglePause();
      } else if (e.key.toLowerCase() === 'm') {
        this.sfx.unlock();
        const muted = this.sfx.toggleMute();
        this.lobby.syncMute(muted);
        if (this.screen === 'battle') {
          this.battleView.setMuted(muted);
        } else {
          this.lobby.render();
        }
      }
    });
  }
}
