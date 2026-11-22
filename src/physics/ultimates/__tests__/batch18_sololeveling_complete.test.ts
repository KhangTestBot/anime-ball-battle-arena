import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AntaresUltimateData } from '../antares';
import type { AshbornUltimateData } from '../ashborn';
import type { BeruUltimateData } from '../beru';
import type { ChaHaeInUltimateData } from '../cha_haein';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ThomasAndreUltimateData } from '../thomas_andre';

const SOLO_LEVELING_BATCH_18_IDS = [
  'igris',
  'beru',
  'bellion',
  'tusk_sl',
  'iron_sl',
  'cha_haein',
  'thomas_andre',
  'liu_zhigang',
  'go_gunhee',
  'baek_yunho',
  'choi_jongin',
  'antares',
  'ashborn',
] as const;

function makeEngine(ids: readonly string[], baseHp = 2500): BattleEngine {
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

describe('Batch 18 — Solo Leveling Complete 14/14 Bespoke Ultimates', () => {
  it('completes 100% of Solo Leveling characters (14/14) with distinct handlers & renderers (total >= 182)', () => {
    const slRoster = CHARACTER_ROSTER.filter((c) => c.series === 'Solo Leveling');
    expect(slRoster.length).toBe(14);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of slRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(14);
    expect(renderers.size).toBe(14);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(182);
  });

  it('Antares vs Ashborn: Breath of Destruction & ARISE Shadow Revive survive fatal KO', () => {
    const engine = makeEngine(['antares', 'ashborn'], 3000);
    const [antares, ashborn] = engine.fighters;
    expect(triggerCustomUltimate(engine, antares)).toBe(true);
    expect(triggerCustomUltimate(engine, ashborn)).toBe(true);
    expect(ashborn.totemActive).toBe(true);

    const antData = engine.activeUltimates[0].data as unknown as AntaresUltimateData;
    const ashData = engine.activeUltimates[1].data as unknown as AshbornUltimateData;

    // Ashborn's ARISE Shadow Revive intercepts a fatal KO!
    engine.applyDamage(antares, ashborn, 99999, 0, 0, { bypassInvuln: true });
    expect(ashborn.alive).toBe(true);
    expect(ashborn.totemActive).toBe(false);

    antares.ultimateCharge = 0;
    antares.ultimateCooldown = 99;
    ashborn.ultimateCharge = 0;
    ashborn.ultimateCooldown = 99;
    ashborn.hp = ashborn.maxHp;

    for (let i = 0; i < 200 && (!antData.breathFired || !ashData.domainFired); i++) {
      engine.step(1 / 60);
    }
    expect(antData.wavesDone).toBe(3);
    expect(antData.breathFired).toBe(true);
    expect(ashData.legionWaves).toBe(3);
    expect(ashData.domainFired).toBe(true);
  });

  it('Beru, Cha Hae-In & Thomas Andre execute full blink/dance/capture sequences cleanly', () => {
    const engine = makeEngine(['beru', 'cha_haein', 'thomas_andre'], 3000);
    const [beru, cha, thomas] = engine.fighters;
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    const bData = engine.activeUltimates[0].data as unknown as BeruUltimateData;
    const cData = engine.activeUltimates[1].data as unknown as ChaHaeInUltimateData;
    const tData = engine.activeUltimates[2].data as unknown as ThomasAndreUltimateData;

    for (
      let i = 0;
      i < 200 && (!bData.rendFired || !cData.finisherFired || !tData.smashFired);
      i++
    ) {
      engine.step(1 / 60);
    }
    expect(bData.blinksDone).toBe(4);
    expect(bData.rendFired).toBe(true);
    expect(cData.dancesDone).toBe(5);
    expect(cData.finisherFired).toBe(true);
    expect(tData.capturesDone).toBe(3);
    expect(tData.smashFired).toBe(true);
    expect(beru.alive && cha.alive && thomas.alive).toBe(true);
  });

  it('13-way Solo Leveling Shadow Legion & National Hunters FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(SOLO_LEVELING_BATCH_18_IDS, 4500);
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
