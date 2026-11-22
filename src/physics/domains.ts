import type {
  ArenaDomain,
  ArenaDomainKind,
  CharacterConfig,
  FighterState,
  Point2D,
  SkillDef,
  StatusStunKind,
} from '../types/game';
import type { AbilityContext } from './abilities';

const CANON_DOMAIN_MAP: Readonly<Record<string, ArenaDomainKind>> = {
  // Jujutsu Kaisen
  gojo: 'unlimited-void',
  sukuna: 'malevolent-shrine',
  jogo: 'coffin-volcano',
  hakari: 'idle-death-gamble',
  mahito: 'petrify-charm',
  yuta: 'unlimited-blade-works',
  megumi: 'shadow-monarch',
  kenjaku: 'chibaku-gravity',
  yuji: 'high-noon-sun',
  toji: 'chainsaw-hell',
  todo: 'ope-room',
  choso: 'chainsaw-hell',
  kashimo: 'flying-raijin-blitz',
  nobara: 'birdcage-strings',
  nanami: 'quake-shatter',
  maki: 'chainsaw-hell',

  // JoJo's Bizarre Adventure
  dio: 'time-stop',
  jotaro: 'time-stop',
  pucci: 'time-stop',
  giorno: 'stand-barrage-requiem',
  diavolo: 'stand-barrage-requiem',
  kira: 'stand-barrage-requiem',
  josuke: 'idle-death-gamble',
  jolyne: 'birdcage-strings',
  kakyoin: 'birdcage-strings',
  polnareff: 'flying-raijin-blitz',
  bucciarati: 'ope-room',
  rohan: 'petrify-charm',
  kars: 'high-noon-sun',

  // One Piece
  luffy: 'gear5-toonworld',
  law: 'ope-room',
  whitebeard: 'quake-shatter',
  blackbeard: 'deep-dark-sculk',
  doflamingo: 'birdcage-strings',
  aokiji: 'frozen-glacier',
  akainu: 'coffin-volcano',
  ace: 'coffin-volcano',
  sabo: 'coffin-volcano',
  kizaru: 'flying-raijin-blitz',
  marco: 'idle-death-gamble',
  boa: 'petrify-charm',
  shanks: 'quake-shatter',
  kaido: 'quake-shatter',
  bigmom: 'coffin-volcano',
  zoro: 'senbonzakura-bankai',
  mihawk: 'senbonzakura-bankai',
  sanji: 'coffin-volcano',
  katakuri: 'ope-room',
  yamato_op: 'frozen-glacier',

  // Naruto
  itachi: 'tsukuyomi',
  sasuke: 'tsukuyomi',
  obito: 'tsukuyomi',
  madara: 'chibaku-gravity',
  pain: 'chibaku-gravity',
  minato: 'flying-raijin-blitz',
  naruto: 'spirit-bomb-ui',
  hashirama: 'transmutation-array',
  gaara: 'chibaku-gravity',
  tsunade: 'idle-death-gamble',
  kakashi: 'tsukuyomi',
  guy: 'high-noon-sun',
  kisame: 'frozen-glacier',
  deidara: 'coffin-volcano',
  sasori: 'birdcage-strings',
  orochimaru: 'petrify-charm',

  // Dragon Ball
  goku: 'spirit-bomb-ui',
  vegeta: 'spirit-bomb-ui',
  broly: 'spirit-bomb-ui',
  gohan: 'spirit-bomb-ui',
  vegito: 'spirit-bomb-ui',
  gogeta: 'spirit-bomb-ui',
  beerus: 'spirit-bomb-ui',
  jiren: 'high-noon-sun',
  frieza: 'chibaku-gravity',
  cell: 'spirit-bomb-ui',
  buu: 'idle-death-gamble',
  hit: 'time-stop',
  gokublack: 'tsukuyomi',

  // Demon Slayer
  akaza: 'compass-needle',
  tanjiro: 'compass-needle',
  zenitsu: 'flying-raijin-blitz',
  kokushibo: 'compass-needle',
  rengoku: 'coffin-volcano',
  doma: 'frozen-glacier',
  giyu: 'frozen-glacier',
  shinobu: 'petrify-charm',
  muzan: 'chainsaw-hell',
  tengen: 'coffin-volcano',
  muichiro: 'deep-dark-sculk',

  // Bleach
  byakuya: 'senbonzakura-bankai',
  ichigo: 'senbonzakura-bankai',
  aizen: 'petrify-charm',
  yamamoto: 'coffin-volcano',
  toshiro: 'frozen-glacier',
  rukia: 'frozen-glacier',
  kenpachi: 'quake-shatter',
  ulquiorra: 'deep-dark-sculk',
  yhwach: 'time-stop',
  yoruichi: 'flying-raijin-blitz',
  shunsui: 'deep-dark-sculk',
  mayuri: 'petrify-charm',

  // Fate
  gilgamesh: 'gate-of-babylon',
  enkidu: 'gate-of-babylon',
  archer_emiya: 'unlimited-blade-works',
  saber: 'unlimited-blade-works',
  lancer_cu: 'unlimited-blade-works',
  rider_medusa: 'petrify-charm',
  iskandar: 'unlimited-blade-works',
  karna: 'high-noon-sun',
  jeanne: 'mahoujin-grand-magic',
  jeanne_alter: 'coffin-volcano',
  solomon: 'mahoujin-grand-magic',

  // Fullmetal Alchemist
  edward: 'transmutation-array',
  alphonse: 'transmutation-array',
  hohenheim: 'transmutation-array',
  father_fma: 'high-noon-sun',
  roy: 'coffin-volcano',
  scar_fma: 'transmutation-array',
  pride_fma: 'deep-dark-sculk',
  gluttony_fma: 'chibaku-gravity',
  bradley: 'flying-raijin-blitz',
  armstrong: 'transmutation-array',
  olivier: 'frozen-glacier',

  // Fairy Tail
  natsu: 'coffin-volcano',
  gray: 'frozen-glacier',
  erza: 'unlimited-blade-works',
  jellal: 'mahoujin-grand-magic',
  zeref: 'mahoujin-grand-magic',
  acnologia: 'mahoujin-grand-magic',
  mavis: 'mahoujin-grand-magic',
  laxus: 'flying-raijin-blitz',
  lucy_ft: 'mahoujin-grand-magic',
  gildarts: 'quake-shatter',

  // Solo Leveling
  jinwoo: 'shadow-monarch',
  ashborn: 'shadow-monarch',
  igris: 'shadow-monarch',
  beru: 'shadow-monarch',
  bellion: 'shadow-monarch',
  antares: 'coffin-volcano',
  thomas_andre: 'chibaku-gravity',

  // Attack on Titan
  eren: 'rumbling-colossal',
  armin: 'rumbling-colossal',
  bertholdt: 'rumbling-colossal',
  reiner: 'rumbling-colossal',
  zeke: 'rumbling-colossal',
  annie: 'rumbling-colossal',
  levi: 'flying-raijin-blitz',
  mikasa: 'rumbling-colossal',

  // Chainsaw Man
  denji: 'chainsaw-hell',
  makima: 'birdcage-strings',
  darkness: 'deep-dark-sculk',
  power: 'chainsaw-hell',
  reze: 'coffin-volcano',
  katana_man: 'flying-raijin-blitz',
  quanxi: 'flying-raijin-blitz',

  // Black Clover
  asta: 'full-counter-cube',
  yuno: 'mahoujin-grand-magic',
  yami: 'deep-dark-sculk',
  julius: 'time-stop',
  noelle: 'frozen-glacier',
  mereoleona: 'coffin-volcano',
  luck: 'flying-raijin-blitz',
  nacht: 'shadow-monarch',

  // The Seven Deadly Sins
  meliodas: 'full-counter-cube',
  escanor: 'high-noon-sun',
  merlin_sds: 'full-counter-cube',
  ban: 'idle-death-gamble',
  king_sds: 'gate-of-babylon',
  diane: 'transmutation-array',
  gowther: 'petrify-charm',
  zeldris: 'chibaku-gravity',
  estarossa: 'high-noon-sun',

  // One Punch Man, Hunter x Hunter, My Hero Academia, Others
  saitama: 'high-noon-sun',
  tatsumaki: 'chibaku-gravity',
  garou: 'unlimited-void',
  boros: 'spirit-bomb-ui',
  flashy: 'flying-raijin-blitz',
  zombieman: 'idle-death-gamble',
  killua: 'flying-raijin-blitz',
  kurapika: 'birdcage-strings',
  hisoka: 'birdcage-strings',
  netero: 'high-noon-sun',
  meruem: 'spirit-bomb-ui',
  deku: 'high-noon-sun',
  allmight: 'high-noon-sun',
  todoroki: 'frozen-glacier',
  endeavor: 'coffin-volcano',
  dabi: 'coffin-volcano',
  bakugo: 'coffin-volcano',
  shigaraki: 'quake-shatter',
  uraraka: 'chibaku-gravity',
  rimuru: 'chibaku-gravity',
  frieren: 'mahoujin-grand-magic',
  mob: 'chibaku-gravity',

  // Games: Minecraft, League of Legends, Undertale, Genshin, etc.
  steve: 'minecraft-end',
  alex: 'minecraft-end',
  enderman: 'minecraft-end',
  technoblade: 'minecraft-end',
  herobrine: 'herobrine-corruption',
  entity303: 'herobrine-corruption',
  wither: 'herobrine-corruption',
  creeper: 'herobrine-corruption',
  warden: 'deep-dark-sculk',
  sans: 'undertale-badtime',
  papyrus: 'undertale-badtime',
  undyne: 'undertale-badtime',
  chara: 'undertale-badtime',
  jevil: 'undertale-badtime',
  yasuo: 'full-counter-cube',
  yone: 'full-counter-cube',
  riven: 'full-counter-cube',
  zed: 'lol-nexus-ultimate',
  mordekaiser: 'lol-nexus-ultimate',
  thresh: 'birdcage-strings',
  lux: 'lol-nexus-ultimate',
  jinx: 'lol-nexus-ultimate',
  ahri: 'petrify-charm',
  ekko: 'time-stop',
  garen: 'lol-nexus-ultimate',
  darius: 'lol-nexus-ultimate',
  teemo: 'petrify-charm',
  vergil: 'full-counter-cube',
  kratos: 'full-counter-cube',
  sonic: 'flying-raijin-blitz',
  shadow: 'time-stop',
  pikachu: 'flying-raijin-blitz',
  subzero: 'frozen-glacier',
  scorpion: 'chainsaw-hell',
  zhongli: 'chibaku-gravity',
  raiden: 'full-counter-cube',
  hutao: 'coffin-volcano',
  cloud: 'unlimited-blade-works',
  sephiroth: 'chibaku-gravity',
  link: 'full-counter-cube',
  mario: 'gear5-toonworld',
  kirby: 'chibaku-gravity',
  doomguy: 'chainsaw-hell',
};

