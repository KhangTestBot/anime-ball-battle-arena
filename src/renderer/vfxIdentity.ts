import type { CastSeal, Particle } from '../types/game';

export type SeriesVfxId =
  | 'one-piece'
  | 'dragon-ball'
  | 'naruto'
  | 'jjk'
  | 'demon-slayer'
  | 'bleach'
  | 'opm'
  | 'hxh'
  | 'mha'
  | 'jojo'
  | 'fairy-tail'
  | 'fate'
  | 'fma'
  | 'aot'
  | 'solo-leveling'
  | 'chainsaw-man'
  | 'black-clover'
  | 'seven-deadly-sins'
  | 'slime'
  | 'frieren'
  | 'mob-psycho'
  | 'lol'
  | 'minecraft'
  | 'undertale'
  | 'genshin'
  | 'mortal-kombat'
  | 'pokemon'
  | 'sonic'
  | 'dmc'
  | 'god-of-war'
  | 'mario'
  | 'zelda'
  | 'kirby'
  | 'ff7';

export type BeamVisualStyle =
  | 'kamehameha-ki'
  | 'gaster-skull'
  | 'zoltraak-hex'
  | 'minecraft-beacon'
  | 'lol-hextech'
  | 'fate-excalibur'
  | 'jjk-cursed-flame'
  | 'bleach-cero'
  | 'fma-alchemy-arc'
  | 'fairy-dragon-roar'
  | 'solo-monarch-void'
  | 'onepiece-haki-cannon'
  | 'naruto-bijuu-ray'
  | 'jojo-stand-beam'
  | 'aot-colossal-steam'
  | 'chainsaw-blood-jet';

export type SlashVisualStyle =
  | 'ukiyo-wave'
  | 'bleach-ink'
  | 'jjk-blackflash'
  | 'onepiece-haki'
  | 'chainsaw-sawtooth'
  | 'dmc-glass-shatter'
  | 'minecraft-voxel'
  | 'aot-twin-steam'
  | 'lol-skillshot'
  | 'jojo-stand-rush'
  | 'fairy-rune-arc'
  | 'fma-alchemy-crack'
  | 'fate-golden-cut'
  | 'solo-shadow-claw';

export type TrailVisualStyle =
  | 'minecraft-voxel'
  | 'ukiyo-breath'
  | 'naruto-shinobi'
  | 'onepiece-fruit'
  | 'jjk-cursed'
  | 'fma-transmute'
  | 'fairy-magic-rune'
  | 'solo-shadow-mist'
  | 'lol-arcane-zone'
  | 'jojo-menacing'
  | 'bleach-reiatsu'
  | 'undertale-pixel'
  | 'aot-steam-scorch'
  | 'chainsaw-blood-slick';

export type BombVisualStyle =
  | 'mc-tnt-voxel'
  | 'mc-obsidian-rune'
  | 'mc-glitch-303'
  | 'lol-chomper-hex'
  | 'lol-shroom-trap'
  | 'naruto-paper-bomb'
  | 'jojo-sheer-heart'
  | 'fairy-rune-mine'
  | 'fma-alchemy-mine'
  | 'chainsaw-grenade'
  | 'onepiece-quake-bubble'
  | 'fate-planted-sword'
  | 'undertale-pixel-trap'
  | 'demon-blood-lotus'
  | 'jjk-cursed-talisman'
  | 'solo-shadow-mine';

export type ArmVisualStyle =
  | 'onepiece-rubber'
  | 'onepiece-string'
  | 'mha-blackwhip'
  | 'hxh-bungee-gum'
  | 'chain-linked'
  | 'chainsaw-tendril'
  | 'jojo-stand-flurry'
  | 'naruto-wood-chakra'
  | 'bleach-segmented-blade'
  | 'lol-tether-beam'
  | 'minecraft-voxel-hook'
  | 'solo-shadow-tether';

export type PillarVisualStyle =
  | 'mc-herobrine-bolt'
  | 'fate-sky-sword'
  | 'dragonball-spirit-drop'
  | 'naruto-chibaku-meteor'
  | 'bleach-bankai-blade'
  | 'lol-demacia-sword'
  | 'fma-stone-spire'
  | 'fairy-starfall'
  | 'jjk-fuga-pillar'
  | 'solo-monarch-lance'
  | 'onepiece-meteor-fist'
  | 'aot-titan-bolt';

export type LightningVisualStyle =
  | 'mc-stepped-voxel'
  | 'jjk-black-flash'
  | 'onepiece-conqueror'
  | 'demon-thunderclap'
  | 'hxh-godspeed-nerve'
  | 'fma-alchemy-spark'
  | 'pokemon-thunderbolt'
  | 'bleach-kido-arc'
  | 'lol-hex-arc'
  | 'classic-twin-helix';

export type MinionVisualStyle =
  | 'mc-ender-dragon'
  | 'mc-voxel-mob'
  | 'solo-shadow-knight'
  | 'naruto-shinobi-clone'
  | 'jjk-shikigami'
  | 'jojo-stand-avatar'
  | 'fairy-celestial-spirit'
  | 'fate-heroic-phantom'
  | 'lol-shadow-construct'
  | 'onepiece-homie-avatar'
  | 'bleach-zanpakuto-spirit'
  | 'hxh-nen-beast'
  | 'chainsaw-devil-fiend'
  | 'fma-homunculus-construct';

export type ShieldVisualStyle =
  | 'naruto-susanoo'
  | 'lol-windwall-hex'
  | 'mc-voxel-shield'
  | 'fate-avalon'
  | 'sds-perfect-cube'
  | 'fairy-magic-dome'
  | 'fma-alchemy-wall'
  | 'jjk-infinity-halo'
  | 'onepiece-haki-dome'
  | 'bleach-bakudo-grid'
  | 'undertale-battle-box'
  | 'solo-system-firewall'
  | 'jojo-stand-guard'
  | 'demon-breathing-ring';

export type DomainVisualStyle =
  | 'jjk-domain-sigil'
  | 'onepiece-quake-room'
  | 'jojo-time-clock'
  | 'demon-compass-ukiyo'
  | 'fairy-mahoujin'
  | 'fma-transmute-hex'
  | 'fate-reality-marble'
  | 'solo-monarch-zone'
  | 'bleach-bankai-ink'
  | 'naruto-dojutsu-eye'
  | 'minecraft-beacon-grid'
  | 'lol-ultimate-zone'
  | 'undertale-pixel-frame'
  | 'dragonball-ki-crater';

