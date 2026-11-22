import { describe, expect, it } from 'vitest';
import { getRimuruSkillsForForm, RIMURU_FORM_SKILLS } from '../../../characters/rimuruSkills';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';

function makeDuel(a: string, b: string, baseHp = 2000): BattleEngine {
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

describe('Rimuru Tempest Canon Evolution Conditions & Form-Upgrading Skill Kits', () => {
  it('provides 4 distinct canon TenSura skill kits that scale in power across every form', () => {
    expect(RIMURU_FORM_SKILLS.length).toBe(4);
    const avgPower = (idx: number) => {
      const list = getRimuruSkillsForForm(idx).filter((s) => typeof s.power === 'number');
      return list.reduce((sum, s) => sum + (s.power ?? 0), 0) / list.length;
    };

    expect(getRimuruSkillsForForm(0)[0].name).toBe('Water Blade');
    expect(getRimuruSkillsForForm(1)[1].name).toContain('Megiddo');
    expect(getRimuruSkillsForForm(2)[0].name).toContain('Storm Dragon');
    expect(getRimuruSkillsForForm(3)[1].name).toContain('Turn Null');

    expect(avgPower(1)).toBeGreaterThan(avgPower(0));
    expect(avgPower(2)).toBeGreaterThan(avgPower(1));
    expect(avgPower(3)).toBeGreaterThan(avgPower(2));
  });

  it('does NOT auto-evolve on time alone — evolves strictly via Harvest Festival Souls & Predator devouring', () => {
    const engine = makeDuel('rimuru', 'goku', 2000);
    const [rimuru, goku] = engine.fighters;
    rimuru.stunTimer = 20;
    goku.stunTimer = 20;

    // Wait 15 seconds with 0 souls -> Rimuru must remain in Slime form (0)
    for (let i = 0; i < 900; i++) {
      engine.step(1 / 60);
    }
    expect(rimuru.formIndex).toBe(0);

    // Unstun and feed Predator projectile devour + combat hits to hit 100 -> 200 -> 300 Souls!
    rimuru.stunTimer = 0;
    engine.projectiles.push({
      id: 'rimuru_snack',
      ownerUid: goku.uid,
      ownerCharId: goku.character.id,
      ownerSeries: goku.character.series,
      teamId: goku.teamId,
      kind: 'fireball',
      x: rimuru.x + 25,
      y: rimuru.y,
      vx: -100,
      vy: 0,
      radius: 10,
      damage: 20,
      knockback: 100,
      color: '#f97316',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    engine.step(1 / 60);
    expect(rimuru.rimuruSouls).toBeGreaterThanOrEqual(24);

    // Harvest 100 Souls -> Demon Lord
    rimuru.rimuruSouls = 105;
    engine.step(1 / 60);
    expect(rimuru.formIndex).toBe(1);

    // Harvest 200 Souls -> True Dragon
    rimuru.rimuruSouls = 205;
    engine.step(1 / 60);
    expect(rimuru.formIndex).toBe(2);

    // Harvest 300 Souls -> Ciel · Azathoth
    rimuru.rimuruSouls = 305;
    engine.step(1 / 60);
    expect(rimuru.formIndex).toBe(3);
  });
});