export function resolveCharacterDomainKind(char: CharacterConfig): ArenaDomainKind {
  const explicit = CANON_DOMAIN_MAP[char.id];
  if (explicit) return explicit;

  switch (char.series) {
    case 'Jujutsu Kaisen':
      return 'unlimited-void';
    case 'One Piece':
      return 'quake-shatter';
    case 'Dragon Ball':
      return 'spirit-bomb-ui';
    case 'Naruto':
      return 'tsukuyomi';
    case 'Demon Slayer':
      return 'compass-needle';
    case 'Bleach':
      return 'senbonzakura-bankai';
    case "JoJo's Bizarre Adventure":
      return 'stand-barrage-requiem';
    case 'Fate':
      return 'unlimited-blade-works';
    case 'Fullmetal Alchemist':
      return 'transmutation-array';
    case 'Fairy Tail':
    case 'Black Clover':
      return 'mahoujin-grand-magic';
    case 'Solo Leveling':
      return 'shadow-monarch';
    case 'Attack on Titan':
      return 'rumbling-colossal';
    case 'Chainsaw Man':
      return 'chainsaw-hell';
    case 'The Seven Deadly Sins':
      return 'full-counter-cube';
    case 'Minecraft':
      return 'minecraft-end';
    case 'League of Legends':
      return 'lol-nexus-ultimate';
    case 'Undertale':
      return 'undertale-badtime';
    default:
      break;
  }

  switch (char.ultimate.archetype) {
    case 'domain-void':
      return 'unlimited-void';
    case 'slash-storm':
      return 'malevolent-shrine';
    case 'gravity-crush':
      return 'chibaku-gravity';
    case 'shadow-legion':
      return 'shadow-monarch';
    case 'thunder-storm':
      return 'flying-raijin-blitz';
    case 'tnt-barrage':
      return 'minecraft-end';
    case 'gaster-cross':
      return 'undertale-badtime';
    case 'mega-shockwave':
      return 'high-noon-sun';
    case 'blade-vortex':
      return 'unlimited-blade-works';
    case 'mega-fist':
      return 'gear5-toonworld';
    case 'meteor-rain':
      return 'coffin-volcano';
    default:
      return 'spirit-bomb-ui';
  }
}