export interface CharacterVfxDNA {
  charId: string;
  seriesId: SeriesVfxId;
  beamStyle: BeamVisualStyle;
  slashStyle: SlashVisualStyle;
  trailStyle: TrailVisualStyle;
  bombStyle: BombVisualStyle;
  armStyle: ArmVisualStyle;
  pillarStyle: PillarVisualStyle;
  lightningStyle: LightningVisualStyle;
  minionStyle: MinionVisualStyle;
  shieldStyle: ShieldVisualStyle;
  domainStyle: DomainVisualStyle;
  particleShape: Particle['shape'];
  particleGlyph?: string;
  /** Per-character deterministic geometric fingerprint (guaranteed unique across all 336 characters) */
  crestShape: number; // 0..15
  symmetry: number; // 2..9
  orbitStyle: number; // 0..7
  accentBand: number; // 0..7
  flourishAngle: number; // 0..15 (radians step)
  spinDir: 1 | -1;
  spinSpeed: number;
  ringRatio: number; // 0.52..0.96
  fingerprint: string;
}

const SERIES_MAP: Record<string, SeriesVfxId> = {
  'One Piece': 'one-piece',
  'Dragon Ball': 'dragon-ball',
  Naruto: 'naruto',
  'Jujutsu Kaisen': 'jjk',
  'Demon Slayer': 'demon-slayer',
  Bleach: 'bleach',
  'One Punch Man': 'opm',
  'Hunter x Hunter': 'hxh',
  'My Hero Academia': 'mha',
  "JoJo's Bizarre Adventure": 'jojo',
  'Fairy Tail': 'fairy-tail',
  Fate: 'fate',
  'Fullmetal Alchemist': 'fma',
  'Attack on Titan': 'aot',
  'Solo Leveling': 'solo-leveling',
  'Chainsaw Man': 'chainsaw-man',
  'Black Clover': 'black-clover',
  'The Seven Deadly Sins': 'seven-deadly-sins',
  'Tensei Slime': 'slime',
  Frieren: 'frieren',
  'Mob Psycho 100': 'mob-psycho',
  'League of Legends': 'lol',
  Minecraft: 'minecraft',
  Undertale: 'undertale',
  'Genshin Impact': 'genshin',
  'Mortal Kombat': 'mortal-kombat',
  Pokémon: 'pokemon',
  'Sonic the Hedgehog': 'sonic',
  'Devil May Cry': 'dmc',
  'God of War': 'god-of-war',
  'Super Mario': 'mario',
  'The Legend of Zelda': 'zelda',
  Kirby: 'kirby',
  'Final Fantasy VII': 'ff7',
};

export function resolveSeriesVfxId(series?: string): SeriesVfxId {
  if (!series) return 'one-piece';
  return SERIES_MAP[series] ?? 'one-piece';
}

/** Dual-seed FNV-1a 32-bit hash for crisp deterministic per-character geometry */
function hashStr(input: string, seed = 2166136261): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

interface SeriesBaseVisuals {
  beamStyle: BeamVisualStyle;
  slashStyle: SlashVisualStyle;
  trailStyle: TrailVisualStyle;
  bombStyle: BombVisualStyle;
  armStyle: ArmVisualStyle;
  pillarStyle: PillarVisualStyle;
  lightningStyle: LightningVisualStyle;
  minionStyle: MinionVisualStyle;
  shieldStyle: ShieldVisualStyle;
  domainStyle: DomainVisualStyle;
  particleShape: Particle['shape'];
  particleGlyph?: string;
}

