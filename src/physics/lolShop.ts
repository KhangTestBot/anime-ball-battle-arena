import type { CharacterConfig, FighterState } from '../types/game';

export interface LolShopItemDef {
  id: string;
  name: string;
  shortName: string;
  cost: number;
  color: string;
  borderColor: string;
  dmgPct: number;
  speedBonus: number;
  armorBonus: number;
  lifestealBonus: number;
  cdrBonus: number;
  hpBonusPct: number;
  shieldSec?: number;
  grantGuardianAngel?: boolean;
  grantZhonya?: boolean;
}

const CRIT_SLAYER_BUILD: readonly LolShopItemDef[] = [
  {
    id: 'berserkers',
    name: "Berserker's Greaves",
    shortName: 'Greaves',
    cost: 900,
    color: '#eab308',
    borderColor: '#fef08a',
    dmgPct: 14,
    speedBonus: 0.09,
    armorBonus: 0.02,
    lifestealBonus: 0,
    cdrBonus: 0.08,
    hpBonusPct: 0.05,
  },
  {
    id: 'kraken_pd',
    name: 'Kraken Slayer',
    shortName: 'Kraken',
    cost: 1050,
    color: '#38bdf8',
    borderColor: '#bae6fd',
    dmgPct: 22,
    speedBonus: 0.08,
    armorBonus: 0.03,
    lifestealBonus: 0,
    cdrBonus: 0.08,
    hpBonusPct: 0.06,
  },
  {
    id: 'infinity_edge',
    name: 'Infinity Edge',
    shortName: 'IE',
    cost: 1150,
    color: '#f59e0b',
    borderColor: '#fde047',
    dmgPct: 32,
    speedBonus: 0.05,
    armorBonus: 0.03,
    lifestealBonus: 0.04,
    cdrBonus: 0.06,
    hpBonusPct: 0.06,
  },
  {
    id: 'bloodthirster',
    name: 'Bloodthirster',
    shortName: 'BT',
    cost: 1200,
    color: '#dc2626',
    borderColor: '#fca5a5',
    dmgPct: 24,
    speedBonus: 0.04,
    armorBonus: 0.04,
    lifestealBonus: 0.14,
    cdrBonus: 0.05,
    hpBonusPct: 0.1,
    shieldSec: 2.2,
  },
  {
    id: 'shieldbow',
    name: 'Immortal Shieldbow',
    shortName: 'Shieldbow',
    cost: 1250,
    color: '#ec4899',
    borderColor: '#fbcfe8',
    dmgPct: 22,
    speedBonus: 0.05,
    armorBonus: 0.06,
    lifestealBonus: 0.08,
    cdrBonus: 0.06,
    hpBonusPct: 0.12,
    shieldSec: 3.0,
  },
  {
    id: 'guardian_angel',
    name: 'Guardian Angel',
    shortName: 'GA',
    cost: 1350,
    color: '#facc15',
    borderColor: '#ffffff',
    dmgPct: 26,
    speedBonus: 0.05,
    armorBonus: 0.08,
    lifestealBonus: 0.05,
    cdrBonus: 0.08,
    hpBonusPct: 0.14,
    grantGuardianAngel: true,
  },
];