const DOMAIN_TITLES: Readonly<Record<ArenaDomainKind, { title: string; subtitle: string }>> = {
  'unlimited-void': {
    title: 'DOMAIN EXPANSION: UNLIMITED VOID',
    subtitle: 'Infinite information overload · Paralyzes all enemies!',
  },
  'malevolent-shrine': {
    title: 'DOMAIN EXPANSION: MALEVOLENT SHRINE',
    subtitle: 'Relentless sure-hit Cleave & Dismantle slashes across the arena!',
  },
  'time-stop': {
    title: 'TIME STOP · THE WORLD!',
    subtitle: 'Freezes all enemies & incoming projectiles in mid-air!',
  },
  'ope-room': {
    title: 'SPATIAL SURGERY · ROOM: SHAMBLES!',
    subtitle: 'Scrambles enemy positions & slices through space!',
  },
  tsukuyomi: {
    title: 'ILLUSION REALM · TSUKUYOMI!',
    subtitle: 'Blood Moon traps minds & rains phantom blades!',
  },
  'gear5-toonworld': {
    title: 'SUN GOD NIKA AWAKENED · TOON FORCE!',
    subtitle: 'Turns the arena into elastic rubber & grabs lightning bolts!',
  },
  'spirit-bomb-ui': {
    title: 'ULTRA INSTINCT & SPIRIT BOMB!',
    subtitle: 'Gathers arena-wide energy & auto-dodges incoming attacks!',
  },
  'gate-of-babylon': {
    title: "KING'S TREASURY · GATE OF BABYLON!",
    subtitle: 'Chains of Heaven bind foes & 12 golden portals rain Noble Phantasms!',
  },
  'unlimited-blade-works': {
    title: 'REALITY MARBLE · UNLIMITED BLADE WORKS!',
    subtitle: 'Infinite hill of swords launches blades nonstop from the ground!',
  },
  'shadow-monarch': {
    title: 'SHADOW MONARCH · ARISE! [SYSTEM]',
    subtitle: "Extracts the Shadow Army & unleashes Ruler's Authority!",
  },
  'minecraft-end': {
    title: 'THE END DIMENSION · ENDER DRAGON!',
    subtitle: '4 End Crystals heal & the Ender Dragon patrols spitting acid!',
  },
  'herobrine-corruption': {
    title: 'MINECRAFT WORLD CORRUPTION · ADMIN WRATH!',
    subtitle: 'Sky lightning storm & Obsidian / Error 303 blocks strike nonstop!',
  },
  'deep-dark-sculk': {
    title: 'ABYSS OF DARKNESS · DEEP DARK SCULK!',
    subtitle: 'Silences enemy skills & fires armor-piercing Sonic Booms!',
  },
  'undertale-badtime': {
    title: 'UNDERTALE BATTLE BOX · BAD TIME!',
    subtitle: 'Blue Soul gravity pulls foes down & Gaster Blasters cross-fire!',
  },
  'compass-needle': {
    title: 'DESTRUCTIVE DEATH: COMPASS NEEDLE & UKIYO-E!',
    subtitle: 'Auto-tracks fighting spirit & unleashes relentless crescent slashes!',
  },
  'senbonzakura-bankai': {
    title: 'BANKAI RELEASE · SENBONZAKURA KAGEYOSHI!',
    subtitle: 'Hundreds of razor cherry-blossom blades shred the entire arena!',
  },
  'quake-shatter': {
    title: "SPACE-SHATTERING QUAKE · CONQUEROR'S HAKI!",
    subtitle: 'Cracks reality like glass · Shocks & slams enemies into walls!',
  },
  'birdcage-strings': {
    title: 'RAZOR BIRDCAGE & CHAINS OF CONTROL!',
    subtitle: 'Locks targets in chains & closes a slicing cage around them!',
  },
  'coffin-volcano': {
    title: 'COFFIN OF THE IRON MOUNTAIN · GREAT INFERNO!',
    subtitle: 'Erupts magma underfoot & scorches enemies continuously!',
  },
  'idle-death-gamble': {
    title: 'DOMAIN EXPANSION · 777 IMMORTAL JACKPOT!',
    subtitle: 'Continuous rapid healing & true immortality for 4 seconds!',
  },
  'frozen-glacier': {
    title: 'ABSOLUTE ICE AGE · FREEZE!',
    subtitle: 'Encases enemies solid inside glacial ice crystals!',
  },
  'transmutation-array': {
    title: 'GRAND TRANSMUTATION CIRCLE!',
    subtitle: 'Alchemizes stone pillars to trap foes & detonate shockwaves!',
  },
  'mahoujin-grand-magic': {
    title: 'GRAND MAGIC CIRCLE · MAHOUJIN STARFALL!',
    subtitle: '3 spinning magic rings call down celestial pillars of light!',
  },
  'high-noon-sun': {
    title: 'HIGH NOON · THE ONE / SERIOUS SERIES!',
    subtitle: 'Unstoppable crowd-control immunity & supersonic shockwaves!',
  },
  'full-counter-cube': {
    title: 'FULL COUNTER & PERFECT CUBE!',
    subtitle: 'Auto-reflects 100% of enemy projectiles back at 1.6x damage!',
  },
  'chibaku-gravity': {
    title: 'PLANETARY DEVASTATION · CHIBAKU TENSEI!',
    subtitle: 'Gravity core pulls all enemies inward before exploding!',
  },
  'rumbling-colossal': {
    title: 'EARTH-SHAKING MARCH · THE RUMBLING!',
    subtitle: 'Golden Titan lightning & scorching steam sweep the arena!',
  },
  'lol-nexus-ultimate': {
    title: 'RUNETERRA ULTIMATE · PRESS R!',
    subtitle: 'Death Mark / Realm of Death locks down the target!',
  },
  'petrify-charm': {
    title: 'PETRIFICATION & COMPLETE HYPNOSIS!',
    subtitle: 'Turns targets to stone & scrambles enemy controls!',
  },
  'chainsaw-hell': {
    title: 'CHAINSAW HELL · BLOOD FRENZY!',
    subtitle: 'Frenzied lifesteal & a rain of razor chainsaw blades!',
  },
  'flying-raijin-blitz': {
    title: 'FLYING RAIJIN LEVEL 3 · INSTANT BLITZ!',
    subtitle: 'Places 6 seals across the arena & chain-teleports to strike!',
  },
  'stand-barrage-requiem': {
    title: 'STAND REQUIEM · RETURN TO ZERO!',
    subtitle: 'Nullifies enemy momentum & unleashes a Stand punch barrage!',
  },
};