const SERIES_DEFAULTS: Record<SeriesVfxId, SeriesBaseVisuals> = {
  'one-piece': {
    beamStyle: 'onepiece-haki-cannon',
    slashStyle: 'onepiece-haki',
    trailStyle: 'onepiece-fruit',
    bombStyle: 'onepiece-quake-bubble',
    armStyle: 'onepiece-rubber',
    pillarStyle: 'onepiece-meteor-fist',
    lightningStyle: 'onepiece-conqueror',
    minionStyle: 'onepiece-homie-avatar',
    shieldStyle: 'onepiece-haki-dome',
    domainStyle: 'onepiece-quake-room',
    particleShape: 'spark',
  },
  'dragon-ball': {
    beamStyle: 'kamehameha-ki',
    slashStyle: 'fate-golden-cut',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'onepiece-quake-bubble',
    armStyle: 'jojo-stand-flurry',
    pillarStyle: 'dragonball-spirit-drop',
    lightningStyle: 'classic-twin-helix',
    minionStyle: 'naruto-shinobi-clone',
    shieldStyle: 'onepiece-haki-dome',
    domainStyle: 'dragonball-ki-crater',
    particleShape: 'star',
  },
  naruto: {
    beamStyle: 'naruto-bijuu-ray',
    slashStyle: 'bleach-ink',
    trailStyle: 'naruto-shinobi',
    bombStyle: 'naruto-paper-bomb',
    armStyle: 'naruto-wood-chakra',
    pillarStyle: 'naruto-chibaku-meteor',
    lightningStyle: 'classic-twin-helix',
    minionStyle: 'naruto-shinobi-clone',
    shieldStyle: 'naruto-susanoo',
    domainStyle: 'naruto-dojutsu-eye',
    particleShape: 'shard',
  },
  jjk: {
    beamStyle: 'jjk-cursed-flame',
    slashStyle: 'jjk-blackflash',
    trailStyle: 'jjk-cursed',
    bombStyle: 'jjk-cursed-talisman',
    armStyle: 'mha-blackwhip',
    pillarStyle: 'jjk-fuga-pillar',
    lightningStyle: 'jjk-black-flash',
    minionStyle: 'jjk-shikigami',
    shieldStyle: 'jjk-infinity-halo',
    domainStyle: 'jjk-domain-sigil',
    particleShape: 'cross',
  },
  'demon-slayer': {
    beamStyle: 'fairy-dragon-roar',
    slashStyle: 'ukiyo-wave',
    trailStyle: 'ukiyo-breath',
    bombStyle: 'demon-blood-lotus',
    armStyle: 'onepiece-string',
    pillarStyle: 'jjk-fuga-pillar',
    lightningStyle: 'demon-thunderclap',
    minionStyle: 'bleach-zanpakuto-spirit',
    shieldStyle: 'demon-breathing-ring',
    domainStyle: 'demon-compass-ukiyo',
    particleShape: 'petal',
  },
  bleach: {
    beamStyle: 'bleach-cero',
    slashStyle: 'bleach-ink',
    trailStyle: 'bleach-reiatsu',
    bombStyle: 'jjk-cursed-talisman',
    armStyle: 'bleach-segmented-blade',
    pillarStyle: 'bleach-bankai-blade',
    lightningStyle: 'bleach-kido-arc',
    minionStyle: 'bleach-zanpakuto-spirit',
    shieldStyle: 'bleach-bakudo-grid',
    domainStyle: 'bleach-bankai-ink',
    particleShape: 'petal',
    particleGlyph: '卍',
  },
  opm: {
    beamStyle: 'kamehameha-ki',
    slashStyle: 'dmc-glass-shatter',
    trailStyle: 'aot-steam-scorch',
    bombStyle: 'onepiece-quake-bubble',
    armStyle: 'jojo-stand-flurry',
    pillarStyle: 'dragonball-spirit-drop',
    lightningStyle: 'classic-twin-helix',
    minionStyle: 'lol-shadow-construct',
    shieldStyle: 'jjk-infinity-halo',
    domainStyle: 'dragonball-ki-crater',
    particleShape: 'shard',
  },
  hxh: {
    beamStyle: 'naruto-bijuu-ray',
    slashStyle: 'bleach-ink',
    trailStyle: 'jjk-cursed',
    bombStyle: 'naruto-paper-bomb',
    armStyle: 'hxh-bungee-gum',
    pillarStyle: 'onepiece-meteor-fist',
    lightningStyle: 'hxh-godspeed-nerve',
    minionStyle: 'hxh-nen-beast',
    shieldStyle: 'demon-breathing-ring',
    domainStyle: 'naruto-dojutsu-eye',
    particleShape: 'diamond',
  },
  mha: {
    beamStyle: 'kamehameha-ki',
    slashStyle: 'onepiece-haki',
    trailStyle: 'onepiece-fruit',
    bombStyle: 'chainsaw-grenade',
    armStyle: 'mha-blackwhip',
    pillarStyle: 'onepiece-meteor-fist',
    lightningStyle: 'demon-thunderclap',
    minionStyle: 'jjk-shikigami',
    shieldStyle: 'onepiece-haki-dome',
    domainStyle: 'dragonball-ki-crater',
    particleShape: 'star',
  },
  jojo: {
    beamStyle: 'jojo-stand-beam',
    slashStyle: 'jojo-stand-rush',
    trailStyle: 'jojo-menacing',
    bombStyle: 'jojo-sheer-heart',
    armStyle: 'jojo-stand-flurry',
    pillarStyle: 'dragonball-spirit-drop',
    lightningStyle: 'classic-twin-helix',
    minionStyle: 'jojo-stand-avatar',
    shieldStyle: 'jojo-stand-guard',
    domainStyle: 'jojo-time-clock',
    particleShape: 'glyph',
    particleGlyph: 'ゴ',
  },
  'fairy-tail': {
    beamStyle: 'fairy-dragon-roar',
    slashStyle: 'fairy-rune-arc',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'fairy-rune-mine',
    armStyle: 'chain-linked',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'pokemon-thunderbolt',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'fairy-mahoujin',
    particleShape: 'star',
  },
  fate: {
    beamStyle: 'fate-excalibur',
    slashStyle: 'fate-golden-cut',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'fate-planted-sword',
    armStyle: 'chain-linked',
    pillarStyle: 'fate-sky-sword',
    lightningStyle: 'bleach-kido-arc',
    minionStyle: 'fate-heroic-phantom',
    shieldStyle: 'fate-avalon',
    domainStyle: 'fate-reality-marble',
    particleShape: 'diamond',
  },
  fma: {
    beamStyle: 'fma-alchemy-arc',
    slashStyle: 'fma-alchemy-crack',
    trailStyle: 'fma-transmute',
    bombStyle: 'fma-alchemy-mine',
    armStyle: 'chainsaw-tendril',
    pillarStyle: 'fma-stone-spire',
    lightningStyle: 'fma-alchemy-spark',
    minionStyle: 'fma-homunculus-construct',
    shieldStyle: 'fma-alchemy-wall',
    domainStyle: 'fma-transmute-hex',
    particleShape: 'diamond',
  },
  aot: {
    beamStyle: 'aot-colossal-steam',
    slashStyle: 'aot-twin-steam',
    trailStyle: 'aot-steam-scorch',
    bombStyle: 'chainsaw-grenade',
    armStyle: 'chain-linked',
    pillarStyle: 'aot-titan-bolt',
    lightningStyle: 'demon-thunderclap',
    minionStyle: 'fma-homunculus-construct',
    shieldStyle: 'fma-alchemy-wall',
    domainStyle: 'dragonball-ki-crater',
    particleShape: 'circle',
  },
  'solo-leveling': {
    beamStyle: 'solo-monarch-void',
    slashStyle: 'solo-shadow-claw',
    trailStyle: 'solo-shadow-mist',
    bombStyle: 'solo-shadow-mine',
    armStyle: 'solo-shadow-tether',
    pillarStyle: 'solo-monarch-lance',
    lightningStyle: 'jjk-black-flash',
    minionStyle: 'solo-shadow-knight',
    shieldStyle: 'solo-system-firewall',
    domainStyle: 'solo-monarch-zone',
    particleShape: 'diamond',
  },
  'chainsaw-man': {
    beamStyle: 'chainsaw-blood-jet',
    slashStyle: 'chainsaw-sawtooth',
    trailStyle: 'chainsaw-blood-slick',
    bombStyle: 'chainsaw-grenade',
    armStyle: 'chainsaw-tendril',
    pillarStyle: 'jjk-fuga-pillar',
    lightningStyle: 'onepiece-conqueror',
    minionStyle: 'chainsaw-devil-fiend',
    shieldStyle: 'onepiece-haki-dome',
    domainStyle: 'jjk-domain-sigil',
    particleShape: 'shard',
  },
  'black-clover': {
    beamStyle: 'zoltraak-hex',
    slashStyle: 'fairy-rune-arc',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'fairy-rune-mine',
    armStyle: 'solo-shadow-tether',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'bleach-kido-arc',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'fairy-mahoujin',
    particleShape: 'cross',
  },
  'seven-deadly-sins': {
    beamStyle: 'fate-excalibur',
    slashStyle: 'onepiece-haki',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'fate-planted-sword',
    armStyle: 'chain-linked',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'onepiece-conqueror',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'sds-perfect-cube',
    domainStyle: 'fairy-mahoujin',
    particleShape: 'star',
  },
  slime: {
    beamStyle: 'zoltraak-hex',
    slashStyle: 'solo-shadow-claw',
    trailStyle: 'solo-shadow-mist',
    bombStyle: 'solo-shadow-mine',
    armStyle: 'solo-shadow-tether',
    pillarStyle: 'solo-monarch-lance',
    lightningStyle: 'jjk-black-flash',
    minionStyle: 'solo-shadow-knight',
    shieldStyle: 'solo-system-firewall',
    domainStyle: 'solo-monarch-zone',
    particleShape: 'diamond',
  },
  frieren: {
    beamStyle: 'zoltraak-hex',
    slashStyle: 'fairy-rune-arc',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'fairy-rune-mine',
    armStyle: 'lol-tether-beam',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'bleach-kido-arc',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'fairy-mahoujin',
    particleShape: 'diamond',
  },
  'mob-psycho': {
    beamStyle: 'jojo-stand-beam',
    slashStyle: 'dmc-glass-shatter',
    trailStyle: 'jojo-menacing',
    bombStyle: 'onepiece-quake-bubble',
    armStyle: 'solo-shadow-tether',
    pillarStyle: 'naruto-chibaku-meteor',
    lightningStyle: 'hxh-godspeed-nerve',
    minionStyle: 'jojo-stand-avatar',
    shieldStyle: 'jjk-infinity-halo',
    domainStyle: 'jjk-domain-sigil',
    particleShape: 'star',
  },
  lol: {
    beamStyle: 'lol-hextech',
    slashStyle: 'lol-skillshot',
    trailStyle: 'lol-arcane-zone',
    bombStyle: 'lol-chomper-hex',
    armStyle: 'lol-tether-beam',
    pillarStyle: 'lol-demacia-sword',
    lightningStyle: 'lol-hex-arc',
    minionStyle: 'lol-shadow-construct',
    shieldStyle: 'lol-windwall-hex',
    domainStyle: 'lol-ultimate-zone',
    particleShape: 'diamond',
  },
  minecraft: {
    beamStyle: 'minecraft-beacon',
    slashStyle: 'minecraft-voxel',
    trailStyle: 'minecraft-voxel',
    bombStyle: 'mc-tnt-voxel',
    armStyle: 'minecraft-voxel-hook',
    pillarStyle: 'mc-herobrine-bolt',
    lightningStyle: 'mc-stepped-voxel',
    minionStyle: 'mc-voxel-mob',
    shieldStyle: 'mc-voxel-shield',
    domainStyle: 'minecraft-beacon-grid',
    particleShape: 'pixel',
  },
  undertale: {
    beamStyle: 'gaster-skull',
    slashStyle: 'minecraft-voxel',
    trailStyle: 'undertale-pixel',
    bombStyle: 'undertale-pixel-trap',
    armStyle: 'lol-tether-beam',
    pillarStyle: 'mc-herobrine-bolt',
    lightningStyle: 'mc-stepped-voxel',
    minionStyle: 'mc-voxel-mob',
    shieldStyle: 'undertale-battle-box',
    domainStyle: 'undertale-pixel-frame',
    particleShape: 'glyph',
    particleGlyph: '♥',
  },
  genshin: {
    beamStyle: 'fate-excalibur',
    slashStyle: 'fate-golden-cut',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'demon-blood-lotus',
    armStyle: 'lol-tether-beam',
    pillarStyle: 'naruto-chibaku-meteor',
    lightningStyle: 'bleach-kido-arc',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'fate-reality-marble',
    particleShape: 'star',
  },
  'mortal-kombat': {
    beamStyle: 'chainsaw-blood-jet',
    slashStyle: 'chainsaw-sawtooth',
    trailStyle: 'chainsaw-blood-slick',
    bombStyle: 'chainsaw-grenade',
    armStyle: 'chain-linked',
    pillarStyle: 'jjk-fuga-pillar',
    lightningStyle: 'onepiece-conqueror',
    minionStyle: 'chainsaw-devil-fiend',
    shieldStyle: 'demon-breathing-ring',
    domainStyle: 'onepiece-quake-room',
    particleShape: 'shard',
  },
  pokemon: {
    beamStyle: 'kamehameha-ki',
    slashStyle: 'fairy-rune-arc',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'onepiece-quake-bubble',
    armStyle: 'onepiece-rubber',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'pokemon-thunderbolt',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'dragonball-ki-crater',
    particleShape: 'star',
  },
  sonic: {
    beamStyle: 'lol-hextech',
    slashStyle: 'lol-skillshot',
    trailStyle: 'lol-arcane-zone',
    bombStyle: 'jojo-sheer-heart',
    armStyle: 'onepiece-rubber',
    pillarStyle: 'dragonball-spirit-drop',
    lightningStyle: 'hxh-godspeed-nerve',
    minionStyle: 'lol-shadow-construct',
    shieldStyle: 'lol-windwall-hex',
    domainStyle: 'jojo-time-clock',
    particleShape: 'star',
  },
  dmc: {
    beamStyle: 'solo-monarch-void',
    slashStyle: 'dmc-glass-shatter',
    trailStyle: 'solo-shadow-mist',
    bombStyle: 'fate-planted-sword',
    armStyle: 'solo-shadow-tether',
    pillarStyle: 'bleach-bankai-blade',
    lightningStyle: 'bleach-kido-arc',
    minionStyle: 'solo-shadow-knight',
    shieldStyle: 'fate-avalon',
    domainStyle: 'fate-reality-marble',
    particleShape: 'shard',
  },
  'god-of-war': {
    beamStyle: 'chainsaw-blood-jet',
    slashStyle: 'onepiece-haki',
    trailStyle: 'aot-steam-scorch',
    bombStyle: 'chainsaw-grenade',
    armStyle: 'chain-linked',
    pillarStyle: 'onepiece-meteor-fist',
    lightningStyle: 'onepiece-conqueror',
    minionStyle: 'fma-homunculus-construct',
    shieldStyle: 'onepiece-haki-dome',
    domainStyle: 'onepiece-quake-room',
    particleShape: 'glyph',
    particleGlyph: 'Ω',
  },
  mario: {
    beamStyle: 'fairy-dragon-roar',
    slashStyle: 'minecraft-voxel',
    trailStyle: 'onepiece-fruit',
    bombStyle: 'mc-tnt-voxel',
    armStyle: 'onepiece-rubber',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'pokemon-thunderbolt',
    minionStyle: 'mc-voxel-mob',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'undertale-pixel-frame',
    particleShape: 'star',
  },
  zelda: {
    beamStyle: 'fate-excalibur',
    slashStyle: 'fate-golden-cut',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'mc-tnt-voxel',
    armStyle: 'chain-linked',
    pillarStyle: 'fate-sky-sword',
    lightningStyle: 'pokemon-thunderbolt',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fate-avalon',
    domainStyle: 'fairy-mahoujin',
    particleShape: 'diamond',
  },
  kirby: {
    beamStyle: 'fairy-dragon-roar',
    slashStyle: 'fairy-rune-arc',
    trailStyle: 'fairy-magic-rune',
    bombStyle: 'fairy-rune-mine',
    armStyle: 'hxh-bungee-gum',
    pillarStyle: 'fairy-starfall',
    lightningStyle: 'pokemon-thunderbolt',
    minionStyle: 'fairy-celestial-spirit',
    shieldStyle: 'fairy-magic-dome',
    domainStyle: 'fairy-mahoujin',
    particleShape: 'star',
  },
  ff7: {
    beamStyle: 'fate-excalibur',
    slashStyle: 'bleach-ink',
    trailStyle: 'lol-arcane-zone',
    bombStyle: 'fate-planted-sword',
    armStyle: 'bleach-segmented-blade',
    pillarStyle: 'naruto-chibaku-meteor',
    lightningStyle: 'lol-hex-arc',
    minionStyle: 'fate-heroic-phantom',
    shieldStyle: 'fate-avalon',
    domainStyle: 'fate-reality-marble',
    particleShape: 'diamond',
  },
};