const AP_MAGE_BUILD: readonly LolShopItemDef[] = [
  {
    id: 'sorc_shoes',
    name: "Sorcerer's Shoes",
    shortName: 'Sorcs',
    cost: 900,
    color: '#6366f1',
    borderColor: '#c7d2fe',
    dmgPct: 16,
    speedBonus: 0.09,
    armorBonus: 0.02,
    lifestealBonus: 0,
    cdrBonus: 0.08,
    hpBonusPct: 0.05,
  },
  {
    id: 'luden_storm',
    name: "Luden's Companion",
    shortName: 'Ludens',
    cost: 1050,
    color: '#a855f7',
    borderColor: '#e9d5ff',
    dmgPct: 24,
    speedBonus: 0.05,
    armorBonus: 0.03,
    lifestealBonus: 0,
    cdrBonus: 0.1,
    hpBonusPct: 0.06,
  },
  {
    id: 'shadowflame',
    name: 'Shadowflame',
    shortName: 'Shadow',
    cost: 1150,
    color: '#ec4899',
    borderColor: '#f9a8d4',
    dmgPct: 28,
    speedBonus: 0.05,
    armorBonus: 0.03,
    lifestealBonus: 0.05,
    cdrBonus: 0.06,
    hpBonusPct: 0.08,
  },
  {
    id: 'zhonya',
    name: "Zhonya's Hourglass",
    shortName: 'Zhonya',
    cost: 1200,
    color: '#facc15',
    borderColor: '#fef9c3',
    dmgPct: 22,
    speedBonus: 0.04,
    armorBonus: 0.09,
    lifestealBonus: 0,
    cdrBonus: 0.08,
    hpBonusPct: 0.1,
    shieldSec: 2.6,
    grantZhonya: true,
  },
  {
    id: 'void_staff',
    name: 'Void Staff',
    shortName: 'Void',
    cost: 1250,
    color: '#8b5cf6',
    borderColor: '#ddd6fe',
    dmgPct: 30,
    speedBonus: 0.05,
    armorBonus: 0.04,
    lifestealBonus: 0.06,
    cdrBonus: 0.08,
    hpBonusPct: 0.08,
  },
  {
    id: 'rabadon',
    name: "Rabadon's Deathcap",
    shortName: 'Rabadon',
    cost: 1350,
    color: '#dc2626',
    borderColor: '#fde047',
    dmgPct: 44,
    speedBonus: 0.06,
    armorBonus: 0.05,
    lifestealBonus: 0.08,
    cdrBonus: 0.1,
    hpBonusPct: 0.14,
    shieldSec: 2.5,
  },
];

const AD_ASSASSIN_BUILD: readonly LolShopItemDef[] = [
  {
    id: 'ionian_boots',
    name: 'Ionian Boots',
    shortName: 'Ionian',
    cost: 900,
    color: '#ef4444',
    borderColor: '#fecaca',
    dmgPct: 14,
    speedBonus: 0.1,
    armorBonus: 0.02,
    lifestealBonus: 0,
    cdrBonus: 0.1,
    hpBonusPct: 0.05,
  },
  {
    id: 'youmuu',
    name: "Youmuu's Ghostblade",
    shortName: 'Youmuu',
    cost: 1050,
    color: '#f43f5e',
    borderColor: '#fda4af',
    dmgPct: 24,
    speedBonus: 0.09,
    armorBonus: 0.03,
    lifestealBonus: 0.04,
    cdrBonus: 0.08,
    hpBonusPct: 0.06,
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    shortName: 'Eclipse',
    cost: 1150,
    color: '#fb923c',
    borderColor: '#fed7aa',
    dmgPct: 26,
    speedBonus: 0.06,
    armorBonus: 0.04,
    lifestealBonus: 0.1,
    cdrBonus: 0.08,
    hpBonusPct: 0.08,
    shieldSec: 2.2,
  },
  {
    id: 'edge_of_night',
    name: 'Edge of Night',
    shortName: 'EoN',
    cost: 1200,
    color: '#4f46e5',
    borderColor: '#a5b4fc',
    dmgPct: 22,
    speedBonus: 0.05,
    armorBonus: 0.06,
    lifestealBonus: 0.05,
    cdrBonus: 0.06,
    hpBonusPct: 0.12,
    shieldSec: 2.8,
  },
  {
    id: 'serylda',
    name: "Serylda's Grudge",
    shortName: 'Serylda',
    cost: 1250,
    color: '#06b6d4',
    borderColor: '#a5f3fc',
    dmgPct: 30,
    speedBonus: 0.05,
    armorBonus: 0.04,
    lifestealBonus: 0.06,
    cdrBonus: 0.1,
    hpBonusPct: 0.08,
  },
  {
    id: 'guardian_angel_asn',
    name: 'Guardian Angel',
    shortName: 'GA',
    cost: 1350,
    color: '#facc15',
    borderColor: '#ffffff',
    dmgPct: 32,
    speedBonus: 0.06,
    armorBonus: 0.08,
    lifestealBonus: 0.08,
    cdrBonus: 0.08,
    hpBonusPct: 0.14,
    grantGuardianAngel: true,
  },
];

