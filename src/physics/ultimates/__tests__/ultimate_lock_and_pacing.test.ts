import { describe, expect, it } from 'vitest';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import { triggerCustomUltimate } from '../registry';

function makeDuel(a: string, b: string, baseHp = 1000): BattleEngine {
  const cfg: MatchConfig = {
    mode: '1v1',
    arenaSize: 'medium',
    baseHp,
    simSpeed: 1,
    suddenDeath: true,
    verticalMode: false,
    slots: [
      { slotId: 's_0', characterId: a, teamId: null },
      { slotId: 's_1', characterId: b, teamId: null },
    ],
  };
  return new BattleEngine(cfg);
}

describe('Ultimate Gauge Lock & 1-Minute Match Pacing', () => {
  it('never increases ultimateCharge while the fighter has an active Ultimate running', () => {
    const engine = makeDuel('sukuna', 'goku', 3000);
    const [sukuna, goku] = engine.fighters;
    sukuna.ultimateCharge = 0;
    sukuna.ultimateCooldown = 0;
    expect(triggerCustomUltimate(engine, sukuna)).toBe(true);
    expect(engine.activeUltimates.length).toBe(1);

    // Deal damage, take damage, and step 90 frames while Sukuna's Ultimate is active
    engine.applyDamage(sukuna, goku, 120, 0, 0, { sourceKind: 'ability' });
    engine.applyDamage(goku, sukuna, 120, 0, 0, { sourceKind: 'ability' });
    for (let i = 0; i < 90; i++) {
      engine.step(1 / 60);
    }

    expect(engine.activeUltimates.some((u) => u.ownerUid === sukuna.uid)).toBe(true);
    expect(sukuna.ultimateCharge).toBe(0);
  });

  it('paces default 1000 HP 1v1 duels to roughly ~1 minute on average', () => {
    const pairs: Array<[string, string]> = [
      ['luffy', 'goku'],
      ['naruto', 'ichigo'],
      ['gojo', 'sukuna'],
      ['saber', 'gilgamesh'],
    ];
    const durations: number[] = [];

    for (const [a, b] of pairs) {
      const engine = makeDuel(a, b, 1000);
      for (let i = 0; i < 60 * 140 && !engine.finished; i++) {
        engine.step(1 / 60);
      }
      durations.push(Math.round(engine.elapsed));
    }

    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    console.log('1000 HP 1v1 durations (sec):', durations, 'avg:', avg.toFixed(1));
    expect(avg).toBeGreaterThanOrEqual(45);
    expect(avg).toBeLessThanOrEqual(75);
  });
});
