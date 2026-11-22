export type GameMode = '1v1' | 'ffa' | 'team' | 'tournament';
export type TeamSize = 2 | 3 | 4;
export type TournamentSize = 4 | 8 | 16;
export type ArenaSizeKey = 'small' | 'medium' | 'large';
export type ArenaThemeId =
  | 'cyber-grid'
  | 'tournament-of-power'
  | 'final-valley'
  | 'shibuya-crossing'
  | 'marineford-bay'
  | 'summoners-rift'
  | 'nether-fortress'
  | 'hueco-mundo';
export type BaseHpOption = number;
export type SimSpeedOption = 0.5 | 1 | 1.5 | 2;
export type CharacterCategory = 'anime' | 'game' | 'meme';

export const MAX_BASE_HP = 5000;
export const MIN_BASE_HP = 50;
export const HP_PRESETS = [100, 200, 500, 1000, 2500, 5000] as const;

export type AbilityId = string;

export type AccessoryId = string;

export interface FormTrigger {
  /** Base elapsed seconds (for 200 HP reference; scales with baseHp) */
  timeSec: number;
  /** Trigger when HP ratio drops to or below this fraction */
  hpRatioBelow: number;
  /** Trigger when cumulative damage dealt reaches this value (for 200 HP ref) */
  damageDealt: number;
}

export interface FormConfig {
  name: string;
  visualVariant: string;
  auraColor: string;
  auraSecondaryColor?: string;
  hairColor: string;
  eyeColor?: string;
  speedMult: number;
  damageMult: number;
  armorBonus?: number;
  radiusMult?: number;
  dodgeChance?: number;
  lifestealRatio?: number;
  cooldownMult?: number;
  powerLevel: number;
  calloutText?: string;
  trigger?: FormTrigger;
}

export interface CharacterBaseStats {
  speed: number;
  damage: number;
  mass: number;
  armor: number;
  radius: number;
  abilityCooldown: number;
}

export type UltimateArchetype =
  | 'mega-beam'
  | 'slash-storm'
  | 'mega-fist'
  | 'domain-void'
  | 'meteor-rain'
  | 'thunder-storm'
  | 'tnt-barrage'
  | 'gaster-cross'
  | 'gravity-crush'
  | 'mega-shockwave'
  | 'shadow-legion'
  | 'blade-vortex';

export interface UltimateConfig {
  name: string;
  desc: string;
  voiceLine: string;
  voicePitch: number;
  voiceRate: number;
  voiceGender?: 'male' | 'female' | 'neutral';
  archetype: UltimateArchetype;
  color: string;
}

export interface UltimateCutInState {
  fighterUid: string;
  characterId: string;
  displayName: string;
  formName: string;
  formIndex: number;
  ultimate: UltimateConfig;
  timer: number;
  duration: number;
  executed: boolean;
}

export type SkillEffectKind =
  | 'dash-strike'
  | 'ricochet-arm'
  | 'projectile-fan'
  | 'heavy-orb'
  | 'boomerang-orb'
  | 'homing-swarm'
  | 'beam-shot'
  | 'slash-cross'
  | 'shockwave-nova'
  | 'shield-buff'
  | 'heal-item'
  | 'teleport-strike'
  | 'drop-bomb'
  | 'chain-lightning'
  | 'gravity-pull'
  | 'summon-minion'
  | 'summon-dragon'
  | 'sky-pillar'
  | 'sonic-boom'
  | 'trail-surge'
  | 'odm-zip';

export type SkillPattern =
  | 'fan'
  | 'spiral-burst'
  | 'pincer-converge'
  | 'orbital-ring'
  | 'gatling-stream'
  | 'carpet-bombs'
  | 'x-cleave-storm'
  | 'chain-hook-reel'
  | 'sky-judgment'
  | 'zigzag-blitz'
  | 'domain-zone'
  | 'gate-barrage'
  | 'transmute-ring'
  | 'shadow-ambush'
  | 'gravity-vortex'
  | 'counter-nova'
  | 'combo-finisher';

export interface SkillDef {
  key: string;
  name: string;
  desc: string;
  effect: SkillEffectKind;
  color: string;
  power?: number;
  count?: number;
  healPct?: number;
  callout?: string;
  projectileKind?: ProjectileKind;
  bombKind?: Bomb['kind'];
  pattern?: SkillPattern;
  visualMotif?: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  series: string;
  category: CharacterCategory;
  abilityId: AbilityId;
  abilityName: string;
  abilityDesc: string;
  skills: SkillDef[];
  ultimate: UltimateConfig;
  primaryColor: string;
  secondaryColor: string;
  skinColor: string;
  eyeColor: string;
  accessory: AccessoryId;
  baseStats: CharacterBaseStats;
  forms: FormConfig[];
}

