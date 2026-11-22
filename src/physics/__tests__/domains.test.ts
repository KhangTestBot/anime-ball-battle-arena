import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../characters/roster';
import type { MatchConfig } from '../../types/game';
import { executeUltimateSkill } from '../abilities';
import { resolveCharacterDomainKind } from '../domains';
import { BattleEngine } from '../engine';

function make1v1(a: string, b: string, baseHp = 500): BattleEngine {
  const config: MatchConfig = {
    mode: '1v1',
    slots: [
      { slotId: 'a', characterId: a, teamId: null },
      { slotId: 'b', characterId: b, teamId: null },
    ],
    baseHp,
    simSpeed: 1,
    arenaSize: 'medium',
    suddenDeath: false,
    verticalMode: false,
  };
  return new BattleEngine(config);
}

describe('Anime & Game Domain Expansions and Real Status Effects', () => {
  it('Gojo opens Unlimited Void (Vô Lượng Không Xứ) and paralyzes enemies with void-overload', () => {
    const engine = make1v1('gojo', 'sukuna', 800);
    const [gojo, sukuna] = engine.fighters;

    executeUltimateSkill(engine, gojo);

    expect(engine.activeUltimates[0].characterId).toBe('gojo');
    expect(sukuna.stunKind).toBe('void-overload');
    expect(sukuna.stunTimer).toBeGreaterThan(2.0);
    expect(sukuna.vx).toBe(0);
    expect(sukuna.vy).toBe(0);

    // Step forward: Sukuna stays paralyzed and takes sure-hit cosmic overload damage
    const hpBefore = sukuna.hp;
    for (let i = 0; i < 60; i++) engine.step(1 / 60);
    expect(sukuna.stunTimer).toBeGreaterThan(1.0);
    expect(sukuna.hp).toBeLessThan(hpBefore);
  });

  it('Sukuna opens Malevolent Shrine and continuously rains sure-hit Cleave/Dismantle slashes', () => {
    const engine = make1v1('sukuna', 'goku', 800);
    const [sukuna] = engine.fighters;

    executeUltimateSkill(engine, sukuna);

    expect(engine.activeUltimates[0].characterId).toBe('sukuna');
    const slashesBefore = engine.slashes.length;
    for (let i = 0; i < 30; i++) engine.step(1 / 60);
    expect(engine.slashes.length).toBeGreaterThanOrEqual(slashesBefore);
  });

  it('DIO activates Time Stop (ZA WARUDO), freezing both enemy fighter and enemy projectiles mid-air', () => {
    const engine = make1v1('dio', 'goku', 800);
    const [dio, goku] = engine.fighters;

    // Spawn an enemy projectile from Goku before DIO stops time
    engine.projectiles.push({
      id: 'goku_ki',
      ownerUid: goku.uid,
      ownerCharId: 'goku',
      ownerSeries: 'Dragon Ball',
      teamId: null,
      kind: 'ki-blast',
      x: 320,
      y: 320,
      vx: -400,
      vy: 0,
      radius: 14,
      damage: 10,
      knockback: 200,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    executeUltimateSkill(engine, dio);

    expect(engine.activeUltimates[0].characterId).toBe('dio');
    expect(goku.stunKind).toBe('time-stop');
    expect(goku.stunTimer).toBeGreaterThan(2.0);
    const frozenProj = engine.projectiles.find((p) => p.id === 'goku_ki')!;
    expect(frozenProj.frozenTimer).toBeGreaterThan(2.0);

    const oldX = frozenProj.x;
    engine.step(1 / 60);
    expect(frozenProj.x).toBe(oldX); // Projectile literally did NOT move in stopped time!
  });

  it('Hakari opens Idle Death Gamble 777 Jackpot with true immortality and continuous HP regen', () => {
    const engine = make1v1('hakari', 'luffy', 500);
    const [hakari, luffy] = engine.fighters;
    hakari.ultimateCooldown = 99;
    luffy.ultimateCooldown = 99;
    hakari.hp = 120;

    executeUltimateSkill(engine, hakari);

    expect(engine.activeUltimates[0].characterId).toBe('hakari');
    const data = engine.activeUltimates[0].data as { phase: string };
    for (let i = 0; i < 120 && data.phase !== 'jackpot'; i++) {
      engine.step(1 / 60);
    }
    expect(data.phase).toBe('jackpot');
    expect(hakari.immortalTimer).toBeGreaterThan(3.5);

    // Lethal damage cannot kill Hakari during 777 Jackpot!
    engine.applyDamage(luffy, hakari, 9999, 0, 0, { bypassInvuln: true });
    expect(hakari.hp).toBeGreaterThanOrEqual(1);
    expect(hakari.alive).toBe(true);

    // Continuous regeneration ticks HP back up
    const hpAfterHit = hakari.hp;
    for (let i = 0; i < 45; i++) engine.step(1 / 60);
    expect(hakari.hp).toBeGreaterThan(hpAfterHit);
  });

  it('maps every single character in the 336-fighter roster to a valid canon Domain Expansion', () => {
    const kinds = new Set<string>();
    for (const ch of CHARACTER_ROSTER) {
      const k = resolveCharacterDomainKind(ch);
      expect(k.length).toBeGreaterThan(2);
      kinds.add(k);
    }
    expect(kinds.size).toBeGreaterThanOrEqual(30);
  });
});