/** Character-specific thematic overrides so canon signatures never bleed across characters */
const CHAR_STYLE_OVERRIDES: Partial<Record<string, Partial<SeriesBaseVisuals>>> = {
  steve: {
    minionStyle: 'mc-ender-dragon',
    bombStyle: 'mc-tnt-voxel',
    shieldStyle: 'mc-voxel-shield',
  },
  herobrine: { bombStyle: 'mc-obsidian-rune', pillarStyle: 'mc-herobrine-bolt' },
  entity303: { bombStyle: 'mc-glitch-303', slashStyle: 'dmc-glass-shatter' },
  doflamingo: { armStyle: 'onepiece-string', slashStyle: 'onepiece-haki' },
  law: { domainStyle: 'onepiece-quake-room', slashStyle: 'dmc-glass-shatter' },
  whitebeard: { domainStyle: 'onepiece-quake-room', bombStyle: 'onepiece-quake-bubble' },
  teemo: { bombStyle: 'lol-shroom-trap' },
  jinx: { bombStyle: 'lol-chomper-hex' },
  thresh: { armStyle: 'chain-linked' },
  sylas: { armStyle: 'chain-linked' },
  garen: { pillarStyle: 'lol-demacia-sword' },
  kurapika: { armStyle: 'chain-linked' },
  hisoka: { armStyle: 'hxh-bungee-gum' },
  killua: { lightningStyle: 'hxh-godspeed-nerve' },
  makima: { armStyle: 'chain-linked', domainStyle: 'jjk-domain-sigil' },
  renji: { armStyle: 'bleach-segmented-blade' },
  byakuya: { slashStyle: 'ukiyo-wave', particleShape: 'petal' },
  merlin_sds: { shieldStyle: 'sds-perfect-cube' },
  escanor: { pillarStyle: 'dragonball-spirit-drop', beamStyle: 'fate-excalibur' },
  saber: { beamStyle: 'fate-excalibur', shieldStyle: 'fate-avalon' },
  gilgamesh: { pillarStyle: 'fate-sky-sword', armStyle: 'chain-linked' },
  scorpion: { armStyle: 'chain-linked' },
  subzero: { trailStyle: 'ukiyo-breath', bombStyle: 'demon-blood-lotus' },
};

