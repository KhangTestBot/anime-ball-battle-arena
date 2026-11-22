import { describe, expect, it } from 'vitest';
import { getCharacterById } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { MahoragaUltimateData } from '../mahoraga';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

function makeEngine(ids: readonly string[], baseHp = 2200): BattleEngine {
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

describe('Mahoraga (Eight-Handled Sword Divergent Sila Divine General)', () => {
  it('registers Mahoraga in roster, physics ULTIMATE_HANDLERS (>=109), and renderer ULTIMATE_RENDERERS', () => {
    const ch = getCharacterById('mahoraga');
    expect(ch.id).toBe('mahoraga');
    expect(ch.series).toBe('Jujutsu Kaisen');
    expect(ch.skills.length).toBe(5);
    expect(ch.forms.length).toBe(3);

    expect(hasCustomUltimate('mahoraga')).toBe(true);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(109);
    expect(ULTIMATE_RENDERERS.mahoraga).toBeDefined();
  });

  it('spins Dharma Wheel to absorb projectiles, increment adaptTurns & regen HP, then fires World-Cutting Slash cleaving obstacles & stripping shields', () => {
    const engine = makeEngine(['mahoraga', 'gojo'], 2200);
    const [mahoraga, gojo] = engine.fighters;

    mahoraga.x = 260;
    mahoraga.y = 350;
    mahoraga.hp = 1600;
    gojo.x = 460;
    gojo.y = 350;
    gojo.shieldTimer = 4.0;
    gojo.evadeTimer = 3.0;

    // Seed an enemy obstacle and enemy projectile right next to Mahoraga
    engine.obstacles.push({
      id: 'obs-gojo-wall',
      ownerUid: gojo.uid,
      ownerCharId: gojo.character.id,
      teamId: gojo.teamId,
      kind: 'obsidian-block',
      x: 360,
      y: 350,
      w: 50,
      h: 50,
      hp: 8,
      maxHp: 8,
      life: 10,
      maxLife: 10,
      color: '#38bdf8',
      secondaryColor: '#0284c7',
      blocksProjectiles: true,
      restitution: 1,
    });

    engine.projectiles.push({
      id: 'proj-gojo-red',
      ownerUid: gojo.uid,
      teamId: gojo.teamId,
      x: mahoraga.x + 28,
      y: mahoraga.y,
      vx: -120,
      vy: 0,
      radius: 9,
      damage: 45,
      knockback: 120,
      color: '#ef4444',
      secondaryColor: '#fca5a5',
      angle: Math.PI,
      life: 3,
      maxLife: 3,
      kind: 'sword-wave',
      piercing: false,
      homing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    const preUltHp = mahoraga.hp;
    const preGojoHp = gojo.hp;

    expect(triggerCustomUltimate(engine, mahoraga)).toBe(true);

    // Step briefly to process projectile absorption & adaptation turns
    for (let i = 0; i < 20; i++) {
      gojo.abilityTimer = 99;
      engine.step(1 / 60);
    }

    const active = engine.activeUltimates.find((u) => u.characterId === 'mahoraga');
    expect(active).toBeDefined();
    const data = active!.data as unknown as MahoragaUltimateData;
    expect(data.adaptTurns).toBeGreaterThanOrEqual(2);
    expect(mahoraga.hp).toBeGreaterThan(preUltHp);
    expect(mahoraga.unstoppableTimer).toBeGreaterThan(0);
    expect(engine.projectiles.some((p) => p.id === 'proj-gojo-red')).toBe(false);

    // Advance past 2.15s climax for WORLD-CUTTING SLASH
    let slashFired = false;
    for (let i = 0; i < 180; i++) {
      gojo.abilityTimer = 99;
      gojo.x = Math.min(engine.bounds.right - gojo.radius - 10, mahoraga.x + 150);
      gojo.y = mahoraga.y;
      if (engine.obstacles.length > 0) {
        engine.obstacles[0].x = mahoraga.x + 80;
        engine.obstacles[0].y = mahoraga.y;
      }
      engine.step(1 / 60);
      if (data.worldSlashFired) {
        slashFired = true;
        break;
      }
    }

    expect(slashFired).toBe(true);
    expect(engine.obstacles.length).toBe(0);
    expect(gojo.shieldTimer).toBe(0);
    expect(gojo.evadeTimer).toBe(0);
    expect(gojo.dodgeLockedTimer).toBeGreaterThan(0);
    expect(gojo.hp).toBeLessThan(preGojoHp - 80);

    // Let Ultimate finish and verify clean expiration + finite bounds
    for (let i = 0; i < 240; i++) {
      engine.step(1 / 60);
    }
    expect(engine.activeUltimates.some((u) => u.characterId === 'mahoraga')).toBe(false);
    for (const f of engine.fighters) {
      expect(Number.isFinite(f.x)).toBe(true);
      expect(Number.isFinite(f.y)).toBe(true);
      expect(f.x).toBeGreaterThanOrEqual(engine.bounds.left + f.radius - 0.5);
      expect(f.x).toBeLessThanOrEqual(engine.bounds.right - f.radius + 0.5);
    }
  });
});