export interface FighterSlot {
  slotId: string;
  characterId: string;
  teamId: number | null;
}

export interface MatchConfig {
  mode: GameMode;
  slots: FighterSlot[];
  baseHp: BaseHpOption;
  simSpeed: SimSpeedOption;
  arenaSize: ArenaSizeKey;
  arenaTheme?: ArenaThemeId;
  suddenDeath: boolean;
  verticalMode: boolean;
}

export interface Afterimage {
  x: number;
  y: number;
  alpha: number;
  color: string;
  formIndex: number;
}

export type StatusStunKind =
  | 'void-overload'
  | 'time-stop'
  | 'frozen'
  | 'genjutsu'
  | 'chained'
  | 'airborne'
  | 'petrified'
  | 'fear';

export type ArenaDomainKind =
  | 'unlimited-void'
  | 'malevolent-shrine'
  | 'time-stop'
  | 'ope-room'
  | 'tsukuyomi'
  | 'gear5-toonworld'
  | 'spirit-bomb-ui'
  | 'gate-of-babylon'
  | 'unlimited-blade-works'
  | 'shadow-monarch'
  | 'minecraft-end'
  | 'herobrine-corruption'
  | 'deep-dark-sculk'
  | 'undertale-badtime'
  | 'compass-needle'
  | 'senbonzakura-bankai'
  | 'quake-shatter'
  | 'birdcage-strings'
  | 'coffin-volcano'
  | 'idle-death-gamble'
  | 'frozen-glacier'
  | 'transmutation-array'
  | 'mahoujin-grand-magic'
  | 'high-noon-sun'
  | 'full-counter-cube'
  | 'chibaku-gravity'
  | 'rumbling-colossal'
  | 'lol-nexus-ultimate'
  | 'petrify-charm'
  | 'chainsaw-hell'
  | 'flying-raijin-blitz'
  | 'stand-barrage-requiem';

export interface ArenaObstacle {
  id: string;
  ownerUid: string;
  ownerCharId: string;
  teamId: number | null;
  kind:
    | 'obsidian-block'
    | 'bedrock-block'
    | 'stone-meteor'
    | 'wind-wall'
    | 'iron-ore'
    | 'diamond-ore'
    | 'ancient-debris';
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  life: number;
  maxLife: number;
  blocksProjectiles: boolean;
  restitution: number;
  color: string;
  secondaryColor?: string;
}

export interface ActiveUltimateState {
  id: string;
  characterId: string;
  ownerUid: string;
  teamId: number | null;
  title: string;
  subtitle: string;
  bannerColor: string;
  phase: 'cast' | 'active' | 'ending';
  elapsed: number;
  castDuration: number;
  duration: number;
  data: Record<string, unknown>;
}

export interface ArenaDomain {
  id: string;
  kind: ArenaDomainKind;
  ownerUid: string;
  ownerCharId: string;
  ownerSeries: string;
  teamId: number | null;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  secondaryColor: string;
  life: number;
  maxLife: number;
  tickTimer: number;
  tickCount: number;
  markers?: Point2D[];
}