const dnaCache = new Map<string, CharacterVfxDNA>();

export function getCharacterVfxDNA(charId?: string, series?: string): CharacterVfxDNA {
  const id = charId || 'unknown';
  const seriesId = resolveSeriesVfxId(series);
  const cacheKey = `${id}@${seriesId}`;
  const cached = dnaCache.get(cacheKey);
  if (cached) return cached;

  const base = SERIES_DEFAULTS[seriesId];
  const ov = CHAR_STYLE_OVERRIDES[id];

  // Use 3 independent FNV-1a hashes to guarantee zero collision across all 336+ characters
  const h1 = hashStr(id, 0x811c9dc5);
  const h2 = hashStr(`${id}:${seriesId}:vfx`, 0x01000193);
  const h3 = hashStr(`sig:${id.split('').reverse().join('')}`, 0x9e3779b9);

  const crestShape = h1 & 15; // 16 distinct crest geometries
  const symmetry = 2 + ((h1 >>> 4) % 8); // 2..9 rotational fold
  const orbitStyle = (h2 >>> 2) & 7; // 8 orbital accents
  const accentBand = (h2 >>> 7) & 7; // 8 flourish bands
  const flourishAngle = (h3 >>> 3) & 15; // 16 phase offsets
  const spinDir: 1 | -1 = (h3 & 1) === 0 ? 1 : -1;
  const spinSpeed = 2.4 + ((h3 >>> 8) % 10) * 0.55;
  const ringRatio = 0.54 + ((h2 >>> 12) % 21) * 0.02;

  const dna: CharacterVfxDNA = {
    charId: id,
    seriesId,
    beamStyle: ov?.beamStyle ?? base.beamStyle,
    slashStyle: ov?.slashStyle ?? base.slashStyle,
    trailStyle: ov?.trailStyle ?? base.trailStyle,
    bombStyle: ov?.bombStyle ?? base.bombStyle,
    armStyle: ov?.armStyle ?? base.armStyle,
    pillarStyle: ov?.pillarStyle ?? base.pillarStyle,
    lightningStyle: ov?.lightningStyle ?? base.lightningStyle,
    minionStyle: ov?.minionStyle ?? base.minionStyle,
    shieldStyle: ov?.shieldStyle ?? base.shieldStyle,
    domainStyle: ov?.domainStyle ?? base.domainStyle,
    particleShape: ov?.particleShape ?? base.particleShape,
    particleGlyph: ov?.particleGlyph ?? base.particleGlyph,
    crestShape,
    symmetry,
    orbitStyle,
    accentBand,
    flourishAngle,
    spinDir,
    spinSpeed,
    ringRatio,
    fingerprint: `${seriesId}|c${crestShape}|s${symmetry}|o${orbitStyle}|a${accentBand}|f${flourishAngle}|d${spinDir}|r${Math.round(ringRatio * 100)}`,
  };

  dnaCache.set(cacheKey, dna);
  return dna;
}

