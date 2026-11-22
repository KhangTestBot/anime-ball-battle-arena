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

  it('Steve can fight at any armor tier (even Wood Gear) and mines corner ores when free without healing', () => {
    // 1. Verify Steve fights and deals damage right away in Wood Gear (formIndex === 0)
    const fightEngine = makeDuel('steve', 'goku', 5000);
    const [steveFight, gokuFight] = fightEngine.fighters;
    expect(steveFight.formIndex).toBe(0);
    gokuFight.stunTimer = 999;
    steveFight.x = 300;
    steveFight.y = 300;
    gokuFight.x = 360;
    gokuFight.y = 300;
    for (let i = 0; i < 180 && steveFight.damageDealt === 0; i++) {
      fightEngine.step(1 / 60);
    }
    expect(steveFight.formIndex).toBe(0);
    expect(steveFight.damageDealt).toBeGreaterThan(0);

    // 2. Verify when free, Steve spawns ores in the corners and mines 5 per tier to Full Netherite without healing
    const engine = makeDuel('steve', 'goku', 5000);
    const [steve, goku] = engine.fighters;
    goku.stunTimer = 999;
    goku.x = engine.bounds.right - 40;
    goku.y = engine.bounds.bottom - 40;
    // Keep Steve's abilities on cooldown during pure corner-mining check so Ultimate doesn't end the match early
    steve.ultimateCooldown = 999;
    steve.abilityTimer = 999;

    expect(steve.formIndex).toBe(0);
    expect(steve.character.forms[0].name).toBe('Wood Gear');
    steve.hp = 2500; // Start at half HP to confirm upgrading armor does NOT heal Steve!

    let reachedIron = false;
    let reachedDiamond = false;
    let reachedNetherite = false;
    let sawCornerOre = false;

    for (let i = 0; i < 8000 && !reachedNetherite; i++) {
      steve.abilityTimer = 999;
      engine.step(1 / 60);
      const ore = engine.obstacles.find(
        (o) =>
          o.ownerUid === steve.uid &&
          (o.kind === 'iron-ore' || o.kind === 'diamond-ore' || o.kind === 'ancient-debris'),
      );
      if (ore) {
        const nearLeftOrRight =
          ore.x - engine.bounds.left <= 95 || engine.bounds.right - ore.x <= 95;
        const nearTopOrBottom =
          ore.y - engine.bounds.top <= 95 || engine.bounds.bottom - ore.y <= 95;
        expect(nearLeftOrRight && nearTopOrBottom).toBe(true);
        sawCornerOre = true;
      }
      if (steve.formIndex === 1) reachedIron = true;
      if (steve.formIndex === 2) reachedDiamond = true;
      if (steve.formIndex === 3) reachedNetherite = true;
    }

    expect(sawCornerOre).toBe(true);
    expect(reachedIron).toBe(true);
    expect(reachedDiamond).toBe(true);
    expect(reachedNetherite).toBe(true);
    expect(steve.hp).toBe(2500);
    expect(steve.character.forms[steve.formIndex].name).toBe('Full Netherite');
  });
});
