import { describe, expect, it } from 'vitest';
import { getCharacterById } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { MahoragaUltimateData } from '../mahoraga';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

function makeEngine(ids: string[], baseHp = 2200): BattleEngine {
  const cfg: MatchConfig = {
    mode: '1v1',
    arenaSize: 'medium',
    baseHp,
    simSpeed: 1,
    suddenDeath: false,
    verticalMode: false,
    slots: ids.map((id, i) => ({ slotId: `s_${i}`, characterId: id, teamId: null })),
  };
  return new BattleEngine(cfg);
}

describe('Mahoraga Passive Dharma Wheel Adaptation & Sword of Extermination Ultimate', () => {
  it('registers Mahoraga with bespoke handler & renderer', () => {
    const ch = getCharacterById('mahoraga');
    expect(ch.id).toBe('mahoraga');
    expect(hasCustomUltimate('mahoraga')).toBe(true);
    expect(ULTIMATE_HANDLERS.mahoraga).toBeDefined();
    expect(ULTIMATE_RENDERERS.mahoraga).toBeDefined();
  });

  it('passively turns the Dharma Wheel when taking damage, healing & permanently reducing incoming damage', () => {
    const engine = makeEngine(['mahoraga', 'goku'], 2000);
    const [mahoraga, goku] = engine.fighters;
    expect(mahoraga.mahoragaAdaptStacks).toBe(0);

    // Deal heavy hits to trigger passive wheel turns (7% of 2000 = 140 DMG per turn)
    engine.applyDamage(goku, mahoraga, 450, 0, 0, { sourceKind: 'ability' });
    expect(mahoraga.mahoragaAdaptStacks).toBeGreaterThanOrEqual(2);

    // Adapted Mahoraga takes noticeably less damage than unadapted (0 stacks)
    const hpBeforeAdapted = mahoraga.hp;
    engine.applyDamage(goku, mahoraga, 200, 0, 0, { sourceKind: 'ability' });
    const adaptedTaken = hpBeforeAdapted - mahoraga.hp;

    mahoraga.mahoragaAdaptStacks = 0;
    mahoraga.mahoragaAdaptDmgAcc = 0;
    const hpBeforeRaw = mahoraga.hp;
    engine.applyDamage(goku, mahoraga, 200, 0, 0, { sourceKind: 'ability' });
    const rawTaken = hpBeforeRaw - mahoraga.hp;

    expect(adaptedTaken).toBeLessThan(rawTaken);
  });

  it('Sword of Extermination Ultimate transforms into a Giant Titan, performs 3 leap-slams, and fires Cross-Pillar Obliteration', () => {
    const engine = makeEngine(['mahoraga', 'gojo'], 3000);
    const [mahoraga, gojo] = engine.fighters;
    mahoraga.ultimateCooldown = 99;
    gojo.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, mahoraga)).toBe(true);
    expect(mahoraga.giantTimer).toBeGreaterThan(0);
    expect(mahoraga.unstoppableTimer).toBeGreaterThan(0);

    const data = engine.activeUltimates[0].data as unknown as MahoragaUltimateData;
    for (let i = 0; i < 200 && !data.obliterationFired; i++) {
      engine.step(1 / 60);
    }

    expect(data.slamsDone).toBe(3);
    expect(data.obliterationFired).toBe(true);
    expect(gojo.hp).toBeLessThan(gojo.maxHp);
  });
});