export function applyFighterStun(
  ctx: AbilityContext,
  attacker: FighterState,
  target: FighterState,
  duration: number,
  kind: StatusStunKind,
  callout?: string,
): boolean {
  if (!target.alive) return false;
  if (target.unstoppableTimer > 0) {
    ctx.spawnFloatingText(target.x, target.y - target.radius - 12, 'UNSTOPPABLE!', '#facc15', 'callout');
    return false;
  }

  // Save pre-freeze velocity for Time Stop / Void paralysis restoration
  if (target.stunTimer <= 0) {
    target.savedVx = target.vx;
    target.savedVy = target.vy;
  }
  target.stunTimer = Math.max(target.stunTimer, duration);
  target.stunKind = kind;
  target.vx = 0;
  target.vy = 0;

  if (callout) {
    const col =
      kind === 'void-overload'
        ? '#e0f2fe'
        : kind === 'time-stop'
          ? '#facc15'
          : kind === 'frozen'
            ? '#38bdf8'
            : kind === 'genjutsu'
              ? '#ef4444'
              : kind === 'petrified'
                ? '#cbd5e1'
                : '#f472b6';
    ctx.spawnFloatingText(target.x, target.y - target.radius - 14, callout, col, 'callout');
  }
  void attacker;
  return true;
}

export function applyFighterBurn(
  target: FighterState,
  ownerUid: string,
  duration: number,
  dps: number,
): void {
  if (!target.alive) return;
  target.burnTimer = Math.max(target.burnTimer, duration);
  target.burnDps = Math.max(target.burnDps, dps);
  target.burnOwnerUid = ownerUid;
}

/**
 * Activates a character's anime/game-accurate Domain Expansion / Signature Reality!
 */
