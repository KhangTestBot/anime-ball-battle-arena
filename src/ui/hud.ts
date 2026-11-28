import { getVoiceModeLabel } from '../audio/sfx';
import { getCharacterById } from '../characters/roster';
import type { BattleEngine } from '../physics/engine';
import { getLolBuildForCharacter, getNextLolItem, isLolChampion } from '../physics/lolShop';
import type { RecordedVideo } from '../recording/battleRecorder';
import { getCharacterPortraitDataUrl } from '../renderer/characterDraw';
import { getCurrentTournamentMatch, getTournamentRoundLabel } from '../tournament/bracket';
import type {
  FighterState,
  MatchResult,
  SimSpeedOption,
  TournamentState,
  VoiceMode,
} from '../types/game';

export interface BattleViewCallbacks {
  onBackToLobby(): void;
  onRematch(): void;
  onTogglePause(): boolean;
  onToggleRecord(): void;
  onDownloadVideo(): void;
  onChangeSpeed(speed: SimSpeedOption): void;
  onToggleMute(): boolean;
  onCycleVoiceMode(): VoiceMode;
  onToggleVertical(vertical: boolean): void;
  onNextTournamentMatch(): void;
  onRestartTournament(): void;
}

interface HudFighterRefs {
  card: HTMLElement;
  barFill: HTMLElement;
  ultFill: HTMLElement;
  ultText: HTMLElement | null;
  hpText: HTMLElement;
  formText: HTMLElement;
  dmgText: HTMLElement;
  koTag: HTMLElement | null;
  lastFormIndex: number;
  avatarImg: HTMLImageElement | null;
  lolGoldEl: HTMLElement | null;
  lolSlotsEl: HTMLElement | null;
  lolBuyBtnEl: HTMLButtonElement | null;
  lastLolItemsCount: number;
}

