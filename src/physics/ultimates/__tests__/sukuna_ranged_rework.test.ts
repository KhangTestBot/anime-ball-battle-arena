import { describe, expect, it } from 'vitest';
import { getCharacterById } from '../../../characters/roster';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';

function makeDuel(a: string, b: string, baseHp = 3000): BattleEngine {
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

describe('JJK Legends Rework — Sukuna Canon Dismantle Cuts & Gojo Always-On Infinity', () => {
  it('Sukuna has upgraded King of Curses stats, 8 canon JJK skills, and carves instant Dismantle slash lines', () => {
    const sukunaCfg = getCharacterById('sukuna');
    expect(sukunaCfg.baseStats.damage).toBeGreaterThanOrEqual(10);
    expect(sukunaCfg.skills.length).toBe(8);
    expect(sukunaCfg.skills.some((s) => s.name.includes('World-Cutting Slash'))).toBe(true);

    const engine = makeDuel('sukuna', 'goku', 3000);
    const [sukuna, goku] = engine.fighters;
    goku.stunTimer = 99;
    goku.x = engine.bounds.right - 60;
    goku.y = engine.bounds.top + 320;
    sukuna.x = engine.bounds.left + 80;
    sukuna.y = engine.bounds.top + 320;
    sukuna.abilityTimer = 99;

    let spawnedSlashLine = false;
    for (let i = 0; i < 100; i++) {
      engine.step(1 / 60);
      if (engine.slashes.some((s) => s.id.startsWith('sukuna_dismantle'))) {
        spawnedSlashLine = true;
      }
    }

    expect(spawnedSlashLine).toBe(true);
    expect(sukuna.damageDealt).toBeGreaterThan(0);
  });

  it('Gojo has 7 canon JJK skills, Always-On Infinity halting enemy projectiles, and Blue-infused basic attacks', () => {
    const gojoCfg = getCharacterById('gojo');
    expect(gojoCfg.skills.length).toBe(7);
    expect(gojoCfg.skills.some((s) => s.name.includes('Maximum Output: Blue'))).toBe(true);
    expect(gojoCfg.skills.some((s) => s.name.includes('Hollow Purple 200%'))).toBe(true);

    const engine = makeDuel('gojo', 'goku', 3000);
    const [gojo, goku] = engine.fighters;
    goku.stunTimer = 99;
    gojo.abilityTimer = 99;
    goku.x = gojo.x + 150;
    goku.y = gojo.y;

    // Spawn a normal enemy projectile heading right at Gojo -> Passive Infinity must halt it!
    engine.projectiles.push({
      id: 'test_inf_proj',
      ownerUid: goku.uid,
      ownerCharId: goku.character.id,
      ownerSeries: goku.character.series,
      teamId: goku.teamId,
      kind: 'fireball',
      x: gojo.x + gojo.radius + 35,
      y: gojo.y,
      vx: -300,
      vy: 0,
      radius: 10,
      damage: 40,
      knockback: 200,
      color: '#f97316',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    for (let i = 0; i < 90; i++) {
      engine.step(1 / 60);
    }

    expect(engine.projectiles.some((p) => p.id === 'test_inf_proj')).toBe(false);
    expect(gojo.damageDealt).toBeGreaterThan(0);
  });
});