export function activateCharacterDomain(ctx: AbilityContext, f: FighterState): ArenaDomain {
  const kind = resolveCharacterDomainKind(f.character);
  const meta = DOMAIN_TITLES[kind];
  const { left, right, top, bottom } = ctx.bounds;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const fullSpan = Math.max(right - left, bottom - top);

  // Replace any older domain from the same caster; cap total concurrent domains at 2 (Domain Clash!)
  for (let i = ctx.domains.length - 1; i >= 0; i--) {
    if (ctx.domains[i].ownerUid === f.uid) {
      ctx.domains.splice(i, 1);
    }
  }
  if (ctx.domains.length >= 2) {
    ctx.domains.shift();
  }

  const duration =
    kind === 'time-stop'
      ? 2.8
      : kind === 'unlimited-void'
        ? 4.4
        : kind === 'malevolent-shrine'
          ? 4.6
          : kind === 'idle-death-gamble'
            ? 4.4
            : 4.2;

  // Generate 6 Flying Raijin / Gate markers when needed
  let markers: Point2D[] | undefined;
  if (kind === 'flying-raijin-blitz' || kind === 'gate-of-babylon') {
    markers = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + 0.3;
      markers.push({
        x: cx + Math.cos(a) * fullSpan * 0.34,
        y: cy + Math.sin(a) * fullSpan * 0.34,
      });
    }
  }

  const domain: ArenaDomain = {
    id: ctx.nextId('dom'),
    kind,
    ownerUid: f.uid,
    ownerCharId: f.character.id,
    ownerSeries: f.character.series,
    teamId: f.teamId,
    title: meta.title,
    subtitle: meta.subtitle,
    x: cx,
    y: cy,
    radius: fullSpan * 0.56,
    color: f.character.ultimate.color || f.character.primaryColor,
    secondaryColor: f.character.secondaryColor || '#ffffff',
    life: duration,
    maxLife: duration,
    tickTimer: 0.16,
    tickCount: 0,
    markers,
  };

  ctx.domains.push(domain);
  const enemies = ctx.getEnemies(f);
  const form = ctx.getForm(f);

  // Immediate Anime-Accurate Entry Effects!
  switch (kind) {
    case 'unlimited-void': {
      // Gojo's Unlimited Void: IMMEDIATE cosmic information overload paralyzing ALL enemies!
      for (const e of enemies) {
        applyFighterStun(ctx, f, e, 2.7, 'void-overload', '∞ UNLIMITED VOID!');
      }
      ctx.spawnFloatingText(cx, top + 62, 'UNLIMITED VOID!', '#7dd3fc', 'powerup');
      break;
    }

    case 'time-stop': {
      // DIO / Jotaro / Hit: FREEZE all enemies AND freeze every enemy projectile in mid-air!
      for (const e of enemies) {
        applyFighterStun(ctx, f, e, 2.5, 'time-stop', 'TIME STOPPED!');
      }
      for (const p of ctx.projectiles) {
        if (p.ownerUid === f.uid) continue;
        if (f.teamId !== null && p.teamId === f.teamId) continue;
        p.frozenTimer = 2.5;
      }
      ctx.spawnFloatingText(cx, top + 62, 'TOKI WO TOMARE!', '#facc15', 'powerup');
      break;
    }

    case 'tsukuyomi': {
      // Itachi / Sasuke Blood Moon Genjutsu: paralyzes target in crimson illusion!
      for (const e of enemies) {
        applyFighterStun(ctx, f, e, 2.1, 'genjutsu', 'TSUKUYOMI!');
      }
      break;
    }

    case 'frozen-glacier': {
      // Aokiji / Toshiro / Rukia / Gray / Sub-Zero: encase enemies in solid Ice Crystals!
      for (const e of enemies) {
        applyFighterStun(ctx, f, e, 1.9, 'frozen', 'FROZEN!');
      }
      break;
    }

    case 'petrify-charm': {
      // Boa Hancock / Medusa / Aizen / Ahri: petrify or complete hypnosis confusion!
      const isHypnosis =
        f.character.id === 'aizen' || f.character.id === 'gowther' || f.character.id === 'ahri';
      for (const e of enemies) {
        if (isHypnosis) {
          e.confusedTimer = Math.max(e.confusedTimer, 3.2);
          ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'HYPNOTIZED!', '#e879f9', 'callout');
        } else {
          applyFighterStun(ctx, f, e, 1.85, 'petrified', 'PETRIFIED!');
        }
      }
      break;
    }

    case 'gate-of-babylon':
    case 'birdcage-strings': {
      // Enkidu Chains of Heaven / Makima / Kurapika / Doflamingo bind nearest enemy!
      const nearest = ctx.getNearestEnemy(f);
      if (nearest) {
        applyFighterStun(ctx, f, nearest, 1.65, 'chained', 'BOUND!');
      }
      break;
    }

    case 'idle-death-gamble': {
      // Hakari 777 Jackpot / Marco / Ban: true immortality + continuous heal!
      f.immortalTimer = Math.max(f.immortalTimer, 4.2);
      ctx.spawnFloatingText(f.x, f.y - f.radius - 18, '777 JACKPOT! IMMORTAL!', '#4ade80', 'powerup');
      break;
    }

    case 'high-noon-sun': {
      // Escanor THE ONE / Saitama Serious / All Might: unstoppable golden juggernaut!
      f.unstoppableTimer = Math.max(f.unstoppableTimer, 3.8);
      ctx.spawnFloatingText(f.x, f.y - f.radius - 18, 'UNSTOPPABLE!', '#facc15', 'powerup');
      break;
    }

    case 'deep-dark-sculk': {
      // Warden / Blackbeard / Darkness Devil: silence enemy skills!
      for (const e of enemies) {
        e.silenceTimer = Math.max(e.silenceTimer, 3.4);
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'SILENCED!', '#22d3ee', 'callout');
      }
      break;
    }

    case 'full-counter-cube': {
      // Meliodas / Yasuo / Merlin: airborne enemies & shield up!
      f.shieldTimer = Math.max(f.shieldTimer, 3.6);
      f.shieldColor = domain.color;
      for (const e of enemies) {
        applyFighterStun(ctx, f, e, 0.9, 'airborne', 'AIRBORNE!');
      }
      break;
    }

    case 'coffin-volcano': {
      // Jogo / Yamamoto / Akainu / Natsu: ignite all enemies with intense burn!
      const burnDps = ctx.getEffectiveDamage(f, 3.6 + form.powerLevel * 0.5);
      for (const e of enemies) {
        applyFighterBurn(e, f.uid, 3.6, burnDps);
      }
      break;
    }

    case 'stand-barrage-requiem': {
      // Giorno GER Return to Zero: cancel all enemy velocities & heal caster slightly!
      for (const e of enemies) {
        e.vx *= 0.05;
        e.vy *= 0.05;
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'RETURN TO ZERO!', '#facc15', 'callout');
      }
      const heal = Math.round(f.maxHp * 0.08);
      f.hp = Math.min(f.maxHp, f.hp + heal);
      break;
    }

    default:
      break;
  }

  return domain;
}

/**
 * Updates all active persistent Domain Expansions & Signature Realities every fixed step!
 */
