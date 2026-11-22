import { getVoiceModeLabel } from '../audio/sfx';
import type { RealVoiceStore } from '../audio/voiceStore';
import { CHARACTER_ROSTER, getCharacterById } from '../characters/roster';
import { getLolBuildForCharacter, isLolChampion } from '../physics/lolShop';
import { ARENA_STAGES } from '../renderer/arenaStages';
import { getCharacterPortraitDataUrl } from '../renderer/characterDraw';
import {
  type ArenaSizeKey,
  type ArenaThemeId,
  type BaseHpOption,
  type CharacterCategory,
  type FighterSlot,
  type GameMode,
  HP_PRESETS,
  MAX_BASE_HP,
  MIN_BASE_HP,
  type MatchConfig,
  type SimSpeedOption,
  type TeamSize,
  type TournamentSize,
  type VoiceMode,
} from '../types/game';

export type RosterFilter = 'all' | CharacterCategory;

export interface LobbyState {
  mode: GameMode;
  ffaCount: number;
  teamSize: TeamSize;
  tournamentSize: TournamentSize;
  slots: FighterSlot[];
  selectedSlotIndex: number;
  inspectedCharId: string;
  filter: RosterFilter;
  seriesFilter: string;
  searchQuery: string;
  baseHp: BaseHpOption;
  simSpeed: SimSpeedOption;
  arenaSize: ArenaSizeKey;
  arenaTheme: ArenaThemeId;
  suddenDeath: boolean;
  verticalMode: boolean;
  muted: boolean;
  voiceMode: VoiceMode;
}

export interface LobbyCallbacks {
  onStartMatch(config: MatchConfig, tournamentSize?: TournamentSize): void;
  onToggleMute(): boolean;
  onCycleVoiceMode(): VoiceMode;
  onOpenVoiceManager(): void;
  onQuickUploadVoice(characterId: string, file: File): Promise<void>;
  onPreviewVoice(characterId: string): void;
}

const DEFAULT_MATCHUPS = {
  '1v1': ['luffy', 'goku'],
  ffa: [
    'luffy',
    'goku',
    'steve',
    'herobrine',
    'entity303',
    'warden',
    'gojo',
    'yasuo',
    'sans',
    'wither',
    'naruto',
    'sukuna',
    'kratos',
    'sonic',
    'vergil',
    'jinx',
  ],
  teamBlue: ['luffy', 'goku', 'gojo', 'naruto'],
  teamRed: ['steve', 'herobrine', 'entity303', 'warden'],
  tournament: [
    'luffy',
    'goku',
    'gojo',
    'sukuna',
    'steve',
    'yasuo',
    'sans',
    'kratos',
    'naruto',
    'sasuke',
    'ichigo',
    'saitama',
    'sonic',
    'vergil',
    'jinx',
    'pikachu',
  ],
};

let slotCounter = 1;
function makeSlot(characterId: string, teamId: number | null): FighterSlot {
  slotCounter += 1;
  return { slotId: `slot_${slotCounter}`, characterId, teamId };
}

export function createInitialLobbyState(muted: boolean, voiceMode: VoiceMode): LobbyState {
  return {
    mode: '1v1',
    ffaCount: 4,
    teamSize: 2,
    tournamentSize: 4,
    slots: [makeSlot('luffy', null), makeSlot('goku', null)],
    selectedSlotIndex: 0,
    inspectedCharId: 'luffy',
    filter: 'all',
    seriesFilter: 'all',
    searchQuery: '',
    baseHp: 200,
    simSpeed: 1,
    arenaSize: 'medium',
    arenaTheme: 'cyber-grid',
    suddenDeath: true,
    verticalMode: false,
    muted,
    voiceMode,
  };
}

export class LobbyView {
  private container: HTMLElement;
  private state: LobbyState;
  private voiceStore: RealVoiceStore;
  private callbacks: LobbyCallbacks;

  constructor(
    container: HTMLElement,
    state: LobbyState,
    voiceStore: RealVoiceStore,
    callbacks: LobbyCallbacks,
  ) {
    this.container = container;
    this.state = state;
    this.voiceStore = voiceStore;
    this.callbacks = callbacks;
  }

  public getState(): LobbyState {
    return this.state;
  }

  public syncMute(muted: boolean): void {
    this.state.muted = muted;
  }