export interface FighterState {
  uid: string;
  slotIndex: number;
  character: CharacterConfig;
  displayName: string;
  teamId: number | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  koFadeTimer: number;
  formIndex: number;
  transformAngryTimer: number;
  invulnTimer: number;
  powerUpFlashTimer: number;
  dmgBonusPct: number;
  abilityTimer: number;
  abilityChargeTimer: number;
  abilityChargeDuration: number;
  abilityTargetAngle: number;
  hitFlashTimer: number;
  squashTimer: number;
  squashAngle: number;
  facingAngle: number;
  spinAngle: number;
  rageProgress: number;
  infinityPulseTimer: number;
  odmActiveTimer: number;
  odmAnchorX: number;
  odmAnchorY: number;
  odmDashVx: number;
  odmDashVy: number;
  odmHitCooldowns: Record<string, number>;
  rasenganDashTimer: number;
  trailDropTimer: number;
  orbitAngle: number;
  orbitHitCooldowns: Record<string, number>;
  chainsawHitCooldowns: Record<string, number>;
  fuseTimer: number;
  spinDashTimer: number;
  getExcitedTimer: number;
  ultimateCharge: number;
  ultimatesUsed: number;
  ultimateCooldown: number;
  lastSkillIndex: number;
  healSkillCooldown: number;
  shieldTimer: number;
  shieldColor: string;
  lastSkillName: string;
  /** Real anime/game status effects (Unlimited Void paralysis, Time Stop, Frozen, Chained, Burn, Confused, Immortal, etc.) */
  stunTimer: number;
  stunKind: StatusStunKind | null;
  confusedTimer: number;
  burnTimer: number;
  burnDps: number;
  burnOwnerUid: string | null;
  silenceTimer: number;
  immortalTimer: number;
  unstoppableTimer: number;
  antiHealTimer: number;
  enchantArmorTimer: number;
  totemActive: boolean;
  totemPopTimer: number;
  glitchTeleportCd: number;
  karmaTimer: number;
  karmaDps: number;
  karmaOwnerUid: string | null;
  karmaKind: 'kr' | 'wither' | null;
  paralyzeTimer: number;
  paralyzeTick: number;
  drowsyTimer: number;
  armorShredTimer: number;
  frostTimer: number;
  charmTimer: number;
  charmOwnerUid: string | null;
  airborneTimer: number;
  uiDodgeTimer: number;
  untargetableTimer: number;
  spiritLockTimer: number;
  slayerMarkTimer: number;
  giantTimer: number;
  evadeTimer: number;
  dodgeLockedTimer: number;
  savedVx: number;
  savedVy: number;
  afterimages: Afterimage[];
  damageDealt: number;
  damageTaken: number;
  kills: number;
  hitsLanded: number;
  highestFormName: string;
  eliminatedAt: number | null;
  lastDamagedByUid: string | null;
  /** League of Legends 6-Slot Item Shop & Gold economy */
  lolGold: number;
  lolItemsCount: number;
  lolSpeedBonus: number;
  lolArmorBonus: number;
  lolLifestealBonus: number;
  lolCdrBonus: number;
  lolShopFlashTimer: number;
  /** Steve Minecraft mining progression: ores mined in current armor tier (upgrades Wood -> Iron -> Diamond -> Netherite) */
  steveMinedOres: number;
  steveMineSpawnCd: number;
  /** Sukuna ranged Dismantle basic-attack cooldown */
  sukunaSlashCd: number;
  /** Gojo Blue-infused basic-attack cooldown */
  gojoBasicCd: number;
  /** Mahoraga passive Dharma Wheel Adaptation stacks (0..8), wheel angle, damage accumulator & turn flash */
  mahoragaAdaptStacks: number;
  mahoragaWheelAngle: number;
  mahoragaAdaptDmgAcc: number;
  mahoragaWheelFlash: number;
}

export type ProjectileKind =
  | 'purple'
  | 'red'
  | 'getsuga'
  | 'sword-wave'
  | 'tornado'
  | 'boomerang'
  | 'rocket'
  | 'meteor'
  | 'zoltraak-orb'
  | 'foxfire'
  | 'arrow-trident'
  | 'dragon-acid'
  | 'wither-skull'
  | 'scythe'
  | 'axe'
  | 'yoyo'
  | 'rasenshuriken'
  | 'ki-blast'
  | 'fireball'
  | 'bone'
  | 'bullet'
  | 'spear'
  | 'dagger-blade'
  | 'heart'
  | 'fist-wave'
  | 'glitch-cube'
  | 'sonic-boom'
  | 'shuriken-star'
  | 'kunai-knife'
  | 'card-spade'
  | 'petal-sakura'
  | 'magma-orb'
  | 'ice-crystal'
  | 'sand-wave'
  | 'anchor-hook'
  | 'music-note'
  | 'holy-cross'
  | 'string-thread'
  | 'buster-greatsword'
  | 'ender-pearl'
  | 'master-shield'
  | 'star-rod'
  | 'blood-scythe'
  | 'stand-fist'
  | 'chakram-ring'
  | 'void-eye'
  | 'totem-golem';

export interface Projectile {
  id: string;
  ownerUid: string;
  teamId: number | null;
  kind: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  knockback: number;
  color: string;
  secondaryColor: string;
  angle: number;
  life: number;
  maxLife: number;
  piercing: boolean;
  boomerang?: boolean;
  returning?: boolean;
  explosiveRadius?: number;
  homing?: boolean;
  blocksProjectiles?: boolean;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  orbitTimer?: number;
  orbitOffset?: number;
  tetherToOwner?: boolean;
  frozenTimer?: number;
  hitCooldowns: Record<string, number>;
  powerLevel: number;
}

export interface Beam {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  teamId: number | null;
  originX: number;
  originY: number;
  angle: number;
  width: number;
  damagePerTick: number;
  color: string;
  secondaryColor?: string;
  coreColor: string;
  life: number;
  maxLife: number;
  tickTimer: number;
  powerLevel: number;
  style?: 'kamehameha' | 'final-flash' | 'gaster' | 'zoltraak';
}

export interface Point2D {
  x: number;
  y: number;
}

