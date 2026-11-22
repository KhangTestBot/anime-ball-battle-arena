import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../characters/roster';
import type { MatchConfig } from '../../types/game';
import { BattleEngine } from '../engine';
import { getLolBuildForCharacter, isLolChampion } from '../lolShop';

function makeLolEngine(ids: string[], baseHp = 1500): BattleEngine {
  const cfg: MatchConfig = {
    mode: ids.length === 2 ? '1v1' : 'ffa',
    arenaSize: 'medium',
    baseHp,
    simSpeed: 1,
    suddenDeath: false,
    verticalMode: false,
    slots: ids.map((id, i) => ({ slotId: `s_${i}`, characterId: id, teamId: null })),
  };
  return new BattleEngine(cfg);
}

describe('League of Legends 6-Slot Item Shop & Gold Economy', () => {
  it('assigns a 6-item build path to every League of Legends champion in the roster', () => {
    const lolChamps = CHARACTER_ROSTER.filter((c) => isLolChampion(c));
    expect(lolChamps.length).toBeGreaterThanOrEqual(23);
    for (const champ of lolChamps) {
      const build = getLolBuildForCharacter(champ);
      expect(build.length).toBe(6);
    }
  });

  it('earns passive/combat gold and automatically purchases up to 6 items granting real combat stats & passives', () => {
    const engine = makeLolEngine(['yasuo', 'ahri', 'zed', 'darius'], 1800);
    const [yasuo, ahri, zed, darius] = engine.fighters;

    expect(yasuo.lolGold).toBe(550);
    expect(yasuo.lolItemsCount).toBe(0);

    // Step simulation for 4 seconds -> passive + combat gold triggers automatic item 1 purchase!
    for (let i = 0; i < 240; i++) {
      engine.step(1 / 60);
    }
    expect(yasuo.lolItemsCount).toBeGreaterThanOrEqual(1);
    expect(ahri.lolItemsCount).toBeGreaterThanOrEqual(1);
    expect(zed.lolItemsCount).toBeGreaterThanOrEqual(1);
    expect(darius.lolItemsCount).toBeGreaterThanOrEqual(1);

    // Grant gold to buy all 6 items on Yasuo (Crit build ends with Guardian Angel!)
    yasuo.lolGold = 10000;
    while (engine.buyNextLolItem(yasuo, false)) {
      // buy until full build
    }
    expect(yasuo.lolItemsCount).toBe(6);
    expect(yasuo.maxHp).toBeGreaterThan(1800);
    expect(yasuo.lolSpeedBonus).toBeGreaterThan(0.25);
    expect(yasuo.lolArmorBonus).toBeGreaterThan(0.15);
    expect(yasuo.lolLifestealBonus).toBeGreaterThan(0.2);
    expect(yasuo.lolCdrBonus).toBeGreaterThan(0.25);
    expect(yasuo.totemActive).toBe(true);
  });
});