function renderLolShopRowHtml(f: FighterState): string {
  if (!isLolChampion(f.character)) return '';
  const build = getLolBuildForCharacter(f.character);
  const next = getNextLolItem(f);
  const slotsHtml = build
    .map(
      (it, idx) =>
        `<span data-lol-slot="${idx}" title="${it.name} (+${it.dmgPct}% DMG · ${it.cost}G)" style="display:inline-block;padding:1px 4px;border-radius:3px;font-size:9px;font-weight:800;border:1px solid #475569;background:rgba(15,23,42,0.85);color:#64748b;">${it.shortName}</span>`,
    )
    .join('');
  return `
    <div class="hud-lol-shop" style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:3px;flex-wrap:wrap;">
      <span data-el="lol-gold" style="font-size:10px;font-weight:800;color:#facc15;">💰 ${Math.floor(f.lolGold)}G</span>
      <div data-el="lol-slots" style="display:flex;gap:2px;flex-wrap:wrap;">${slotsHtml}</div>
      <button type="button" data-buy-lol="${f.uid}" style="font-size:9.5px;font-weight:800;padding:1px 6px;border-radius:4px;border:1px solid #eab308;background:rgba(234,179,8,0.18);color:#fef08a;cursor:pointer;">
        ${next ? `🛒 +Buy (${next.cost}G)` : 'FULL BUILD'}
      </button>
    </div>
  `;
}

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export class BattleView {
  private container: HTMLElement;
  private callbacks: BattleViewCallbacks;
  private canvasEl: HTMLCanvasElement | null = null;
  private stageEl: HTMLElement | null = null;
  private hudRoot: HTMLElement | null = null;
  private overlayRoot: HTMLElement | null = null;
  private countdownEl: HTMLElement | null = null;
  private timerEl: HTMLElement | null = null;
  private sdBadgeEl: HTMLElement | null = null;
  private pauseBtnEl: HTMLButtonElement | null = null;
  private recordBtnEl: HTMLButtonElement | null = null;
  private recordLabelEl: HTMLElement | null = null;
  private recordToastEl: HTMLElement | null = null;
  private toastTimer: number | null = null;
  private lastRecState = false;
  private lastRecSec = -1;
  private muteBtnEl: HTMLButtonElement | null = null;
  private voiceBtnEl: HTMLButtonElement | null = null;
  private verticalBtnEl: HTMLButtonElement | null = null;
  private speedButtons: HTMLButtonElement[] = [];
  private fighterRefs = new Map<string, HudFighterRefs>();
  private verticalMode = false;
  private muted = false;
  private voiceMode: VoiceMode = 'real';
  private simSpeed: SimSpeedOption = 1;

  constructor(container: HTMLElement, callbacks: BattleViewCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.canvasEl;
  }

  public setCountdown(label: string | null): void {
    if (!this.countdownEl) return;
    if (!label) {
      this.countdownEl.classList.add('is-hidden');
      this.countdownEl.classList.remove('is-go');
      this.countdownEl.innerHTML = '';
      return;
    }
    this.countdownEl.classList.remove('is-hidden');
    this.countdownEl.classList.toggle('is-go', label === 'FIGHT!');
    this.countdownEl.innerHTML = `<span class="countdown-text">${label}</span>`;
  }

  public mount(
    engine: BattleEngine,
    opts: {
      verticalMode: boolean;
      muted: boolean;
      voiceMode: VoiceMode;
      simSpeed: SimSpeedOption;
      tournamentSubtitle?: string;
    },
  ): HTMLCanvasElement {
    this.verticalMode = opts.verticalMode;
    this.muted = opts.muted;
    this.voiceMode = opts.voiceMode;
    this.simSpeed = opts.simSpeed;
    this.fighterRefs.clear();

    this.container.innerHTML = `
      <div class="battle-shell">
        <header class="battle-toolbar">
          <div class="toolbar-left">
            <button type="button" class="btn btn-xs btn-ghost" data-action="back-lobby">← Lobby</button>
            <button type="button" class="btn btn-xs btn-ghost" data-action="pause">Pause</button>
            <button type="button" class="btn btn-xs btn-ghost" data-action="rematch">Rematch</button>
            <button type="button" class="btn btn-xs btn-ghost btn-record" data-action="record" title="Record Battle Video (R)">
              <span class="rec-dot"></span><span data-el="record-label">Rec</span>
            </button>
          </div>
          <div class="toolbar-center">
            <span class="battle-clock" data-el="clock">00:00</span>
            <span class="sd-badge is-hidden" data-el="sd-badge">SUDDEN DEATH</span>
          </div>
          <div class="toolbar-right">
            <div class="segmented segmented-xs">
              ${([0.5, 1, 1.5, 2] as SimSpeedOption[])
                .map(
                  (sp) =>
                    `<button type="button" class="seg-btn ${this.simSpeed === sp ? 'is-active' : ''}" data-speed="${sp}">${sp}x</button>`,
                )
                .join('')}
            </div>
            <button type="button" class="btn btn-xs ${this.verticalMode ? 'btn-accent' : 'btn-ghost'}" data-action="vertical">9:16</button>
            <button type="button" class="btn btn-xs ${this.voiceMode === 'off' ? 'btn-ghost is-dim' : 'btn-ghost'}" data-action="voice">${getVoiceModeLabel(this.voiceMode)}</button>
            <button type="button" class="btn btn-xs btn-ghost" data-action="mute">${this.muted ? 'Muted' : 'Sound'}</button>
          </div>
        </header>

        <main class="battle-viewport">
          <div class="battle-stage ${this.verticalMode ? 'is-vertical' : ''}" data-el="stage">
            <div class="hud-container" data-el="hud"></div>
            <div class="arena-wrap">
              <canvas class="arena-canvas" data-el="canvas"></canvas>
              <div class="arena-countdown is-hidden" data-el="countdown" aria-live="assertive"></div>
            </div>
            <div class="vertical-footer">ANIME BALL BATTLE ARENA</div>
          </div>
          <div class="record-toast is-hidden" data-el="record-toast" role="status"></div>
          <div class="overlay-host" data-el="overlay"></div>
        </main>
      </div>
    `;

    this.canvasEl = this.container.querySelector<HTMLCanvasElement>('[data-el="canvas"]');
    this.stageEl = this.container.querySelector<HTMLElement>('[data-el="stage"]');
    this.hudRoot = this.container.querySelector<HTMLElement>('[data-el="hud"]');
    this.overlayRoot = this.container.querySelector<HTMLElement>('[data-el="overlay"]');
    this.countdownEl = this.container.querySelector<HTMLElement>('[data-el="countdown"]');
    this.timerEl = this.container.querySelector<HTMLElement>('[data-el="clock"]');
    this.sdBadgeEl = this.container.querySelector<HTMLElement>('[data-el="sd-badge"]');
    this.pauseBtnEl = this.container.querySelector<HTMLButtonElement>('[data-action="pause"]');
    this.recordBtnEl = this.container.querySelector<HTMLButtonElement>('[data-action="record"]');
    this.recordLabelEl = this.container.querySelector<HTMLElement>('[data-el="record-label"]');
    this.recordToastEl = this.container.querySelector<HTMLElement>('[data-el="record-toast"]');
    this.lastRecState = false;
    this.lastRecSec = -1;
    this.muteBtnEl = this.container.querySelector<HTMLButtonElement>('[data-action="mute"]');
    this.voiceBtnEl = this.container.querySelector<HTMLButtonElement>('[data-action="voice"]');
    this.verticalBtnEl = this.container.querySelector<HTMLButtonElement>(
      '[data-action="vertical"]',
    );
    this.speedButtons = Array.from(
      this.container.querySelectorAll<HTMLButtonElement>('[data-speed]'),
    );

    this.buildHud(engine, opts.tournamentSubtitle);
    this.bindToolbarEvents();
    this.updateHud(engine);

    return this.canvasEl!;
  }

  private buildHud(engine: BattleEngine, tournamentSubtitle?: string): void {
    if (!this.hudRoot) return;
    const fighters = engine.fighters;

    if (fighters.length === 2) {
      // Classic viral 1v1 Duel HUD layout!
      const [a, b] = fighters;
      const formA = engine.getForm(a);
      const formB = engine.getForm(b);

      this.hudRoot.innerHTML = `
        <div class="hud-duel">
          ${tournamentSubtitle ? `<div class="hud-tourney-tag">${tournamentSubtitle}</div>` : ''}
          <div class="hud-duel-title">
            <span class="duel-name-left" style="color:${a.character.primaryColor}">${a.displayName.toUpperCase()}</span>
            <span class="duel-vs-word">vs</span>
            <span class="duel-name-right" style="color:${b.character.primaryColor}">${b.displayName.toUpperCase()}</span>
          </div>
          <div class="hud-duel-bars">
            <div class="duel-side duel-side-left" data-uid="${a.uid}">
              <div class="duel-bar-track">
                <div class="duel-bar-fill" style="background:${a.character.primaryColor}; width:100%"></div>
                <span class="duel-hp-label">${Math.ceil(a.hp)} / ${a.maxHp}</span>
              </div>
              <div class="duel-ult-row">
                <div class="duel-ult-track"><div class="duel-ult-fill" style="width:0%"></div></div>
                <span class="duel-ult-label">ULT 0%</span>
              </div>
              <div class="duel-meta-row">
                <span class="duel-form" style="color:${formA.auraColor}">${formA.name}</span>
                <span class="duel-dmg">DMG +0%</span>
              </div>
              ${renderLolShopRowHtml(a)}
            </div>
            <div class="duel-side duel-side-right" data-uid="${b.uid}">
              <div class="duel-bar-track is-right">
                <div class="duel-bar-fill" style="background:${b.character.primaryColor}; width:100%"></div>
                <span class="duel-hp-label">${Math.ceil(b.hp)} / ${b.maxHp}</span>
              </div>
              <div class="duel-ult-row is-right">
                <span class="duel-ult-label">ULT 0%</span>
                <div class="duel-ult-track is-right"><div class="duel-ult-fill" style="width:0%"></div></div>
              </div>
              <div class="duel-meta-row is-right">
                <span class="duel-dmg">DMG +0%</span>
                <span class="duel-form" style="color:${formB.auraColor}">${formB.name}</span>
              </div>
              ${renderLolShopRowHtml(b)}
            </div>
          </div>
        </div>
      `;

      this.bindLolShopButtons(engine);
      for (const f of fighters) {
        const card = this.hudRoot.querySelector<HTMLElement>(`[data-uid="${f.uid}"]`)!;
        this.fighterRefs.set(f.uid, {
          card,
          barFill: card.querySelector<HTMLElement>('.duel-bar-fill')!,
          ultFill: card.querySelector<HTMLElement>('.duel-ult-fill')!,
          ultText: card.querySelector<HTMLElement>('.duel-ult-label'),
          hpText: card.querySelector<HTMLElement>('.duel-hp-label')!,
          formText: card.querySelector<HTMLElement>('.duel-form')!,
          dmgText: card.querySelector<HTMLElement>('.duel-dmg')!,
          koTag: null,
          lastFormIndex: 0,
          avatarImg: null,
          lolGoldEl: card.querySelector<HTMLElement>('[data-el="lol-gold"]'),
          lolSlotsEl: card.querySelector<HTMLElement>('[data-el="lol-slots"]'),
          lolBuyBtnEl: card.querySelector<HTMLButtonElement>('[data-buy-lol]'),
          lastLolItemsCount: -1,
        });
      }
      return;
    }

    // 3+ fighters compact HUD card grid (FFA or Team Battle)
    const isTeam = engine.config.mode === 'team';
    this.hudRoot.innerHTML = `
      <div class="hud-multi ${fighters.length > 6 ? 'is-dense' : ''}">
        ${fighters
          .map((f) => {
            const form = engine.getForm(f);
            const portrait = getCharacterPortraitDataUrl(f.character, 0, 64);
            const teamClass =
              isTeam && f.teamId === 0
                ? 'is-team-blue'
                : isTeam && f.teamId === 1
                  ? 'is-team-red'
                  : '';
            const barColor =
              isTeam && f.teamId === 0
                ? '#38bdf8'
                : isTeam && f.teamId === 1
                  ? '#f43f5e'
                  : f.character.primaryColor;
            return `
              <div class="hud-card ${teamClass}" data-uid="${f.uid}">
                <div class="hud-card-top">
                  <img class="hud-card-avatar" src="${portrait}" alt="${f.displayName}" width="28" height="28" />
                  <div class="hud-card-ident">
                    <div class="hud-card-name">${f.displayName}</div>
                    <div class="hud-card-form" style="color:${form.auraColor}">${form.name}</div>
                  </div>
                  <span class="hud-card-dmg">DMG +0%</span>
                </div>
                <div class="hud-card-bar-wrap">
                  <div class="hud-card-bar-fill" style="background:${barColor}; width:100%"></div>
                  <span class="hud-card-hp">${Math.ceil(f.hp)}</span>
                </div>
                <div class="hud-card-ult-track">
                  <div class="hud-card-ult-fill" style="width:0%"></div>
                </div>
                ${renderLolShopRowHtml(f)}
                <span class="hud-card-ko is-hidden">KO</span>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    this.bindLolShopButtons(engine);
    for (const f of fighters) {
      const card = this.hudRoot.querySelector<HTMLElement>(`[data-uid="${f.uid}"]`)!;
      this.fighterRefs.set(f.uid, {
        card,
        barFill: card.querySelector<HTMLElement>('.hud-card-bar-fill')!,
        ultFill: card.querySelector<HTMLElement>('.hud-card-ult-fill')!,
        ultText: null,
        hpText: card.querySelector<HTMLElement>('.hud-card-hp')!,
        formText: card.querySelector<HTMLElement>('.hud-card-form')!,
        dmgText: card.querySelector<HTMLElement>('.hud-card-dmg')!,
        koTag: card.querySelector<HTMLElement>('.hud-card-ko'),
        lastFormIndex: 0,
        avatarImg: card.querySelector<HTMLImageElement>('.hud-card-avatar'),
        lolGoldEl: card.querySelector<HTMLElement>('[data-el="lol-gold"]'),
        lolSlotsEl: card.querySelector<HTMLElement>('[data-el="lol-slots"]'),
        lolBuyBtnEl: card.querySelector<HTMLButtonElement>('[data-buy-lol]'),
        lastLolItemsCount: -1,
      });
    }
  }

  private bindLolShopButtons(engine: BattleEngine): void {
    if (!this.hudRoot) return;
    this.hudRoot.querySelectorAll<HTMLButtonElement>('[data-buy-lol]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const uid = btn.getAttribute('data-buy-lol');
        const fighter = engine.fighters.find((x) => x.uid === uid);
        if (fighter) {
          engine.buyNextLolItem(fighter, true);
          this.updateHud(engine);
        }
      });
    });
  }

  public updateHud(engine: BattleEngine): void {
    if (this.timerEl) {
      this.timerEl.textContent = formatClock(engine.elapsed);
    }
    if (this.sdBadgeEl) {
      this.sdBadgeEl.classList.toggle('is-hidden', !engine.suddenDeathActive);
    }

    const isDuel = engine.fighters.length === 2;
    for (const f of engine.fighters) {
      const ref = this.fighterRefs.get(f.uid);
      if (!ref) continue;

      const ratio = Math.max(0, Math.min(100, (f.hp / f.maxHp) * 100));
      ref.barFill.style.width = `${ratio.toFixed(1)}%`;

      const ultPct = Math.max(0, Math.min(100, f.ultimateCharge));
      ref.ultFill.style.width = `${ultPct.toFixed(0)}%`;
      ref.ultFill.classList.toggle('is-full', ultPct >= 95);
      if (ref.ultText) {
        ref.ultText.textContent = ultPct >= 99 ? 'ULT MAX!' : `ULT ${Math.floor(ultPct)}%`;
      }

      const hpVal = Math.ceil(f.hp);
      ref.hpText.textContent = isDuel ? `${hpVal} / ${f.maxHp}` : `${hpVal}`;
      ref.dmgText.textContent = `DMG +${Math.round(f.dmgBonusPct)}%`;

      if (ref.lolGoldEl) {
        ref.lolGoldEl.textContent = `💰 ${Math.floor(f.lolGold)}G (${f.lolItemsCount}/6)`;
      }
      if (ref.lolSlotsEl && ref.lastLolItemsCount !== f.lolItemsCount) {
        ref.lastLolItemsCount = f.lolItemsCount;
        const build = getLolBuildForCharacter(f.character);
        const slotEls = ref.lolSlotsEl.querySelectorAll<HTMLElement>('[data-lol-slot]');
        slotEls.forEach((el, idx) => {
          const item = build[idx];
          if (!item) return;
          if (idx < f.lolItemsCount) {
            el.style.background = item.color;
            el.style.borderColor = item.borderColor;
            el.style.color = '#ffffff';
          }
        });
        if (ref.lolBuyBtnEl) {
          const next = getNextLolItem(f);
          ref.lolBuyBtnEl.textContent = next ? `🛒 +Buy (${next.cost}G)` : 'FULL BUILD';
          ref.lolBuyBtnEl.disabled = !next;
        }
      }

      if (ref.lastFormIndex !== f.formIndex) {
        ref.lastFormIndex = f.formIndex;
        const form = engine.getForm(f);
        ref.formText.textContent = form.name;
        ref.formText.style.color = form.auraColor;
        if (ref.avatarImg) {
          ref.avatarImg.src = getCharacterPortraitDataUrl(f.character, f.formIndex, 64);
        }
      }

      const isKo = !f.alive;
      ref.card.classList.toggle('is-ko', isKo);
      ref.card.classList.toggle('is-low-hp', f.alive && f.hp / f.maxHp <= 0.25);
      if (ref.koTag) {
        ref.koTag.classList.toggle('is-hidden', !isKo);
      }
    }
  }

  public setPaused(paused: boolean): void {
    if (this.pauseBtnEl) {
      this.pauseBtnEl.textContent = paused ? 'Resume' : 'Pause';
      this.pauseBtnEl.classList.toggle('btn-accent', paused);
    }
    if (!this.overlayRoot) return;
    if (paused) {
      this.overlayRoot.innerHTML = `
        <div class="modal-backdrop">
          <div class="modal-card modal-compact">
            <h2 class="modal-title">PAUSED</h2>
            <p class="modal-sub">Press Space or click below to resume the match.</p>
            <div class="modal-actions">
              <button type="button" class="btn btn-primary" data-overlay="resume">Resume</button>
              <button type="button" class="btn btn-secondary" data-overlay="rematch">Rematch</button>
              <button type="button" class="btn btn-ghost" data-overlay="lobby">Back to Lobby</button>
            </div>
          </div>
        </div>
      `;
      this.overlayRoot.querySelector('[data-overlay="resume"]')?.addEventListener('click', () => {
        this.callbacks.onTogglePause();
      });
      this.overlayRoot.querySelector('[data-overlay="rematch"]')?.addEventListener('click', () => {
        this.callbacks.onRematch();
      });
      this.overlayRoot.querySelector('[data-overlay="lobby"]')?.addEventListener('click', () => {
        this.callbacks.onBackToLobby();
      });
    } else {
      this.clearOverlay();
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.muteBtnEl) {
      this.muteBtnEl.textContent = muted ? 'Muted' : 'Sound';
    }
  }

  public setVoiceMode(mode: VoiceMode): void {
    this.voiceMode = mode;
    if (this.voiceBtnEl) {
      this.voiceBtnEl.textContent = getVoiceModeLabel(mode);
      this.voiceBtnEl.classList.toggle('is-dim', mode === 'off');
    }
  }

  public setSimSpeed(speed: SimSpeedOption): void {
    this.simSpeed = speed;
    for (const btn of this.speedButtons) {
      btn.classList.toggle('is-active', Number(btn.dataset.speed) === speed);
    }
  }

  public setVerticalMode(vertical: boolean): void {
    this.verticalMode = vertical;
    this.stageEl?.classList.toggle('is-vertical', vertical);
    if (this.verticalBtnEl) {
      this.verticalBtnEl.classList.toggle('btn-accent', vertical);
      this.verticalBtnEl.classList.toggle('btn-ghost', !vertical);
    }
  }

  public setRecordingState(recording: boolean, elapsedSec = 0): void {
    if (!this.recordBtnEl || !this.recordLabelEl) return;
    const sec = recording ? Math.floor(elapsedSec) : -1;
    if (recording === this.lastRecState && sec === this.lastRecSec) return;
    this.lastRecState = recording;
    this.lastRecSec = sec;
    this.recordBtnEl.classList.toggle('is-recording', recording);
    this.recordLabelEl.textContent = recording ? `Stop ${formatClock(elapsedSec)}` : 'Rec';
    if (this.verticalBtnEl) {
      this.verticalBtnEl.disabled = recording;
      this.verticalBtnEl.title = recording
        ? 'Stop recording before changing aspect ratio'
        : 'Toggle 9:16 Vertical Mode';
    }
  }

  public showRecordToast(message: string): void {
    if (!this.recordToastEl) return;
    if (this.toastTimer !== null) {
      window.clearTimeout(this.toastTimer);
    }
    this.recordToastEl.textContent = message;
    this.recordToastEl.classList.remove('is-hidden');
    this.toastTimer = window.setTimeout(() => {
      this.recordToastEl?.classList.add('is-hidden');
      this.toastTimer = null;
    }, 3400);
  }

  public clearOverlay(): void {
    if (this.overlayRoot) {
      this.overlayRoot.innerHTML = '';
    }
  }

  public showMatchSummary(
    result: MatchResult,
    fighters?: FighterState[],
    recordedVideo?: RecordedVideo | null,
  ): void {
    if (!this.overlayRoot) return;
    const winnerSummary = result.fighters[0];
    const winnerChar = winnerSummary ? getCharacterById(winnerSummary.characterId) : null;
    const winnerPortrait = winnerChar
      ? getCharacterPortraitDataUrl(winnerChar, winnerSummary.finalFormIndex, 120)
      : '';
    const totalKills = result.fighters.reduce((sum, f) => sum + f.kills, 0);
    const topDamage = Math.max(1, ...result.fighters.map((f) => f.damageDealt));

    this.overlayRoot.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-card modal-summary">
          <div class="summary-hero">
            ${winnerPortrait ? `<img class="summary-winner-avatar" src="${winnerPortrait}" alt="${result.winnerName}" width="84" height="84" />` : ''}
            <div class="summary-hero-text">
              <div class="summary-kicker">MATCH RESULTS</div>
              <h2 class="summary-winner-name">${result.winnerName} WINS!</h2>
              <div class="summary-meta-line">
                <span>Duration: <strong>${result.durationSec.toFixed(1)}s</strong></span>
                <span>·</span>
                <span>Total Eliminations: <strong>${totalKills} KO</strong></span>
                ${fighters ? `<span>·</span><span>Fighters: <strong>${fighters.length}</strong></span>` : ''}
              </div>
            </div>
          </div>

          <div class="summary-table-wrap">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fighter</th>
                  <th>Peak Form</th>
                  <th>Damage</th>
                  <th>Kills</th>
                  <th>HP</th>
                </tr>
              </thead>
              <tbody>
                ${result.fighters
                  .map((f) => {
                    const ch = getCharacterById(f.characterId);
                    const icon = getCharacterPortraitDataUrl(ch, f.finalFormIndex, 56);
                    const dmgPct = Math.round((f.damageDealt / topDamage) * 100);
                    const teamBadge =
                      f.teamId === 0
                        ? '<span class="team-dot is-blue"></span>'
                        : f.teamId === 1
                          ? '<span class="team-dot is-red"></span>'
                          : '';
                    return `
                      <tr class="${f.placement === 1 ? 'is-winner-row' : ''}">
                        <td class="num-cell">${f.placement}</td>
                        <td>
                          <div class="table-fighter">
                            ${teamBadge}
                            <img src="${icon}" alt="${f.displayName}" width="26" height="26" />
                            <span>${f.displayName}</span>
                          </div>
                        </td>
                        <td class="form-cell">${f.highestFormName}</td>
                        <td class="num-cell">
                          <div class="dmg-cell">
                            <span>${f.damageDealt}</span>
                            <div class="dmg-mini-bar"><span style="width:${dmgPct}%; background:${f.primaryColor}"></span></div>
                          </div>
                        </td>
                        <td class="num-cell">${f.kills}</td>
                        <td class="num-cell">${f.alive ? `${f.hpRemaining}` : 'KO'}</td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="modal-actions">
            ${
              recordedVideo
                ? `<button type="button" class="btn btn-accent" data-summary="download-video">Download Video (.${recordedVideo.ext.toUpperCase()})</button>`
                : ''
            }
            <button type="button" class="btn btn-primary" data-summary="rematch">Rematch</button>
            <button type="button" class="btn btn-secondary" data-summary="lobby">Back to Lobby</button>
          </div>
        </div>
      </div>
    `;

    this.overlayRoot
      .querySelector('[data-summary="download-video"]')
      ?.addEventListener('click', () => {
        this.callbacks.onDownloadVideo();
      });
    this.overlayRoot.querySelector('[data-summary="rematch"]')?.addEventListener('click', () => {
      this.callbacks.onRematch();
    });
    this.overlayRoot.querySelector('[data-summary="lobby"]')?.addEventListener('click', () => {
      this.callbacks.onBackToLobby();
    });
  }

  public showTournamentBracket(
    tournament: TournamentState,
    lastResult: MatchResult | null,
    recordedVideo?: RecordedVideo | null,
  ): void {
    if (!this.overlayRoot) return;
    const nextMatch = getCurrentTournamentMatch(tournament);
    const totalRounds = tournament.rounds.length;
    const champChar = tournament.champion
      ? getCharacterById(tournament.champion.characterId)
      : null;

    this.overlayRoot.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-card modal-bracket">
          <div class="bracket-header">
            <div>
              <div class="summary-kicker">ELIMINATION TOURNAMENT · ${tournament.size} FIGHTERS</div>
              <h2 class="modal-title">
                ${
                  tournament.completed && champChar
                    ? `CHAMPION: ${champChar.name.toUpperCase()}`
                    : nextMatch
                      ? `UP NEXT: ${getTournamentRoundLabel(totalRounds, nextMatch.roundIndex).toUpperCase()}`
                      : 'TOURNAMENT BRACKET'
                }
              </h2>
            </div>
            ${
              lastResult
                ? `<div class="bracket-last-result">Last Match: <strong>${lastResult.winnerName}</strong> won (${lastResult.durationSec.toFixed(1)}s)</div>`
                : ''
            }
          </div>

          <div class="bracket-columns">
            ${tournament.rounds
              .map((round, rIdx) => {
                const label = getTournamentRoundLabel(totalRounds, rIdx);
                return `
                  <div class="bracket-round">
                    <div class="bracket-round-title">${label}</div>
                    <div class="bracket-match-list">
                      ${round
                        .map((m) => {
                          const isNext =
                            !tournament.completed &&
                            rIdx === tournament.currentRound &&
                            m.matchIndex === tournament.currentMatchIndex;
                          const renderParticipant = (slot: typeof m.fighterA) => {
                            if (!slot) {
                              return `<div class="bracket-slot is-tbd">TBD...</div>`;
                            }
                            const ch = getCharacterById(slot.characterId);
                            const img = getCharacterPortraitDataUrl(ch, 0, 48);
                            const isWin = m.winner?.slotId === slot.slotId;
                            const isLose = m.winner !== null && !isWin;
                            return `
                              <div class="bracket-slot ${isWin ? 'is-win' : ''} ${isLose ? 'is-lose' : ''}">
                                <img src="${img}" alt="${ch.name}" width="24" height="24" />
                                <span>${ch.name}</span>
                              </div>
                            `;
                          };
                          return `
                            <div class="bracket-match ${isNext ? 'is-active' : ''}">
                              ${renderParticipant(m.fighterA)}
                              ${renderParticipant(m.fighterB)}
                            </div>
                          `;
                        })
                        .join('')}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>

          <div class="modal-actions">
            ${
              recordedVideo
                ? `<button type="button" class="btn btn-accent" data-bracket="download-video">Download Video (.${recordedVideo.ext.toUpperCase()})</button>`
                : ''
            }
            ${
              tournament.completed
                ? `
                  <button type="button" class="btn btn-primary" data-bracket="restart">Restart Tournament</button>
                  <button type="button" class="btn btn-secondary" data-bracket="lobby">Back to Lobby</button>
                `
                : `
                  <button type="button" class="btn btn-primary" data-bracket="next">Start Next Match</button>
                  <button type="button" class="btn btn-ghost" data-bracket="lobby">Back to Lobby</button>
                `
            }
          </div>
        </div>
      </div>
    `;

    this.overlayRoot
      .querySelector('[data-bracket="download-video"]')
      ?.addEventListener('click', () => {
        this.callbacks.onDownloadVideo();
      });
    this.overlayRoot.querySelector('[data-bracket="next"]')?.addEventListener('click', () => {
      this.callbacks.onNextTournamentMatch();
    });
    this.overlayRoot.querySelector('[data-bracket="restart"]')?.addEventListener('click', () => {
      this.callbacks.onRestartTournament();
    });
    this.overlayRoot.querySelector('[data-bracket="lobby"]')?.addEventListener('click', () => {
      this.callbacks.onBackToLobby();
    });
  }

  private bindToolbarEvents(): void {
    const root = this.container;
    root.querySelector('[data-action="back-lobby"]')?.addEventListener('click', () => {
      this.callbacks.onBackToLobby();
    });
    root.querySelector('[data-action="pause"]')?.addEventListener('click', () => {
      this.callbacks.onTogglePause();
    });
    root.querySelector('[data-action="rematch"]')?.addEventListener('click', () => {
      this.callbacks.onRematch();
    });
    root.querySelector('[data-action="record"]')?.addEventListener('click', () => {
      this.callbacks.onToggleRecord();
    });
    root.querySelector('[data-action="mute"]')?.addEventListener('click', () => {
      const muted = this.callbacks.onToggleMute();
      this.setMuted(muted);
    });
    root.querySelector('[data-action="voice"]')?.addEventListener('click', () => {
      const mode = this.callbacks.onCycleVoiceMode();
      this.setVoiceMode(mode);
    });
    root.querySelector('[data-action="vertical"]')?.addEventListener('click', () => {
      const next = !this.verticalMode;
      this.setVerticalMode(next);
      this.callbacks.onToggleVertical(next);
    });
    for (const btn of this.speedButtons) {
      btn.addEventListener('click', () => {
        const sp = Number(btn.dataset.speed) as SimSpeedOption;
        this.setSimSpeed(sp);
        this.callbacks.onChangeSpeed(sp);
      });
    }
  }
}