export interface RicochetArm {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  teamId: number | null;
  points: Point2D[];
  headX: number;
  headY: number;
  vx: number;
  vy: number;
  bouncesLeft: number;
  phase: 'extend' | 'retract';
  life: number;
  maxLife: number;
  damage: number;
  color: string;
  glowColor: string;
  isGear5: boolean;
  hitCooldowns: Record<string, number>;
}

export interface SlashEffect {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  teamId: number | null;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  secondaryColor?: string;
  coreColor: string;
  width: number;
  telegraphTimer: number;
  activeTimer: number;
  fadeTimer: number;
  maxFade: number;
  damage: number;
  hasStruck: boolean;
}

export interface TrailNode {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  teamId: number | null;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  damagePerTick: number;
  color?: string;
  secondaryColor?: string;
  element: 'water' | 'fire' | 'sun' | 'electric' | 'amaterasu' | 'dragon-breath' | 'sculk';
  hitCooldowns: Record<string, number>;
}

export interface Bomb {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  teamId: number | null;
  kind:
    'tnt' | 'chomper' | 'glitch-bomb' | 'obsidian-block' | 'mushroom' | 'lotus-trap' | 'ice-pillar';
  x: number;
  y: number;
  radius: number;
  blastRadius: number;
  damage: number;
  fuseTimer: number;
  maxFuse: number;
  color: string;
  secondaryColor?: string;
}

export interface SkyPillar {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  teamId: number | null;
  x: number;
  targetY: number;
  width: number;
  color: string;
  secondaryColor?: string;
  telegraphTimer: number;
  activeTimer: number;
  maxActive: number;
  damage: number;
  hasStruck: boolean;
  style?: string;
}

export interface LightningBolt {
  id: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  points: Point2D[];
  color: string;
  coreColor: string;
  width: number;
  life: number;
  maxLife: number;
}

export interface Minion {
  id: string;
  ownerUid: string;
  ownerCharId?: string;
  ownerSeries?: string;
  skillMotif?: string;
  teamId: number | null;
  kind: 'clone' | 'shadow' | 'ender-dragon';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  damage: number;
  life: number;
  maxLife: number;
  color: string;
  accentColor: string;
  attackTimer?: number;
  wingPhase?: number;
  hitCooldowns: Record<string, number>;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  secondaryColor?: string;
  lineWidth: number;
  alpha: number;
  ownerCharId?: string;
  ownerSeries?: string;
  motif?: string;
}

export interface CastSeal {
  id: string;
  ownerUid: string;
  ownerCharId: string;
  ownerSeries: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  secondaryColor: string;
  life: number;
  maxLife: number;
  skillKey: string;
  isUltimate?: boolean;
  label?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape:
    | 'circle'
    | 'spark'
    | 'shard'
    | 'ring'
    | 'square'
    | 'pixel'
    | 'petal'
    | 'glyph'
    | 'diamond'
    | 'star'
    | 'cross';
  glyph?: string;
  rotation: number;
  vRot: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  subtext?: string;
  color: string;
  strokeColor: string;
  size: number;
  life: number;
  maxLife: number;
  kind: 'damage' | 'crit' | 'heal' | 'powerup' | 'callout';
}

export interface ArenaBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  fullSize: number;
}

export interface FighterMatchSummary {
  uid: string;
  slotIndex: number;
  characterId: string;
  displayName: string;
  series: string;
  primaryColor: string;
  teamId: number | null;
  alive: boolean;
  hpRemaining: number;
  maxHp: number;
  damageDealt: number;
  kills: number;
  highestFormName: string;
  finalFormIndex: number;
  placement: number;
}

export interface MatchResult {
  mode: GameMode;
  winnerUid: string | null;
  winnerTeamId: number | null;
  winnerName: string;
  durationSec: number;
  fighters: FighterMatchSummary[];
}

export type VoiceMode = 'real' | 'hybrid' | 'off';

export interface SfxEvent {
  type:
    | 'wall'
    | 'hit'
    | 'crit'
    | 'slash'
    | 'beam-charge'
    | 'beam-fire'
    | 'powerup'
    | 'heal'
    | 'dodge'
    | 'ko'
    | 'sudden-death'
    | 'victory'
    | 'ultimate-cutin';
  intensity?: number;
  characterId?: string;
  voiceLine?: string;
  voicePitch?: number;
  voiceRate?: number;
  voiceGender?: 'male' | 'female' | 'neutral';
}

export interface TournamentMatch {
  matchId: string;
  roundIndex: number;
  matchIndex: number;
  fighterA: FighterSlot | null;
  fighterB: FighterSlot | null;
  winner: FighterSlot | null;
  result: MatchResult | null;
}

export interface TournamentState {
  size: TournamentSize;
  rounds: TournamentMatch[][];
  currentRound: number;
  currentMatchIndex: number;
  champion: FighterSlot | null;
  completed: boolean;
}
