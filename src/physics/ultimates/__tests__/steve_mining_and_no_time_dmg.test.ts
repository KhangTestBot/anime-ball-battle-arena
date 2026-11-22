import { describe, expect, it } from 'vitest';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';

function makeDuel(a: string, b: string, baseHp = 5000): BattleEngine {
  const cfg: MatchConfig = {
    mode: '1v1',
    arenaSize: 'medium',
    baseHp,
    simSpeed: 1,
    suddenDeath: false,
    verticalMode: false,
    slots: [
      { slotId: 's_0', characterId: a, teamId: null },
      { slotId: 's_1', characterId: b, teamId: null },
    ],
  };
  return new BattleEngine(cfg);
}

describe('Steve Mining Progression & No Time-Based DMG% Scaling', () => {
  it('does not passively increase dmgBonusPct over time', () => {
    const engine = makeDuel('luffy', 'goku', 5000);
    const [a, b] = engine.fighters;
    // Keep both stunned so no hits or transforms occur, only time passes
    a.stunTimer = 10;
    b.stunTimer = 10;
    a.dmgBonusPct = 0;
    b.dmgBonusPct = 0;

    for (let i = 0; i < 300; i++) {
      engine.step(1 / 60);
    }

    expect(a.dmgBonusPct).toBe(0);
    expect(b.dmgBonusPct).toBe(0);
  });

  it('does not increase dmgBonusPct on dealing/taking damage and deals zero wall-impact damage', () => {
    const engine = makeDuel('luffy', 'goku', 5000);
    const [a, b] = engine.fighters;
    a.dmgBonusPct = 0;
    b.dmgBonusPct = 0;

    engine.applyDamage(a, b, 50, 0, 0, { sourceKind: 'collision' });
    expect(a.dmgBonusPct).toBe(0);
    expect(b.dmgBonusPct).toBe(0);

    // High-speed wall slam & sudden death wall touch must deal zero wall damage!
    const hpBeforeWall = b.hp;
    engine.suddenDeathActive = true;
    b.lastDamagedByUid = a.uid;
    b.x = engine.bounds.right - b.radius + 5;
    b.vx = 1200;
    b.vy = 0;
    a.stunTimer = 5;
    engine.step(1 / 60);
    expect(b.hp).toBe(hpBeforeWall);
  });

  it('Steve mines Iron -> Diamond -> Ancient Debris to reach Full Netherite before attacking', () => {
    const engine = makeDuel('steve', 'goku', 5000);
    const [steve, goku] = engine.fighters;
    // Keep Goku stunned in a corner so we can cleanly test Steve's mining progression & peaceful behavior
    goku.stunTimer = 999;
    goku.x = engine.bounds.right - 40;
    goku.y = engine.bounds.bottom - 40;

    expect(steve.formIndex).toBe(0);
    expect(steve.character.forms[0].name).toBe('Wood Gear');
    steve.hp = 2500; // Start at half HP to confirm upgrading armor does NOT heal Steve!

    // Step until Steve spawns & mines all 30 ores (10 Iron, 10 Diamond, 10 Ancient Debris)
    let reachedIron = false;
    let reachedDiamond = false;
    let reachedNetherite = false;
    let damagedBeforeNetherite = false;

    for (let i = 0; i < 14000 && !reachedNetherite; i++) {
      engine.step(1 / 60);
      if (steve.formIndex < 3 && steve.damageDealt > 0) {
        damagedBeforeNetherite = true;
      }
      if (steve.formIndex === 1) reachedIron = true;
      if (steve.formIndex === 2) reachedDiamond = true;
      if (steve.formIndex === 3) reachedNetherite = true;
    }

    expect(damagedBeforeNetherite).toBe(false);
    expect(reachedIron).toBe(true);
    expect(reachedDiamond).toBe(true);
    expect(reachedNetherite).toBe(true);
    expect(steve.hp).toBe(2500);
    expect(steve.character.forms[steve.formIndex].name).toBe('Full Netherite');

    // Once Full Netherite is crafted, Steve switches to combat mode and deals damage!
    goku.stunTimer = 0;
    for (let i = 0; i < 420 && steve.damageDealt === 0; i++) {
      engine.step(1 / 60);
    }
    expect(steve.damageDealt).toBeGreaterThan(0);
  });
});
