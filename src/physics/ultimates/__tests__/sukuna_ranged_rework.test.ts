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

describe('Sukuna King of Curses Rework — Ranged Dismantle Basic & Canon JJK Skills', () => {
  it('has upgraded King of Curses stats and 8 canon JJK skills', () => {
    const sukuna = getCharacterById('sukuna');
    expect(sukuna.baseStats.damage).toBeGreaterThanOrEqual(10);
    expect(sukuna.skills.length).toBe(8);
    expect(sukuna.skills.some((s) => s.name.includes('World-Cutting Slash'))).toBe(true);
    expect(sukuna.skills.some((s) => s.name.includes('Kamutoke'))).toBe(true);
    expect(sukuna.skills.some((s) => s.name.includes('Hollow Wicker Basket'))).toBe(true);
  });

  it('fires ranged Dismantle sword-wave basic attacks and deals damage from afar without melee collision', () => {
    const engine = makeDuel('sukuna', 'goku', 3000);
    const [sukuna, goku] = engine.fighters;
    goku.stunTimer = 99;
    goku.x = engine.bounds.right - 50;
    goku.y = engine.bounds.top + 320;
    sukuna.x = engine.bounds.left + 80;
    sukuna.y = engine.bounds.top + 320;
    sukuna.abilityTimer = 99; // isolate basic attack only

    let firedDismantle = false;
    for (let i = 0; i < 120; i++) {
      engine.step(1 / 60);
      if (engine.projectiles.some((p) => p.id.startsWith('sukuna_dismantle'))) {
        firedDismantle = true;
      }
    }

    expect(firedDismantle).toBe(true);
    expect(sukuna.damageDealt).toBeGreaterThan(0);
  });
});