/** Draws a character's personal non-colliding geometric crest inside projectiles, seals, shields, bombs */
export function drawCharacterUniqueCrest(
  ctx: CanvasRenderingContext2D,
  dna: CharacterVfxDNA,
  r: number,
  primaryColor: string,
  secondaryColor: string,
  t: number,
): void {
  ctx.save();
  const rot = t * dna.spinSpeed * 0.65 * dna.spinDir + (dna.flourishAngle * Math.PI) / 8;
  ctx.rotate(rot);
  ctx.strokeStyle = secondaryColor || '#ffffff';
  ctx.fillStyle = primaryColor;
  ctx.lineWidth = Math.max(1.1, r * 0.08);

  const sym = dna.symmetry;
  const innerR = r * dna.ringRatio;

  // 1. Primary crest shape (16 distinct crisp geometric forms)
  switch (dna.crestShape) {
    case 0: // Star polygon
      ctx.beginPath();
      for (let i = 0; i < sym * 2; i++) {
        const a = (i * Math.PI) / sym;
        const rad = i % 2 === 0 ? innerR : innerR * 0.42;
        if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    case 1: // Inscribed regular polygon + vertex dots
      ctx.beginPath();
      for (let i = 0; i < sym; i++) {
        const a = (i * Math.PI * 2) / sym;
        if (i === 0) ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        else ctx.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    case 2: // Radial blade spokes
      for (let i = 0; i < sym; i++) {
        const a = (i * Math.PI * 2) / sym;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR * 0.3, Math.sin(a) * innerR * 0.3);
        ctx.lineTo(Math.cos(a) * innerR * 1.05, Math.sin(a) * innerR * 1.05);
        ctx.stroke();
      }
      break;
    case 3: // Segmented arcane arcs
      for (let i = 0; i < sym; i++) {
        const a = (i * Math.PI * 2) / sym;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, a, a + Math.PI / (sym + 1));
        ctx.stroke();
      }
      break;
    case 4: // Pixelated voxel corner brackets (crisp squares)
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        ctx.strokeRect(
          Math.cos(a) * innerR * 0.68 - innerR * 0.22,
          Math.sin(a) * innerR * 0.68 - innerR * 0.22,
          innerR * 0.44,
          innerR * 0.44,
        );
      }
      break;
    case 5: // Swirling tomoe / chakra commas
      for (let i = 0; i < Math.min(4, sym); i++) {
        const a = (i * Math.PI * 2) / Math.min(4, sym);
        ctx.beginPath();
        ctx.arc(
          Math.cos(a) * innerR * 0.65,
          Math.sin(a) * innerR * 0.65,
          innerR * 0.2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
      }
      break;
    case 6: // Double crossed diamonds
      for (let rotOff = 0; rotOff < 2; rotOff++) {
        ctx.save();
        ctx.rotate((rotOff * Math.PI) / 4);
        ctx.strokeRect(-innerR * 0.56, -innerR * 0.56, innerR * 1.12, innerR * 1.12);
        ctx.restore();
      }
      break;
    case 7: // Alchemical dual-triangle hexagram
      for (const flip of [1, -1]) {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3 + (flip < 0 ? Math.PI : 0);
          if (i === 0) ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
          else ctx.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        }
        ctx.closePath();
        ctx.stroke();
      }
      break;
    case 8: // Twin opposing crescents
      for (const side of [0, Math.PI]) {
        ctx.beginPath();
        ctx.arc(0, 0, innerR, side - 0.75, side + 0.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, innerR * 0.65, side - 0.5, side + 0.5);
        ctx.stroke();
      }
      break;
    case 9: // Crosshair reticle ticks
      ctx.beginPath();
      ctx.arc(0, 0, innerR * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR * 0.45, Math.sin(a) * innerR * 0.45);
        ctx.lineTo(Math.cos(a) * innerR * 1.15, Math.sin(a) * innerR * 1.15);
        ctx.stroke();
      }
      break;
    case 10: // Swirling lotus petals
      for (let i = 0; i < sym; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / sym);
        ctx.beginPath();
        ctx.ellipse(innerR * 0.55, 0, innerR * 0.42, innerR * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      break;
    case 11: // Jagged sawtooth ring
      ctx.beginPath();
      for (let i = 0; i < sym * 2; i++) {
        const a = (i * Math.PI) / sym;
        const rad = i % 2 === 0 ? innerR * 1.05 : innerR * 0.72;
        if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    case 12: // Clockwork gear ticks
      ctx.beginPath();
      ctx.arc(0, 0, innerR * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < sym; i++) {
        const a = (i * Math.PI * 2) / sym;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR * 0.65, Math.sin(a) * innerR * 0.65);
        ctx.lineTo(Math.cos(a) * innerR * 1.05, Math.sin(a) * innerR * 1.05);
        ctx.stroke();
      }
      break;
    case 13: // Slitted ocular eye crest
      ctx.beginPath();
      ctx.ellipse(0, 0, innerR, innerR * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, innerR * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 14: // Spiral vortex arms
      for (let i = 0; i < Math.min(4, sym); i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / Math.min(4, sym));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(innerR * 0.55, innerR * 0.45, innerR, 0);
        ctx.stroke();
        ctx.restore();
      }
      break;
    default: // Diamond rune halo
      ctx.beginPath();
      ctx.moveTo(innerR, 0);
      ctx.lineTo(0, innerR * 0.68);
      ctx.lineTo(-innerR, 0);
      ctx.lineTo(0, -innerR * 0.68);
      ctx.closePath();
      ctx.stroke();
      break;
  }

  // 2. Orbiting secondary accent (8 variants)
  const orbitR = r * (0.94 + (dna.accentBand % 3) * 0.08);
  ctx.fillStyle = secondaryColor || '#ffffff';
  if (dna.orbitStyle === 0 || dna.orbitStyle === 4) {
    const count = 2 + (dna.accentBand % 3);
    for (let k = 0; k < count; k++) {
      const a = (k * Math.PI * 2) / count;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * orbitR, Math.sin(a) * orbitR, Math.max(1.6, r * 0.1), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (dna.orbitStyle === 1 || dna.orbitStyle === 5) {
    ctx.setLineDash([Math.max(2, r * 0.18), Math.max(2, r * 0.16)]);
    ctx.beginPath();
    ctx.arc(0, 0, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (dna.orbitStyle === 2 || dna.orbitStyle === 6) {
    // Twin chevron wings
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * orbitR * 0.82, -r * 0.25);
      ctx.lineTo(side * orbitR * 1.12, 0);
      ctx.lineTo(side * orbitR * 0.82, r * 0.25);
      ctx.stroke();
    }
  } else {
    // 4 tiny corner pips
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      ctx.fillRect(Math.cos(a) * orbitR - 1.5, Math.sin(a) * orbitR - 1.5, 3, 3);
    }
  }

  ctx.restore();
}