const BRUISER_JUGGERNAUT_BUILD: readonly LolShopItemDef[] = [
  {
    id: 'steelcaps',
    name: 'Plated Steelcaps',
    shortName: 'Steelcaps',
    cost: 900,
    color: '#78716c',
    borderColor: '#d6d3d1',
    dmgPct: 12,
    speedBonus: 0.08,
    armorBonus: 0.06,
    lifestealBonus: 0,
    cdrBonus: 0.06,
    hpBonusPct: 0.08,
  },
  {
    id: 'black_cleaver',
    name: 'Black Cleaver',
    shortName: 'Cleaver',
    cost: 1050,
    color: '#b91c1c',
    borderColor: '#fca5a5',
    dmgPct: 22,
    speedBonus: 0.06,
    armorBonus: 0.05,
    lifestealBonus: 0.04,
    cdrBonus: 0.09,
    hpBonusPct: 0.12,
  },
  {
    id: 'sterak',
    name: "Sterak's Gage",
    shortName: 'Sterak',
    cost: 1150,
    color: '#ef4444',
    borderColor: '#fde047',
    dmgPct: 24,
    speedBonus: 0.04,
    armorBonus: 0.06,
    lifestealBonus: 0.06,
    cdrBonus: 0.06,
    hpBonusPct: 0.14,
    shieldSec: 3.0,
  },
  {
    id: 'deaths_dance',
    name: "Death's Dance",
    shortName: 'DD',
    cost: 1200,
    color: '#ea580c',
    borderColor: '#fdba74',
    dmgPct: 26,
    speedBonus: 0.05,
    armorBonus: 0.08,
    lifestealBonus: 0.12,
    cdrBonus: 0.08,
    hpBonusPct: 0.1,
  },
  {
    id: 'spirit_visage',
    name: 'Spirit Visage',
    shortName: 'Visage',
    cost: 1250,
    color: '#10b981',
    borderColor: '#6ee7b7',
    dmgPct: 18,
    speedBonus: 0.04,
    armorBonus: 0.08,
    lifestealBonus: 0.1,
    cdrBonus: 0.08,
    hpBonusPct: 0.16,
    shieldSec: 2.4,
  },
  {
    id: 'heartsteel',
    name: 'Heartsteel',
    shortName: 'Heartsteel',
    cost: 1350,
    color: '#facc15',
    borderColor: '#ef4444',
    dmgPct: 32,
    speedBonus: 0.05,
    armorBonus: 0.1,
    lifestealBonus: 0.08,
    cdrBonus: 0.08,
    hpBonusPct: 0.22,
    grantGuardianAngel: true,
  },
];

const AP_CHAMPS = new Set(['ahri', 'lux', 'akali', 'ekko', 'katarina', 'sylas', 'teemo']);
const ASN_CHAMPS = new Set(['zed', 'kayn', 'viego']);
const CRIT_CHAMPS = new Set(['yasuo', 'yone', 'jinx', 'ezreal']);

export function isLolChampion(char: CharacterConfig): boolean {
  return char.series === 'League of Legends';
}

export function getLolBuildForCharacter(char: CharacterConfig): readonly LolShopItemDef[] {
  if (!isLolChampion(char)) return [];
  if (CRIT_CHAMPS.has(char.id)) return CRIT_SLAYER_BUILD;
  if (AP_CHAMPS.has(char.id)) return AP_MAGE_BUILD;
  if (ASN_CHAMPS.has(char.id)) return AD_ASSASSIN_BUILD;
  return BRUISER_JUGGERNAUT_BUILD;
}

export function getPurchasedLolItems(f: FighterState): LolShopItemDef[] {
  const build = getLolBuildForCharacter(f.character);
  if (build.length === 0) return [];
  return build.slice(0, Math.min(build.length, f.lolItemsCount));
}

export function getNextLolItem(f: FighterState): LolShopItemDef | null {
  const build = getLolBuildForCharacter(f.character);
  if (build.length === 0 || f.lolItemsCount >= build.length) return null;
  return build[f.lolItemsCount] ?? null;
}
