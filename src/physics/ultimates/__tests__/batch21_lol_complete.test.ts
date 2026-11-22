import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { EkkoUltimateData } from '../ekko';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SettUltimateData } from '../sett';
import type { ThreshUltimateData } from '../thresh';

const LOL_BATCH_21_IDS = [
  'lux',
  'ezreal',
  'akali',
  'leesin',
  'teemo',
  'thresh',
  'ekko',
  'katarina',
  'riven',
  'sett',
  'sylas',
  'kayn',
  'volibear',
] as const;

function makeEngine(ids: readonly string[], baseHp = 2600): BattleEngine {
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

describe('Batch 21 — League of Legends Complete 23/23 & ALL Game Series 100%!', () => {
  it('completes 100% of League of Legends (23/23) & 100% of ALL Game characters (total >= 220)', () => {
    const lolRoster = CHARACTER_ROSTER.filter((c) => c.series === 'League of Legends');
    expect(lolRoster.length).toBe(23);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of lolRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(23);
    expect(renderers.size).toBe(23);

    // Every single Game character in the entire roster now has a bespoke Ultimate!
    const allGameChars = CHARACTER_ROSTER.filter((c) => c.category === 'game');
    for (const gc of allGameChars) {
      expect(hasCustomUltimate(gc.id)).toBe(true);
    }
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(220);
  });

  it('Ekko Chronobreak survives fatal KO & Thresh Death Sentence hooks enemies', () => {
    const engine = makeEngine(['ekko', 'thresh'], 3000);
    const [ekko, thresh] = engine.fighters;
    expect(triggerCustomUltimate(engine, ekko)).toBe(true);
    expect(triggerCustomUltimate(engine, thresh)).toBe(true);
    expect(ekko.totemActive).toBe(true);

    const eData = engine.activeUltimates[0].data as unknown as EkkoUltimateData;
    const tData = engine.activeUltimates[1].data as unknown as ThreshUltimateData;
    expect(tData.hookedCount).toBe(1);

    // Ekko's Z-Drive Rewind intercepts fatal KO!
    engine.applyDamage(thresh, ekko, 99999, 0, 0, { bypassInvuln: true });
    expect(ekko.alive).toBe(true);
    expect(ekko.totemActive).toBe(false);

    ekko.ultimateCharge = 0;
    ekko.ultimateCooldown = 99;
    thresh.ultimateCharge = 0;
    thresh.ultimateCooldown = 99;
    ekko.hp = ekko.maxHp;

    for (let i = 0; i < 200 && (!eData.chronobreakFired || !tData.boxShattered); i++) {
      engine.step(1 / 60);
    }
    expect(eData.windersDone).toBe(3);
    expect(eData.chronobreakFired).toBe(true);
    expect(tData.boxShattered).toBe(true);
  });

  it('Sett Max Grit scales with missing HP and triggers The Show Stopper', () => {
    const engine = makeEngine(['sett', 'riven'], 3000);
    const [sett, riven] = engine.fighters;
    sett.hp = Math.round(sett.maxHp * 0.2);
    sett.ultimateCooldown = 99;
    riven.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, sett)).toBe(true);
    const sData = engine.activeUltimates[0].data as unknown as SettUltimateData;
    expect(sData.gritBonusPct).toBeGreaterThanOrEqual(30);

    for (let i = 0; i < 200 && !sData.showstopperFired; i++) {
      engine.step(1 / 60);
    }
    expect(sData.punchesDone).toBe(3);
    expect(sData.showstopperFired).toBe(true);
  });

  it('13-way Summoners Rift Teamfight FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(LOL_BATCH_21_IDS, 4500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(13);

    for (let i = 0; i < 560; i++) {
      engine.step(1 / 60);
    }

    expect(engine.activeUltimates.length).toBe(0);
    for (const f of engine.fighters) {
      expect(Number.isFinite(f.x)).toBe(true);
      expect(Number.isFinite(f.y)).toBe(true);
      expect(f.x).toBeGreaterThanOrEqual(engine.bounds.left + f.radius - 0.5);
      expect(f.x).toBeLessThanOrEqual(engine.bounds.right - f.radius + 0.5);
    }
  });
});