export function updateActiveDomains(ctx: AbilityContext, dt: number): void {
  const { left, right, top, bottom } = ctx.bounds;
  const span = Math.max(right - left, bottom - top);

  for (let i = ctx.domains.length - 1; i >= 0; i--) {
    const dom = ctx.domains[i];
    dom.life -= dt;
    dom.tickTimer -= dt;

    const owner = ctx.fighters.find((f) => f.uid === dom.ownerUid);
    if (!owner || !owner.alive || dom.life <= 0) {
      // On Time Stop expiry -> TIME RESUMES burst!
      if (dom.kind === 'time-stop' && owner && owner.alive) {
        ctx.spawnFloatingText(dom.x, top + 62, 'TIME RESUMES!', '#facc15', 'powerup');
        for (const enemy of ctx.getEnemies(owner)) {
          const ang = Math.atan2(enemy.y - owner.y, enemy.x - owner.x);
          ctx.applyDamage(
            owner,
            enemy,
            ctx.getEffectiveDamage(owner, 12.5),
            Math.cos(ang) * 520,
            Math.sin(ang) * 520,
            { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
          );
        }
      }
      // On Chibaku Tensei expiry -> planetary core explosion!
      if (dom.kind === 'chibaku-gravity' && owner && owner.alive) {
        ctx.spawnShockwave(dom.x, dom.y, 260, dom.color, 8, dom.ownerCharId, dom.ownerSeries);
        for (const enemy of ctx.getEnemies(owner)) {
          const ang = Math.atan2(enemy.y - dom.y, enemy.x - dom.x);
          ctx.applyDamage(
            owner,
            enemy,
            ctx.getEffectiveDamage(owner, 14),
            Math.cos(ang) * 620,
            Math.sin(ang) * 620,
            { isCrit: true, sourceKind: 'ability' },
          );
        }
      }
      ctx.domains.splice(i, 1);
      continue;
    }

    const enemies = ctx.getEnemies(owner);
    const form = ctx.getForm(owner);

    // Continuous per-frame domain physics (Gravity, Blue Soul, Full Counter reflection, Gear 5 rubber chaos)
    if (dom.kind === 'chibaku-gravity') {
      for (const e of enemies) {
        const dx = dom.x - e.x;
        const dy = dom.y - e.y;
        const d = Math.max(20, Math.hypot(dx, dy));
        e.vx += (dx / d) * 420 * dt;
        e.vy += (dy / d) * 420 * dt;
      }
    } else if (dom.kind === 'undertale-badtime') {
      // Blue Soul Gravity pulls all enemies straight down toward the bottom wall!
      for (const e of enemies) {
        e.vy += 680 * dt;
      }
    } else if (dom.kind === 'full-counter-cube') {
      // Reflect every enemy projectile automatically back at enemies!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 95) {
          p.vx = -p.vx * 1.45;
          p.vy = -p.vy * 1.45;
          p.ownerUid = owner.uid;
          p.ownerCharId = owner.character.id;
          p.ownerSeries = owner.character.series;
          p.teamId = owner.teamId;
          p.damage *= 1.5;
          p.color = dom.color;
          p.angle = Math.atan2(p.vy, p.vx);
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 12,
            'FULL COUNTER!',
            '#facc15',
            'callout',
          );
        }
      }
    } else if (dom.kind === 'time-stop') {
      // Keep enemy projectiles frozen during Time Stop!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        p.frozenTimer = Math.max(p.frozenTimer ?? 0, 0.15);
      }
    }

    if (dom.tickTimer > 0) continue;
    dom.tickCount += 1;

    // Periodic Anime/Game Domain Sure-Hit Effects!
    switch (dom.kind) {
      case 'unlimited-void': {
        dom.tickTimer = 0.55;
        // Cosmic sure-hit psychic overload ticks + spawns stars & Hollow Purple on tick 2!
        for (const e of enemies) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
            bypassInvuln: true,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 6, '#e0f2fe', 30, 120, 2, 4.5, 'star');
        }
        if (dom.tickCount === 2 && enemies[0]) {
          const ang = Math.atan2(enemies[0].y - owner.y, enemies[0].x - owner.x);
          ctx.projectiles.push({
            id: ctx.nextId('voidp'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'purple',
            x: owner.x + Math.cos(ang) * (owner.radius + 20),
            y: owner.y + Math.sin(ang) * (owner.radius + 20),
            vx: Math.cos(ang) * 340,
            vy: Math.sin(ang) * 340,
            radius: 44,
            damage: ctx.getEffectiveDamage(owner, 14),
            knockback: 460,
            color: '#a855f7',
            secondaryColor: '#e0f2fe',
            angle: ang,
            life: 2.2,
            maxLife: 2.2,
            piercing: true,
            blocksProjectiles: true,
            hitCooldowns: {},
            powerLevel: 6,
          });
        }
        break;
      }

      case 'malevolent-shrine': {
        dom.tickTimer = 0.24;
        // Relentless sure-hit Cleave & Dismantle slashes directly across EVERY enemy in the Shrine!
        for (const e of enemies) {
          const ang = Math.random() * Math.PI;
          const half = 88;
          ctx.slashes.push({
            id: ctx.nextId('shrine'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            x1: e.x - Math.cos(ang) * half,
            y1: e.y - Math.sin(ang) * half,
            x2: e.x + Math.cos(ang) * half,
            y2: e.y + Math.sin(ang) * half,
            color: '#dc2626',
            secondaryColor: '#09090b',
            coreColor: '#ffffff',
            width: 6.5,
            telegraphTimer: 0.08,
            activeTimer: 0.09,
            fadeTimer: 0.22,
            maxFade: 0.22,
            damage: ctx.getEffectiveDamage(owner, 4.2),
            hasStruck: false,
          });
        }
        break;
      }

      case 'time-stop': {
        dom.tickTimer = 0.42;
        // Throw ring of knives/strikes around frozen enemies that hover & pierce!
        const target = enemies[0];
        if (target) {
          const a = dom.tickCount * 1.25;
          const kx = target.x + Math.cos(a) * 95;
          const ky = target.y + Math.sin(a) * 95;
          const aim = Math.atan2(target.y - ky, target.x - kx);
          ctx.projectiles.push({
            id: ctx.nextId('tknife'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'kunai-knife',
            x: kx,
            y: ky,
            vx: Math.cos(aim) * 560,
            vy: Math.sin(aim) * 560,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 180,
            color: dom.color,
            secondaryColor: '#ffffff',
            angle: aim,
            life: 1.0,
            maxLife: 1.0,
            piercing: false,
            hitCooldowns: {},
            powerLevel: 5,
          });
        }
        break;
      }

      case 'ope-room': {
        dom.tickTimer = 0.92;
        // Law ROOM SHAMBLES: teleport-scramble enemy position & slice with surgical cut!
        const target = enemies[dom.tickCount % Math.max(1, enemies.length)];
        if (target) {
          const newX = left + 70 + Math.random() * (right - left - 140);
          const newY = top + 70 + Math.random() * (bottom - top - 140);
          target.x = newX;
          target.y = newY;
          ctx.spawnFloatingText(newX, newY - target.radius - 14, 'SHAMBLES!', '#38bdf8', 'callout');
          ctx.slashes.push({
            id: ctx.nextId('roomsl'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            x1: newX - 90,
            y1: newY - 40,
            x2: newX + 90,
            y2: newY + 40,
            color: '#38bdf8',
            secondaryColor: '#ffffff',
            coreColor: '#ffffff',
            width: 7,
            telegraphTimer: 0.08,
            activeTimer: 0.1,
            fadeTimer: 0.25,
            maxFade: 0.25,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            hasStruck: false,
          });
        }
        break;
      }

      case 'gate-of-babylon':
      case 'unlimited-blade-works': {
        dom.tickTimer = 0.34;
        const target = enemies[dom.tickCount % Math.max(1, enemies.length)];
        if (target) {
          const origin =
            dom.markers && dom.markers.length > 0
              ? dom.markers[dom.tickCount % dom.markers.length]
              : {
                  x: left + 50 + Math.random() * (right - left - 100),
                  y: top + 50 + Math.random() * (bottom - top - 100),
                };
          const aim = Math.atan2(target.y - origin.y, target.x - origin.x);
          const kinds = ['spear', 'sword-wave', 'buster-greatsword', 'axe'] as const;
          ctx.projectiles.push({
            id: ctx.nextId('gatew'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: kinds[dom.tickCount % kinds.length],
            x: origin.x,
            y: origin.y,
            vx: Math.cos(aim) * 600,
            vy: Math.sin(aim) * 600,
            radius: 16,
            damage: ctx.getEffectiveDamage(owner, 5.8),
            knockback: 220,
            color: dom.kind === 'gate-of-babylon' ? '#facc15' : dom.color,
            secondaryColor: '#ffffff',
            angle: aim,
            life: 1.5,
            maxLife: 1.5,
            piercing: true,
            hitCooldowns: {},
            powerLevel: 5,
          });
        }
        break;
      }

      case 'idle-death-gamble': {
        dom.tickTimer = 0.36;
        // Hakari 777 Jackpot continuous massive regeneration + rhythmic golden burst!
        const heal = Math.max(5, Math.round(owner.maxHp * 0.032));
        if (owner.hp < owner.maxHp) {
          owner.hp = Math.min(owner.maxHp, owner.hp + heal);
          ctx.spawnFloatingText(
            owner.x,
            owner.y + owner.radius + 14,
            `+${heal} HP`,
            '#4ade80',
            'heal',
          );
        }
        ctx.spawnShockwave(owner.x, owner.y, 120, '#4ade80', 3.5, dom.ownerCharId, dom.ownerSeries);
        break;
      }

      case 'minecraft-end': {
        dom.tickTimer = 0.72;
        // End Crystals heal Steve & drop TNT!
        const heal = Math.max(4, Math.round(owner.maxHp * 0.025));
        owner.hp = Math.min(owner.maxHp, owner.hp + heal);
        const target = enemies[0];
        if (target) {
          ctx.bombs.push({
            id: ctx.nextId('endtnt'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'tnt',
            x: Math.max(left + 32, Math.min(right - 32, target.x + (Math.random() - 0.5) * 60)),
            y: Math.max(top + 32, Math.min(bottom - 32, target.y + (Math.random() - 0.5) * 60)),
            radius: 17,
            blastRadius: 145,
            damage: ctx.getEffectiveDamage(owner, 8.5),
            fuseTimer: 0.75,
            maxFuse: 0.75,
            color: '#ef4444',
          });
        }
        break;
      }

      case 'herobrine-corruption':
      case 'mahoujin-grand-magic':
      case 'transmutation-array':
      case 'gear5-toonworld': {
        dom.tickTimer = 0.65;
        const target = enemies[dom.tickCount % Math.max(1, enemies.length)];
        if (target) {
          ctx.skyPillars.push({
            id: ctx.nextId('domsky'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            x: Math.max(left + 30, Math.min(right - 30, target.x)),
            targetY: Math.max(top + 55, Math.min(bottom - 24, target.y)),
            width: 38,
            color: dom.color,
            secondaryColor: dom.secondaryColor,
            telegraphTimer: 0.22,
            activeTimer: 0.34,
            maxActive: 0.34,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            hasStruck: false,
          });
        }
        break;
      }

      case 'flying-raijin-blitz': {
        dom.tickTimer = 0.38;
        if (dom.markers && dom.markers.length > 0 && enemies[0]) {
          const target = enemies[dom.tickCount % enemies.length];
          const prevX = owner.x;
          const prevY = owner.y;
          const m = dom.markers[dom.tickCount % dom.markers.length];
          owner.afterimages.push({
            x: prevX,
            y: prevY,
            alpha: 0.9,
            color: dom.color,
            formIndex: owner.formIndex,
          });
          owner.x = Math.max(left + owner.radius + 4, Math.min(right - owner.radius - 4, m.x));
          owner.y = Math.max(top + owner.radius + 4, Math.min(bottom - owner.radius - 4, m.y));
          ctx.slashes.push({
            id: ctx.nextId('raijin'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            x1: prevX,
            y1: prevY,
            x2: target.x,
            y2: target.y,
            color: dom.color,
            secondaryColor: '#ffffff',
            coreColor: '#ffffff',
            width: 6.5,
            telegraphTimer: 0,
            activeTimer: 0.12,
            fadeTimer: 0.24,
            maxFade: 0.24,
            damage: ctx.getEffectiveDamage(owner, 6.4),
            hasStruck: false,
          });
        }
        break;
      }

      case 'shadow-monarch': {
        dom.tickTimer = 0.95;
        if (ctx.minions.length < 10) {
          const a = Math.random() * Math.PI * 2;
          ctx.minions.push({
            id: ctx.nextId('shdom'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'shadow',
            x: owner.x + Math.cos(a) * 40,
            y: owner.y + Math.sin(a) * 40,
            vx: Math.cos(a) * 320,
            vy: Math.sin(a) * 320,
            radius: 15,
            hp: 40,
            maxHp: 40,
            damage: ctx.getEffectiveDamage(owner, 5.5),
            life: 4.5,
            maxLife: 4.5,
            color: '#1e1b4b',
            accentColor: '#a855f7',
            hitCooldowns: {},
          });
        }
        break;
      }

      case 'undertale-badtime': {
        dom.tickTimer = 0.62;
        const target = enemies[0];
        if (target) {
          const a = Math.atan2(target.y - owner.y, target.x - owner.x);
          ctx.beams.push({
            id: ctx.nextId('gdom'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            originX: dom.tickCount % 2 === 0 ? left + 26 : right - 26,
            originY: target.y,
            angle: dom.tickCount % 2 === 0 ? 0 : Math.PI,
            width: 22,
            damagePerTick: ctx.getEffectiveDamage(owner, 3.6),
            color: '#38bdf8',
            coreColor: '#ffffff',
            life: 0.38,
            maxLife: 0.38,
            tickTimer: 0,
            powerLevel: 5,
            style: 'gaster',
          });
          void a;
        }
        break;
      }

      case 'quake-shatter':
      case 'rumbling-colossal':
      case 'high-noon-sun': {
        dom.tickTimer = 0.78;
        ctx.addScreenShake(7);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          span * 0.48,
          dom.color,
          6,
          dom.ownerCharId,
          dom.ownerSeries,
        );
        for (const e of enemies) {
          const dirA = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 6.2),
            Math.cos(dirA) * 440,
            Math.sin(dirA) * 440,
            { sourceKind: 'ability' },
          );
        }
        break;
      }

      case 'senbonzakura-bankai':
      case 'compass-needle':
      case 'chainsaw-hell':
      case 'stand-barrage-requiem':
      case 'lol-nexus-ultimate':
      case 'spirit-bomb-ui':
      case 'coffin-volcano':
      case 'frozen-glacier':
      case 'tsukuyomi':
      case 'birdcage-strings':
      case 'deep-dark-sculk':
      case 'petrify-charm': {
        dom.tickTimer = 0.62;
        const target = enemies[dom.tickCount % Math.max(1, enemies.length)];
        if (target) {
          const sigKind =
            dom.kind === 'senbonzakura-bankai'
              ? 'petal-sakura'
              : dom.kind === 'frozen-glacier'
                ? 'ice-crystal'
                : dom.kind === 'coffin-volcano'
                  ? 'magma-orb'
                  : dom.kind === 'deep-dark-sculk'
                    ? 'sonic-boom'
                    : dom.kind === 'stand-barrage-requiem'
                      ? 'stand-fist'
                      : (owner.character.skills.find((s) => s.projectileKind)?.projectileKind ??
                        'sword-wave');
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          ctx.projectiles.push({
            id: ctx.nextId('domp'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: sigKind,
            x: owner.x + Math.cos(ang) * (owner.radius + 16),
            y: owner.y + Math.sin(ang) * (owner.radius + 16),
            vx: Math.cos(ang) * 520,
            vy: Math.sin(ang) * 520,
            radius: 17 + form.powerLevel,
            damage: ctx.getEffectiveDamage(owner, 6.0),
            knockback: 260,
            color: dom.color,
            secondaryColor: dom.secondaryColor,
            angle: ang,
            life: 1.5,
            maxLife: 1.5,
            piercing: true,
            hitCooldowns: {},
            powerLevel: 5,
          });
        }
        break;
      }

      default:
        dom.tickTimer = 0.8;
        break;
    }
  }
}

/**
 * Unified healing multiplier accounting for Anti-Heal (0x), Wither Decay (0.4x), and Demon Slayer Mark (0.6x).
 */
export function getHealMultiplier(f: FighterState): number {
  if (f.antiHealTimer > 0) return 0;
  let mult = 1.0;
  if (f.karmaTimer > 0 && f.karmaKind === 'wither') {
    mult *= 0.4;
  }
  if (f.slayerMarkTimer > 0) {
    mult *= 0.6;
  }
  return mult;
}

/**
 * Applies character-authentic secondary status effects when a regular skill (S1-S5) lands!
 */
export function applyRegularSkillStatus(
  ctx: AbilityContext,
  attacker: FighterState,
  target: FighterState,
  skill: SkillDef,
): void {
  if (!target.alive || attacker.uid === target.uid) return;
  const domKind = resolveCharacterDomainKind(attacker.character);

  if (
    domKind === 'frozen-glacier' &&
    (skill.effect === 'heavy-orb' || skill.effect === 'shockwave-nova')
  ) {
    applyFighterStun(ctx, attacker, target, 0.75, 'frozen', 'FROST!');
  } else if (
    domKind === 'coffin-volcano' &&
    skill.effect !== 'heal-item' &&
    skill.effect !== 'shield-buff'
  ) {
    applyFighterBurn(target, attacker.uid, 2.4, ctx.getEffectiveDamage(attacker, 2.5));
  } else if (
    domKind === 'birdcage-strings' &&
    (skill.effect === 'gravity-pull' || skill.pattern === 'chain-hook-reel')
  ) {
    applyFighterStun(ctx, attacker, target, 0.72, 'chained', 'CHAINED!');
  } else if (
    domKind === 'deep-dark-sculk' &&
    (skill.effect === 'sonic-boom' || skill.effect === 'shockwave-nova')
  ) {
    target.silenceTimer = Math.max(target.silenceTimer, 1.8);
  } else if (domKind === 'petrify-charm' && skill.effect === 'beam-shot') {
    target.confusedTimer = Math.max(target.confusedTimer, 1.8);
  }
}