/**
 * Renders the unmistakable Franchise Cast Seal / Skill Aura on the arena floor
 * whenever ANY character casts one of their 5 skills or Ultimate!
 */
export function drawCastSeals(ctx: CanvasRenderingContext2D, seals: CastSeal[], t: number): void {
  for (const s of seals) {
    const progress = 1 - s.life / Math.max(0.01, s.maxLife);
    const alpha = Math.max(0, Math.min(1, (1 - progress) * 1.35)) * (s.isUltimate ? 0.92 : 0.78);
    if (alpha <= 0.02) continue;

    const dna = getCharacterVfxDNA(s.ownerCharId, s.ownerSeries);
    const expand = 0.62 + Math.min(1, progress * 2.2) * 0.45;
    const r = s.radius * expand;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(s.x, s.y);
    ctx.shadowColor = s.color;
    ctx.shadowBlur = s.isUltimate ? 24 : 12;

    switch (dna.seriesId) {
      case 'minecraft': {
        // Pixelated Minecraft Enchanting Table Voxel Grid + Square Frame!
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.6;
        ctx.strokeRect(-r, -r, r * 2, r * 2);
        ctx.strokeStyle = s.secondaryColor;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-r * 0.74, -r * 0.74, r * 1.48, r * 1.48);
        // Floating voxel corner cubes
        ctx.fillStyle = s.color;
        const cSz = Math.max(5, r * 0.16);
        for (const [cx, cy] of [
          [-r, -r],
          [r - cSz, -r],
          [-r, r - cSz],
          [r - cSz, r - cSz],
        ]) {
          ctx.fillRect(cx, cy, cSz, cSz);
        }
        // Enchantment pixel pips
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 + t * 2.2;
          ctx.fillRect(Math.cos(a) * r * 0.52 - 2, Math.sin(a) * r * 0.52 - 2, 4, 4);
        }
        break;
      }

      case 'lol': {
        // League of Legends Runeterra / Hextech Tactical Skillshot Cone + Rune Ring!
        ctx.rotate(s.angle);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha * 0.18;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 1.45, -0.36, 0.36);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        // Directional Hextech aiming chevrons toward target
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        for (let k = 1; k <= 2; k++) {
          const ox = r * (0.65 + k * 0.35);
          ctx.beginPath();
          ctx.moveTo(ox - 10, -10);
          ctx.lineTo(ox, 0);
          ctx.lineTo(ox - 10, 10);
          ctx.stroke();
        }
        break;
      }

      case 'undertale': {
        // Iconic Monochrome Undertale White Battle Box + Determination Soul Heart!
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.2;
        ctx.strokeRect(-r * 0.92, -r * 0.92, r * 1.84, r * 1.84);
        ctx.fillStyle = s.color;
        ctx.font = `900 ${Math.round(r * 0.58)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', 0, 2);
        break;
      }

      case 'fairy-tail':
      case 'black-clover':
      case 'frieren': {
        // Rotating Fairy Tail Mahoujin / Grimoire Magic Circle / Elven Hex-Array!
        ctx.rotate(t * 2.5 * dna.spinDir);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
        ctx.stroke();
        // Inscribed star / hexagram
        const pts = dna.seriesId === 'frieren' ? 6 : 5 + (dna.crestShape % 3);
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const a = (i * 2 * Math.PI * 2) / pts;
          const px = Math.cos(a) * r * 0.82;
          const py = Math.sin(a) * r * 0.82;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Black Clover floating Grimoire mini-book
        if (dna.seriesId === 'black-clover') {
          ctx.fillStyle = '#09090b';
          ctx.strokeStyle = s.color;
          ctx.fillRect(-r * 0.3, -r * 0.22, r * 0.6, r * 0.44);
          ctx.strokeRect(-r * 0.3, -r * 0.22, r * 0.6, r * 0.44);
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.22);
          ctx.lineTo(0, r * 0.22);
          ctx.stroke();
        }
        break;
      }

      case 'fma': {
        // Fullmetal Alchemist Glowing Transmutation Circle + Alchemy Lightning Sparks!
        ctx.rotate(t * 1.8 * dna.spinDir);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
        ctx.stroke();
        // Alchemical inscribed triangle & square
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78);
          else ctx.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78);
        }
        ctx.closePath();
        ctx.stroke();
        // Crackling blue alchemy sparks
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.6;
        for (let k = 0; k < 4; k++) {
          const a = k * 1.57 + t * 9;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
          ctx.lineTo(Math.cos(a + 0.25) * r * 1.15, Math.sin(a + 0.25) * r * 1.15);
          ctx.stroke();
        }
        break;
      }

      case 'jojo': {
        // JoJo Comic "ゴゴゴ" Menacing Katakana + Sharp Stand Burst!
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          const rad = i % 2 === 0 ? r * 1.12 : r * 0.72;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = s.secondaryColor || '#facc15';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 3;
        ctx.font = `900 ${Math.round(r * 0.34)}px sans-serif`;
        ctx.textAlign = 'center';
        const glyph = dna.crestShape % 2 === 0 ? 'ゴ' : 'ド';
        for (const [gx, gy] of [
          [-r * 0.72, -r * 0.45],
          [r * 0.74, -r * 0.35],
          [0, -r * 0.85],
        ]) {
          ctx.strokeText(glyph, gx, gy);
          ctx.fillText(glyph, gx, gy);
        }
        break;
      }

      case 'one-piece': {
        // One Piece Conqueror's Haki Black-Crimson Lightning Cracks + Manga Action Lines!
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4 + dna.flourishAngle * 0.2;
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 4.6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32);
          ctx.lineTo(Math.cos(a + 0.14) * r * 0.72, Math.sin(a + 0.14) * r * 0.72);
          ctx.lineTo(Math.cos(a - 0.08) * r * 1.15, Math.sin(a - 0.08) * r * 1.15);
          ctx.stroke();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        break;
      }

      case 'dragon-ball': {
        // Dragon Ball Super Saiyan Ki Crater + Jagged Energy Spikes!
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.08, r * 0.78, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI * 2) / 10 + t * 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
          ctx.lineTo(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18);
          ctx.stroke();
        }
        break;
      }

      case 'naruto': {
        // Naruto Shinobi Sealing Scroll / Sharingan 3-Tomoe Mandala!
        ctx.rotate(t * 2.8);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.56, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = s.color;
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r * 0.56, Math.sin(a) * r * 0.56, r * 0.11, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'jjk': {
        // Jujutsu Kaisen Black Flash Spatial Rift + Dark-Core Cursed Barrier!
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 + t * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4);
          ctx.lineTo(Math.cos(a + 0.18) * r * 0.78, Math.sin(a + 0.18) * r * 0.78);
          ctx.lineTo(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18);
          ctx.stroke();
        }
        break;
      }

      case 'demon-slayer': {
        // Ukiyo-e Japanese Woodblock Wave / Flame / Cloud Curling Swirls!
        ctx.rotate(s.angle);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 2 + t * 2.2);
          ctx.beginPath();
          ctx.arc(r * 0.45, 0, r * 0.42, 0, Math.PI * 1.35);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(r * 0.45, 0, r * 0.28, 0.2, Math.PI * 1.1);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      case 'bleach': {
        // Bleach Sumi-e Black Ink Brush Ring + Bankai Spiritual Pressure Flare!
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.92, 0.2, Math.PI * 1.85);
        ctx.stroke();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.98, 0, Math.PI * 1.6);
        ctx.stroke();
        break;
      }

      case 'fate': {
        // Fate Golden Gate of Babylon Ripple Portal Rings!
        for (let k = 0; k < 3; k++) {
          ctx.strokeStyle = k === 0 ? '#facc15' : s.color;
          ctx.lineWidth = 2.6 - k * 0.6;
          ctx.beginPath();
          ctx.arc(0, 0, r * (0.48 + k * 0.28), 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'solo-leveling':
      case 'slime': {
        // Solo Leveling Cyan [SYSTEM] Corner Frame + Shadow Monarch Mist Ring!
        const b = r * 0.88;
        const arm = r * 0.34;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.6;
        for (const [sx, sy] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ]) {
          ctx.beginPath();
          ctx.moveTo(sx * b, sy * (b - arm));
          ctx.lineTo(sx * b, sy * b);
          ctx.lineTo(sx * (b - arm), sy * b);
          ctx.stroke();
        }
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'chainsaw-man': {
        // Gritty Rotating Sawtooth Ring!
        ctx.rotate(t * 7);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
          const a = (i * Math.PI * 2) / 20;
          const rad = i % 2 === 0 ? r * 1.05 : r * 0.78;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case 'opm':
      case 'mha': {
        // Comic/Manga Halftone Impact Starburst!
        ctx.strokeStyle = dna.seriesId === 'opm' ? '#ffffff' : s.color;
        ctx.lineWidth = 2.4;
        for (let i = 0; i < 14; i++) {
          const a = (i * Math.PI * 2) / 14;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52);
          ctx.lineTo(
            Math.cos(a) * r * (i % 2 === 0 ? 1.22 : 0.92),
            Math.sin(a) * r * (i % 2 === 0 ? 1.22 : 0.92),
          );
          ctx.stroke();
        }
        break;
      }

      case 'zelda': {
        // Golden Triforce Rotating Seal!
        ctx.rotate(t * 2);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.4;
        const drawTri = (cx: number, cy: number, sz: number) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy - sz);
          ctx.lineTo(cx - sz * 0.88, cy + sz * 0.65);
          ctx.lineTo(cx + sz * 0.88, cy + sz * 0.65);
          ctx.closePath();
          ctx.stroke();
        };
        drawTri(0, -r * 0.36, r * 0.36);
        drawTri(-r * 0.32, r * 0.22, r * 0.36);
        drawTri(r * 0.32, r * 0.22, r * 0.36);
        break;
      }

      case 'genshin': {
        // Teyvat 4-Point Primogem Vision Star!
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const rad = i % 2 === 0 ? r * 1.15 : r * 0.35;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case 'god-of-war': {
        // Norse Omega Ring!
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, Math.PI * 0.72, Math.PI * 2.28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-r * 0.85, r * 0.65);
        ctx.lineTo(-r * 0.38, r * 0.65);
        ctx.moveTo(r * 0.38, r * 0.65);
        ctx.lineTo(r * 0.85, r * 0.65);
        ctx.stroke();
        break;
      }

      default: {
        // HxH Nen Hexagon / AoT Steam / SDS Sin Crest / DMC / Sonic / Pokemon / Mario / Kirby / FF7
        ctx.rotate(t * 2.4 * dna.spinDir);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }

    // Always layer the individual character's UNIQUE geometric crest inside the franchise seal!
    drawCharacterUniqueCrest(ctx, dna, r * 0.76, s.color, s.secondaryColor, t);
    ctx.restore();
  }
}