  public syncVoiceMode(mode: VoiceMode): void {
    this.state.voiceMode = mode;
  }

  public syncVerticalMode(vertical: boolean): void {
    this.state.verticalMode = vertical;
  }

  public syncSimSpeed(speed: SimSpeedOption): void {
    this.state.simSpeed = speed;
  }

  private getSeriesOptions(): Array<{ series: string; count: number }> {
    const counts = new Map<string, number>();
    for (const char of CHARACTER_ROSTER) {
      if (this.state.filter !== 'all' && char.category !== this.state.filter) continue;
      counts.set(char.series, (counts.get(char.series) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([series, count]) => ({ series, count }))
      .sort((a, b) => b.count - a.count || a.series.localeCompare(b.series));
  }

  private getFilteredRoster() {
    const q = this.state.searchQuery.trim().toLowerCase();
    return CHARACTER_ROSTER.filter((char) => {
      if (this.state.filter !== 'all' && char.category !== this.state.filter) return false;
      if (this.state.seriesFilter !== 'all' && char.series !== this.state.seriesFilter)
        return false;
      if (!q) return true;
      const haystack =
        `${char.name} ${char.series} ${char.abilityName} ${char.id} ${char.category === 'game' ? 'game lol' : char.category === 'meme' ? 'meme viral' : 'anime'}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  public render(preserveSearchFocus = false): void {
    const s = this.state;
    const inspected = getCharacterById(s.inspectedCharId);
    const animeCount = CHARACTER_ROSTER.filter((c) => c.category === 'anime').length;
    const gameCount = CHARACTER_ROSTER.filter((c) => c.category === 'game').length;
    const memeCount = CHARACTER_ROSTER.filter((c) => c.category === 'meme').length;
    const voiceCount = this.voiceStore.getLoadedCount();
    const inspectedVoice = this.voiceStore.getMeta(inspected.id);
    const filtered = this.getFilteredRoster();

    const prevScrollTop =
      this.container.querySelector<HTMLElement>('.roster-scroll')?.scrollTop ?? 0;

    this.container.innerHTML = `
      <div class="lobby-shell">
        <header class="lobby-header">
          <div class="lobby-title-block">
            <h1 class="lobby-title">ANIME BALL BATTLE ARENA</h1>
            <p class="lobby-subtitle">${CHARACTER_ROSTER.length} Fighters (${animeCount} Anime · ${gameCount} Game · ${memeCount} Meme) · Auto-Transformations &amp; Physics Combat</p>
          </div>
          <div class="lobby-header-actions">
            <button type="button" class="btn btn-secondary" data-action="open-voice-manager">
              Real Voices (${voiceCount}/${CHARACTER_ROSTER.length})
            </button>
            <button type="button" class="btn btn-ghost" data-action="cycle-voice" aria-label="Voice mode">
              ${getVoiceModeLabel(s.voiceMode)}
            </button>
            <button type="button" class="btn btn-ghost" data-action="toggle-mute" aria-label="Sound">
              ${s.muted ? 'Sound: Off' : 'Sound: On'}
            </button>
          </div>
        </header>

        <div class="lobby-grid">
          <section class="panel lobby-main">
            <div class="section-row">
              <span class="section-label">Game Mode</span>
              <div class="segmented" role="tablist">
                ${this.renderModeBtn('1v1', '1v1 Duel')}
                ${this.renderModeBtn('ffa', 'Battle Royale')}
                ${this.renderModeBtn('team', 'Team Battle')}
                ${this.renderModeBtn('tournament', 'Tournament')}
              </div>
            </div>

            ${this.renderModeSubOptions()}

            <div class="slots-panel">
              <div class="slots-header">
                <span class="section-label">${this.getSlotsHeading()}</span>
                <div class="slots-quick-actions">
                  ${
                    s.mode === 'team'
                      ? `
                        <button type="button" class="btn btn-xs btn-ghost" data-action="preset-anime-vs-game">Anime vs Game</button>
                        <button type="button" class="btn btn-xs btn-ghost" data-action="fill-team">Fill Team with Selected</button>
                      `
                      : ''
                  }
                  <button type="button" class="btn btn-xs btn-ghost" data-action="random-matchup">Random Matchup</button>
                </div>
              </div>
              ${this.renderSlotsGrid()}
              <p class="slots-hint">Select a slot above, then click any fighter below (duplicate picks allowed).</p>
            </div>

            <div class="roster-section">
              <div class="roster-toolbar">
                <div class="segmented segmented-xs">
                  <button type="button" class="seg-btn ${s.filter === 'all' ? 'is-active' : ''}" data-filter="all">All (${CHARACTER_ROSTER.length})</button>
                  <button type="button" class="seg-btn ${s.filter === 'anime' ? 'is-active' : ''}" data-filter="anime">Anime (${animeCount})</button>
                  <button type="button" class="seg-btn ${s.filter === 'game' ? 'is-active' : ''}" data-filter="game">Game (${gameCount})</button>
                  <button type="button" class="seg-btn ${s.filter === 'meme' ? 'is-active' : ''}" data-filter="meme">Meme (${memeCount})</button>
                </div>
                <div class="roster-search-wrap">
                  <select class="roster-series-select" data-el="series-filter" aria-label="Filter by Anime/Game series">
                    <option value="all" ${s.seriesFilter === 'all' ? 'selected' : ''}>All Series (${this.getSeriesOptions().length} series)</option>
                    ${this.getSeriesOptions()
                      .map(
                        (opt) =>
                          `<option value="${escapeAttr(opt.series)}" ${s.seriesFilter === opt.series ? 'selected' : ''}>${escapeHtml(opt.series)} (${opt.count})</option>`,
                      )
                      .join('')}
                  </select>
                  <input
                    type="search"
                    class="roster-search"
                    data-el="roster-search"
                    placeholder="Search name, Anime series, Minecraft, LoL..."
                    value="${escapeAttr(s.searchQuery)}"
                  />
                  <span class="section-meta">Slot #${s.selectedSlotIndex + 1}</span>
                </div>
              </div>

              <div class="roster-scroll">
                ${
                  filtered.length === 0
                    ? `<div class="roster-empty">No fighters found matching "${escapeHtml(s.searchQuery)}".</div>`
                    : `<div class="roster-grid">
                        ${filtered
                          .map((char) => {
                            const portrait = getCharacterPortraitDataUrl(char, 0, 88);
                            const isInspected = char.id === s.inspectedCharId;
                            const countPicked = s.slots.filter(
                              (sl) => sl.characterId === char.id,
                            ).length;
                            const hasRealVoice = this.voiceStore.hasRealVoice(char.id);
                            return `
                              <button
                                type="button"
                                class="roster-card ${isInspected ? 'is-inspected' : ''} ${countPicked > 0 ? 'is-picked' : ''}"
                                data-char-id="${char.id}"
                                style="--char-color: ${char.primaryColor};"
                              >
                                ${
                                  char.category === 'game'
                                    ? `<span class="roster-cat-tag">GAME</span>`
                                    : char.category === 'meme'
                                      ? `<span class="roster-cat-tag">MEME</span>`
                                      : ''
                                }
                                ${hasRealVoice ? `<span class="roster-voice-dot" title="Real voice attached"></span>` : ''}
                                ${countPicked > 0 ? `<span class="roster-count">×${countPicked}</span>` : ''}
                                <img class="roster-avatar" src="${portrait}" alt="${char.name}" width="50" height="50" loading="lazy" />
                                <span class="roster-name">${char.name}</span>
                                <span class="roster-series">${char.series}</span>
                                <span class="roster-forms">${char.forms.length} forms</span>
                              </button>
                            `;
                          })
                          .join('')}
                      </div>`
                }
              </div>

              <div class="char-detail-bar" style="--char-color: ${inspected.primaryColor};">
                <img class="detail-avatar" src="${getCharacterPortraitDataUrl(inspected, inspected.forms.length - 1, 88)}" alt="${inspected.name}" width="54" height="54" />
                <div class="detail-info">
                  <div class="detail-top">
                    <strong>${inspected.name}</strong>
                    <span class="detail-series">${inspected.series}</span>
                    <span class="detail-ability-name">${inspected.abilityName}</span>
                  </div>
                  <p class="detail-desc">${inspected.abilityDesc}</p>
                  <div class="detail-skills-list">
                    ${inspected.skills
                      .map(
                        (sk) =>
                          `<span class="skill-chip" title="${escapeAttr(sk.desc)}" style="--sk-color:${sk.color}"><em class="skill-key">${sk.key}</em>${sk.name}</span>`,
                      )
                      .join('')}
                  </div>
                  ${
                    isLolChampion(inspected)
                      ? `<div class="detail-skills-list" style="margin-top:4px;">
                          <span class="detail-ult-badge" style="border-color:#eab308; color:#facc15;">LOL ITEM SHOP (6 ITEMS)</span>
                          ${getLolBuildForCharacter(inspected)
                            .map(
                              (it, idx) =>
                                `<span class="skill-chip" title="${escapeAttr(`${it.name} (${it.cost}G): +${it.dmgPct}% DMG`)}" style="--sk-color:${it.color}"><em class="skill-key">ITEM ${idx + 1}</em>${it.name} (+${it.dmgPct}%)</span>`,
                            )
                            .join('')}
                        </div>`
                      : ''
                  }
                  <div class="detail-ultimate">
                    <span class="detail-ult-badge" style="border-color:${inspected.ultimate.color}; color:${inspected.ultimate.color}">ULTIMATE</span>
                    <strong>${inspected.ultimate.name}</strong>
                    <span class="detail-ult-quote">"${inspected.ultimate.voiceLine}"</span>
                  </div>
                  <div class="detail-voice-row">
                    <span class="detail-voice-status ${inspectedVoice ? 'is-ready' : ''}">
                      ${inspectedVoice ? `Real Voice: ${escapeHtml(inspectedVoice.fileName)}` : 'No real voice file attached (.mp3/.wav)'}
                    </span>
                    <label class="btn btn-xs btn-secondary vm-file-btn">
                      ${inspectedVoice ? 'Replace Voice' : '+ Attach Real Voice'}
                      <input type="file" accept="audio/*" data-quick-voice="${inspected.id}" hidden />
                    </label>
                    ${
                      inspectedVoice
                        ? `<button type="button" class="btn btn-xs btn-ghost" data-action="preview-voice" data-char="${inspected.id}">Preview</button>`
                        : ''
                    }
                  </div>
                  <div class="detail-forms-chain">
                    ${inspected.forms.map((f) => `<span class="form-step" style="border-color:${f.auraColor}">${f.name}</span>`).join('<span class="form-arrow">→</span>')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside class="panel lobby-sidebar">
            <h2 class="sidebar-heading">Match Settings</h2>

            <div class="setting-group">
              <div class="setting-label-row">
                <label class="setting-label" for="hp-custom-num">Base HP (max ${MAX_BASE_HP})</label>
                <span class="setting-value" data-el="hp-readout">${s.baseHp} HP</span>
              </div>
              <div class="hp-presets-grid">
                ${HP_PRESETS.map(
                  (hp) =>
                    `<button type="button" class="seg-btn ${s.baseHp === hp ? 'is-active' : ''}" data-hp="${hp}">${hp}</button>`,
                ).join('')}
              </div>
              <div class="hp-custom-row">
                <input
                  type="range"
                  class="hp-slider"
                  data-el="hp-slider"
                  min="${MIN_BASE_HP}"
                  max="${MAX_BASE_HP}"
                  step="50"
                  value="${s.baseHp}"
                  aria-label="Base HP slider"
                />
                <input
                  id="hp-custom-num"
                  type="number"
                  class="hp-number-input"
                  data-el="hp-number"
                  min="${MIN_BASE_HP}"
                  max="${MAX_BASE_HP}"
                  step="50"
                  value="${s.baseHp}"
                />
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Simulation Speed</label>
              <div class="segmented segmented-full">
                ${([0.5, 1, 1.5, 2] as SimSpeedOption[])
                  .map(
                    (sp) =>
                      `<button type="button" class="seg-btn ${s.simSpeed === sp ? 'is-active' : ''}" data-speed="${sp}">${sp}x</button>`,
                  )
                  .join('')}
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Arena Size</label>
              <div class="segmented segmented-full">
                ${(
                  [
                    ['small', 'Small'],
                    ['medium', 'Medium'],
                    ['large', 'Large'],
                  ] as Array<[ArenaSizeKey, string]>
                )
                  .map(
                    ([key, label]) =>
                      `<button type="button" class="seg-btn ${s.arenaSize === key ? 'is-active' : ''}" data-arena="${key}">${label}</button>`,
                  )
                  .join('')}
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Battle Arena (${ARENA_STAGES.length} Stages)</label>
              <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;">
                ${ARENA_STAGES.map(
                  (stage) => `
                    <button
                      type="button"
                      class="seg-btn ${s.arenaTheme === stage.id ? 'is-active' : ''}"
                      data-arena-theme="${stage.id}"
                      title="${escapeAttr(`${stage.name} (${stage.series})`)}"
                      style="display:flex;align-items:center;gap:6px;justify-content:flex-start;padding:6px 8px;text-align:left;font-size:11px;border-left:3px solid ${stage.accentColor};"
                    >
                      <span style="display:inline-block;width:8px;height:8px;border-radius:99px;background:${stage.accentColor};flex-shrink:0;"></span>
                      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${stage.name}</span>
                    </button>
                  `,
                ).join('')}
              </div>
            </div>

            <div class="toggle-list">
              <label class="toggle-row">
                <div>
                  <div class="toggle-title">Sudden Death</div>
                  <div class="toggle-desc">Arena walls shrink inward during extended battles</div>
                </div>
                <input type="checkbox" data-toggle="suddenDeath" ${s.suddenDeath ? 'checked' : ''} />
              </label>

              <label class="toggle-row">
                <div>
                  <div class="toggle-title">9:16 Vertical (TikTok Mode)</div>
                  <div class="toggle-desc">Displays a short-video vertical frame alongside desktop view</div>
                </div>
                <input type="checkbox" data-toggle="verticalMode" ${s.verticalMode ? 'checked' : ''} />
              </label>
            </div>

            <div class="sidebar-cta">
              <button type="button" class="btn btn-primary btn-lg" data-action="start-match">
                ${s.mode === 'tournament' ? `START TOURNAMENT (${s.tournamentSize} FIGHTERS)` : 'START BATTLE'}
              </button>
              <button type="button" class="btn btn-secondary" data-action="random-matchup">
                Randomize Matchup
              </button>
            </div>
          </aside>
        </div>
        <div class="overlay-host" data-el="lobby-modal"></div>
      </div>
    `;

    const scrollEl = this.container.querySelector<HTMLElement>('.roster-scroll');
    if (scrollEl) scrollEl.scrollTop = prevScrollTop;

    this.bindEvents();

    if (preserveSearchFocus) {
      const searchEl = this.container.querySelector<HTMLInputElement>('[data-el="roster-search"]');
      if (searchEl) {
        searchEl.focus();
        searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
      }
    }
  }

  private renderModeBtn(mode: GameMode, label: string): string {
    return `<button type="button" class="seg-btn ${this.state.mode === mode ? 'is-active' : ''}" data-mode="${mode}">${label}</button>`;
  }

  private renderModeSubOptions(): string {
    const s = this.state;
    if (s.mode === 'ffa') {
      const presets = [3, 4, 6, 8, 12, 16];
      return `
        <div class="sub-options-row">
          <span class="setting-label">Battle Royale Fighters:</span>
          <div class="segmented">
            ${presets
              .map(
                (n) =>
                  `<button type="button" class="seg-btn ${s.ffaCount === n ? 'is-active' : ''}" data-ffa-count="${n}">${n}</button>`,
              )
              .join('')}
          </div>
        </div>
      `;
    }
    if (s.mode === 'team') {
      return `
        <div class="sub-options-row">
          <span class="setting-label">Team Size:</span>
          <div class="segmented">
            ${([2, 3, 4] as TeamSize[])
              .map(
                (n) =>
                  `<button type="button" class="seg-btn ${s.teamSize === n ? 'is-active' : ''}" data-team-size="${n}">${n}v${n}</button>`,
              )
              .join('')}
          </div>
        </div>
      `;
    }
    if (s.mode === 'tournament') {
      return `
        <div class="sub-options-row">
          <span class="setting-label">Elimination Bracket:</span>
          <div class="segmented">
            ${([4, 8, 16] as TournamentSize[])
              .map(
                (n) =>
                  `<button type="button" class="seg-btn ${s.tournamentSize === n ? 'is-active' : ''}" data-tourney-size="${n}">${n} fighters</button>`,
              )
              .join('')}
          </div>
        </div>
      `;
    }
    return '';
  }

  private getSlotsHeading(): string {
    const s = this.state;
    if (s.mode === '1v1') return '1v1 Duel Matchup';
    if (s.mode === 'team') return `${s.teamSize}v${s.teamSize} Teams (no friendly fire)`;
    if (s.mode === 'tournament') return `Tournament Seeds (${s.tournamentSize} fighters)`;
    return `Battle Royale Lineup (${s.slots.length} fighters)`;
  }

  private renderSlotsGrid(): string {
    const s = this.state;

    if (s.mode === '1v1') {
      return `
        <div class="slots-duel">
          ${this.renderSlotChip(s.slots[0], 0)}
          <span class="duel-vs">VS</span>
          ${this.renderSlotChip(s.slots[1], 1)}
        </div>
      `;
    }

    if (s.mode === 'team') {
      const blueIndices = s.slots
        .map((sl, idx) => ({ sl, idx }))
        .filter((item) => item.sl.teamId === 0);
      const redIndices = s.slots
        .map((sl, idx) => ({ sl, idx }))
        .filter((item) => item.sl.teamId === 1);

      return `
        <div class="slots-teams">
          <div class="team-column team-blue">
            <div class="team-col-title">Blue Team (Team A)</div>
            <div class="team-slot-list">
              ${blueIndices.map(({ sl, idx }) => this.renderSlotChip(sl, idx)).join('')}
            </div>
          </div>
          <div class="team-column team-red">
            <div class="team-col-title">Red Team (Team B)</div>
            <div class="team-slot-list">
              ${redIndices.map(({ sl, idx }) => this.renderSlotChip(sl, idx)).join('')}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="slots-grid ${s.slots.length > 8 ? 'is-compact' : ''}">
        ${s.slots.map((sl, idx) => this.renderSlotChip(sl, idx)).join('')}
      </div>
    `;
  }

  private renderSlotChip(slot: FighterSlot, index: number): string {
    const char = getCharacterById(slot.characterId);
    const portrait = getCharacterPortraitDataUrl(char, 0, 72);
    const isSelected = index === this.state.selectedSlotIndex;
    const teamClass = slot.teamId === 0 ? 'is-team-blue' : slot.teamId === 1 ? 'is-team-red' : '';
    return `
      <button
        type="button"
        class="slot-chip ${isSelected ? 'is-selected' : ''} ${teamClass}"
        data-slot-index="${index}"
        style="--char-color: ${char.primaryColor};"
      >
        <span class="slot-num">#${index + 1}</span>
        <img src="${portrait}" alt="${char.name}" width="32" height="32" />
        <span class="slot-name">${char.name}</span>
      </button>
    `;
  }

  private rebuildSlotsForMode(): void {
    const s = this.state;
    const existingIds = s.slots.map((sl) => sl.characterId);

    if (s.mode === '1v1') {
      s.slots = [
        makeSlot(existingIds[0] ?? DEFAULT_MATCHUPS['1v1'][0], null),
        makeSlot(existingIds[1] ?? DEFAULT_MATCHUPS['1v1'][1], null),
      ];
    } else if (s.mode === 'ffa') {
      const next: FighterSlot[] = [];
      for (let i = 0; i < s.ffaCount; i++) {
        const fallback =
          DEFAULT_MATCHUPS.ffa[i] ?? CHARACTER_ROSTER[i % CHARACTER_ROSTER.length].id;
        next.push(makeSlot(existingIds[i] ?? fallback, null));
      }
      s.slots = next;
    } else if (s.mode === 'team') {
      const next: FighterSlot[] = [];
      for (let i = 0; i < s.teamSize; i++) {
        next.push(makeSlot(DEFAULT_MATCHUPS.teamBlue[i % DEFAULT_MATCHUPS.teamBlue.length], 0));
      }
      for (let i = 0; i < s.teamSize; i++) {
        next.push(makeSlot(DEFAULT_MATCHUPS.teamRed[i % DEFAULT_MATCHUPS.teamRed.length], 1));
      }
      s.slots = next;
    } else {
      const next: FighterSlot[] = [];
      for (let i = 0; i < s.tournamentSize; i++) {
        const fallback =
          DEFAULT_MATCHUPS.tournament[i] ?? CHARACTER_ROSTER[i % CHARACTER_ROSTER.length].id;
        next.push(makeSlot(existingIds[i] ?? fallback, null));
      }
      s.slots = next;
    }

    s.selectedSlotIndex = 0;
  }

  private randomizeMatchup(): void {
    const s = this.state;
    const activePool = this.getFilteredRoster();
    const pool = [...(activePool.length >= s.slots.length ? activePool : CHARACTER_ROSTER)];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    s.slots = s.slots.map((sl, idx) => ({
      ...sl,
      characterId: pool[idx % pool.length].id,
    }));
    s.inspectedCharId = s.slots[0]?.characterId ?? 'luffy';
  }

  private applyAnimeVsGamePreset(): void {
    const s = this.state;
    const animePool = CHARACTER_ROSTER.filter((c) => c.category === 'anime');
    const gamePool = CHARACTER_ROSTER.filter((c) => c.category === 'game');
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const pickedAnime = shuffle(animePool);
    const pickedGame = shuffle(gamePool);
    let aIdx = 0;
    let gIdx = 0;
    s.slots = s.slots.map((sl) => {
      if (sl.teamId === 0) {
        return { ...sl, characterId: pickedAnime[aIdx++ % pickedAnime.length].id };
      }
      return { ...sl, characterId: pickedGame[gIdx++ % pickedGame.length].id };
    });
  }

  private bindEvents(): void {
    const root = this.container;

    root.querySelectorAll<HTMLElement>('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as GameMode;
        if (mode !== this.state.mode) {
          this.state.mode = mode;
          this.rebuildSlotsForMode();
          this.render();
        }
      });
    });

    root.querySelectorAll<HTMLElement>('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.filter = btn.dataset.filter as RosterFilter;
        const validSeries = this.getSeriesOptions().some(
          (opt) => opt.series === this.state.seriesFilter,
        );
        if (!validSeries) this.state.seriesFilter = 'all';
        this.render();
      });
    });

    root
      .querySelector<HTMLSelectElement>('[data-el="series-filter"]')
      ?.addEventListener('change', (e) => {
        this.state.seriesFilter = (e.target as HTMLSelectElement).value;
        this.render();
      });

    root
      .querySelector<HTMLInputElement>('[data-el="roster-search"]')
      ?.addEventListener('input', (e) => {
        this.state.searchQuery = (e.target as HTMLInputElement).value;
        this.render(true);
      });

    root.querySelectorAll<HTMLElement>('[data-ffa-count]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.ffaCount = Number(btn.dataset.ffaCount);
        this.rebuildSlotsForMode();
        this.render();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-team-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.teamSize = Number(btn.dataset.teamSize) as TeamSize;
        this.rebuildSlotsForMode();
        this.render();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-tourney-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.tournamentSize = Number(btn.dataset.tourneySize) as TournamentSize;
        this.rebuildSlotsForMode();
        this.render();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-slot-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.slotIndex);
        this.state.selectedSlotIndex = idx;
        const slot = this.state.slots[idx];
        if (slot) this.state.inspectedCharId = slot.characterId;
        this.render();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-char-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const charId = btn.dataset.charId!;
        this.state.inspectedCharId = charId;
        const idx = this.state.selectedSlotIndex;
        if (this.state.slots[idx]) {
          this.state.slots[idx] = { ...this.state.slots[idx], characterId: charId };
          this.state.selectedSlotIndex = (idx + 1) % this.state.slots.length;
        }
        this.render();
      });
    });

    const hpButtons = Array.from(root.querySelectorAll<HTMLElement>('[data-hp]'));
    const hpSlider = root.querySelector<HTMLInputElement>('[data-el="hp-slider"]');
    const hpNumber = root.querySelector<HTMLInputElement>('[data-el="hp-number"]');
    const hpReadout = root.querySelector<HTMLElement>('[data-el="hp-readout"]');

    const applyHpValue = (raw: number, syncInputs: boolean) => {
      const clamped = Math.max(MIN_BASE_HP, Math.min(MAX_BASE_HP, Math.round(raw || 200)));
      this.state.baseHp = clamped;
      if (hpReadout) hpReadout.textContent = `${clamped} HP`;
      if (syncInputs) {
        if (hpSlider) hpSlider.value = String(clamped);
        if (hpNumber) hpNumber.value = String(clamped);
      }
      for (const b of hpButtons) {
        b.classList.toggle('is-active', Number(b.dataset.hp) === clamped);
      }
    };

    hpButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyHpValue(Number(btn.dataset.hp), true);
      });
    });

    hpSlider?.addEventListener('input', () => {
      const val = Number(hpSlider.value);
      applyHpValue(val, false);
      if (hpNumber) hpNumber.value = String(this.state.baseHp);
    });

    hpNumber?.addEventListener('change', () => {
      applyHpValue(Number(hpNumber.value), true);
    });

    root.querySelectorAll<HTMLElement>('[data-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.simSpeed = Number(btn.dataset.speed) as SimSpeedOption;
        this.render();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-arena]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.arenaSize = btn.dataset.arena as ArenaSizeKey;
        this.render();
      });
    });

    root.querySelectorAll<HTMLElement>('[data-arena-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.arenaTheme = btn.dataset.arenaTheme as ArenaThemeId;
        this.render();
      });
    });

    root.querySelectorAll<HTMLInputElement>('[data-toggle]').forEach((input) => {
      input.addEventListener('change', () => {
        const key = input.dataset.toggle;
        if (key === 'suddenDeath') this.state.suddenDeath = input.checked;
        if (key === 'verticalMode') this.state.verticalMode = input.checked;
      });
    });

    root.querySelectorAll<HTMLElement>('[data-action="random-matchup"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.randomizeMatchup();
        this.render();
      });
    });

    root
      .querySelector<HTMLElement>('[data-action="preset-anime-vs-game"]')
      ?.addEventListener('click', () => {
        this.applyAnimeVsGamePreset();
        this.render();
      });

    root.querySelector<HTMLElement>('[data-action="fill-team"]')?.addEventListener('click', () => {
      const current = this.state.slots[this.state.selectedSlotIndex];
      if (!current || current.teamId === null) return;
      const targetTeam = current.teamId;
      const charId = this.state.inspectedCharId;
      this.state.slots = this.state.slots.map((sl) =>
        sl.teamId === targetTeam ? { ...sl, characterId: charId } : sl,
      );
      const otherIdx = this.state.slots.findIndex((sl) => sl.teamId !== targetTeam);
      if (otherIdx !== -1) this.state.selectedSlotIndex = otherIdx;
      this.render();
    });

    root
      .querySelector<HTMLElement>('[data-action="toggle-mute"]')
      ?.addEventListener('click', () => {
        this.state.muted = this.callbacks.onToggleMute();
        this.render();
      });

    root
      .querySelector<HTMLElement>('[data-action="cycle-voice"]')
      ?.addEventListener('click', () => {
        this.state.voiceMode = this.callbacks.onCycleVoiceMode();
        this.render();
      });

    root
      .querySelector<HTMLElement>('[data-action="open-voice-manager"]')
      ?.addEventListener('click', () => {
        this.callbacks.onOpenVoiceManager();
      });

    root.querySelector<HTMLInputElement>('[data-quick-voice]')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      const charId = input.dataset.quickVoice!;
      const file = input.files?.[0];
      if (!file) return;
      void this.callbacks.onQuickUploadVoice(charId, file).then(() => {
        this.render();
      });
    });

    root
      .querySelector<HTMLElement>('[data-action="preview-voice"]')
      ?.addEventListener('click', (e) => {
        const charId = (e.currentTarget as HTMLElement).dataset.char!;
        this.callbacks.onPreviewVoice(charId);
      });

    root
      .querySelector<HTMLElement>('[data-action="start-match"]')
      ?.addEventListener('click', () => {
        const config: MatchConfig = {
          mode: this.state.mode,
          slots: this.state.slots.map((sl) => ({ ...sl })),
          baseHp: this.state.baseHp,
          simSpeed: this.state.simSpeed,
          arenaSize: this.state.arenaSize,
          arenaTheme: this.state.arenaTheme,
          suddenDeath: this.state.suddenDeath,
          verticalMode: this.state.verticalMode,
        };
        this.callbacks.onStartMatch(
          config,
          this.state.mode === 'tournament' ? this.state.tournamentSize : undefined,
        );
      });
  }
}

function escapeAttr(val: string): string {
  return val.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(val: string): string {
  return val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
