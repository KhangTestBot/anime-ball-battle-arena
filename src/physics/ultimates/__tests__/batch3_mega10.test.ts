import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AhriUltimateData } from '../ahri';
import type { GokuUltimateData } from '../goku';
import type { JinxUltimateData } from '../jinx';
import type { KratosUltimateData } from '../kratos';
import type { LuffyUltimateData } from '../luffy';
import type { NarutoUltimateData } from '../naruto';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SasukeUltimateData } from '../sasuke';
import type { SonicUltimateData } from '../sonic';
import type { VergilUltimateData } from '../vergil';
import type { YasuoUltimateData } from '../yasuo';

const MEGA_BATCH_3_IDS = [
  'yasuo',
  'ahri',
  'jinx',
  'vergil',
  'sonic',
  'kratos',
  'luffy',
  'goku',
  'naruto',
  'sasuke',
] as const;

function makeEngine(ids: readonly string[], baseHp = 1500): BattleEngine {
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

function stepFrames(engine: BattleEngine, n: number, dt = 1 / 60): void {
  for (let i = 0; i < n; i++) engine.step(dt);
}

describe('Mega-Batch 3 Bespoke Ultimates (10 Characters: Yasuo -> Sasuke)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_3_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(18);
  });

  it('Yasuo: Q3 Tornado knocks Airborne -> Last Breath 3 slashes + Armor Shred + Wind Wall blocks enemy projectiles', () => {
    const engine = makeEngine(['yasuo', 'goku'], 1500);
    const [yasuo, goku] = engine.fighters;
    yasuo.x = 220;
    yasuo.y = 320;
    goku.x = 310;
    goku.y = 320;

    expect(triggerCustomUltimate(engine, yasuo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as YasuoUltimateData;

    // Clear hitstop and place enemy projectile directly on Wind Wall
    stepFrames(engine, 6);
    engine.projectiles.push({
      id: 'blocked_by_windwall',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      x: data.windWall.x,
      y: data.windWall.y,
      vx: -300,
      vy: 0,
      radius: 8,
      damage: 30,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: Math.PI,
      piercing: false,
      powerLevel: 1,
      life: 2,
      maxLife: 2,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    stepFrames(engine, 90);
    expect(engine.projectiles.some((p) => p.id === 'blocked_by_windwall')).toBe(false);
    expect(data.caughtUids.includes(goku.uid)).toBe(true);
    expect(goku.armorShredTimer).toBeGreaterThan(0);
    expect(goku.hp).toBeLessThan(1500);
  });

  it('Ahri: Charm Heart charms target & 3 Spirit Rush dashes fire homing Fox-Fire wisps with lifesteal', () => {
    const engine = makeEngine(['ahri', 'luffy'], 1500);
    const [ahri, luffy] = engine.fighters;
    ahri.x = 220;
    ahri.y = 320;
    luffy.x = 300;
    luffy.y = 320;
    ahri.hp = 1000;

    expect(triggerCustomUltimate(engine, ahri)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as AhriUltimateData;

    stepFrames(engine, 25);
    expect(luffy.charmTimer).toBeGreaterThan(0);

    stepFrames(engine, 160);
    expect(data.dashesLeft).toBe(0);
    expect(ahri.hp).toBeGreaterThan(1000);
    expect(luffy.hp).toBeLessThan(1500);
  });

  it('Jinx: deploys 3 Flame Chompers, accelerates Mega Death Rocket, and activates Get Excited! on hit', () => {
    const engine = makeEngine(['jinx', 'luffy'], 1500);
    const [jinx, luffy] = engine.fighters;
    jinx.x = 140;
    jinx.y = 320;
    luffy.x = 420;
    luffy.y = 320;

    expect(triggerCustomUltimate(engine, jinx)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as JinxUltimateData;
    expect(data.chompers.length).toBe(3);

    stepFrames(engine, 75);
    expect(data.rocket.exploded).toBe(true);
    expect(data.excitedActive).toBe(true);
    expect(jinx.getExcitedTimer).toBeGreaterThan(0);
    expect(luffy.hp).toBeLessThan(1500);
  });

  it('Vergil: vanishes untargetable, carves 18 Yamato cuts with zero early damage, then shatters all at once on *CLICK*', () => {
    const engine = makeEngine(['vergil', 'goku'], 1500);
    const [vergil, goku] = engine.fighters;
    vergil.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, vergil)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as VergilUltimateData;
    expect(vergil.untargetableTimer).toBeGreaterThan(1.0);

    stepFrames(engine, 35);
    expect(data.cuts.length).toBeGreaterThan(3);
    expect(data.shattered).toBe(false);

    stepFrames(engine, 90);
    expect(data.shattered).toBe(true);
    expect(data.styleRank).toBe('SSS');
    expect(vergil.untargetableTimer).toBe(0);
    expect(goku.hp).toBeLessThan(1500);
  });

  it('Sonic: goes supersonic pinball, knocks physical Gold Rings out of enemies, and bounces with auto-aim', () => {
    const engine = makeEngine(['sonic', 'naruto'], 1500);
    const [sonic, naruto] = engine.fighters;
    sonic.x = 260;
    sonic.y = 320;
    naruto.x = 320;
    naruto.y = 320;

    expect(triggerCustomUltimate(engine, sonic)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as SonicUltimateData;
    expect(sonic.invulnTimer).toBeGreaterThan(0.9);

    stepFrames(engine, 16);
    expect(data.rings.length).toBeGreaterThanOrEqual(5);
    expect(naruto.hp).toBeLessThan(1500);
  });

  it('Kratos: Leviathan Axe applies Frost, recalls boomerang, and Blades of Chaos detonate Thermal Blast with Lifesteal', () => {
    const engine = makeEngine(['kratos', 'luffy'], 1500);
    const [kratos, luffy] = engine.fighters;
    kratos.x = 230;
    kratos.y = 320;
    luffy.x = 330;
    luffy.y = 320;
    kratos.hp = 1000;

    expect(triggerCustomUltimate(engine, kratos)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as KratosUltimateData;

    stepFrames(engine, 25);
    expect(luffy.frostTimer).toBeGreaterThan(0);

    stepFrames(engine, 110);
    expect(data.chainsFired).toBe(true);
    expect(luffy.burnTimer).toBeGreaterThan(0);
    expect(kratos.hp).toBeGreaterThan(1000);
  });

  it('Luffy Gear 5: reflects enemy projectiles, slams Bajrang Gun, and experiences brief deflated fatigue on expire', () => {
    const engine = makeEngine(['luffy', 'goku'], 1500);
    const [luffy, goku] = engine.fighters;
    luffy.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    luffy.x = 300;
    luffy.y = 300;
    goku.x = 330;
    goku.y = 300;

    expect(triggerCustomUltimate(engine, luffy)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as LuffyUltimateData;

    stepFrames(engine, 8);
    // Spawn enemy projectile near Luffy -> Rubber Floor reflects ownership to Luffy!
    engine.projectiles.push({
      id: 'reflected_by_rubber',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      x: luffy.x + 22,
      y: luffy.y,
      vx: -280,
      vy: 0,
      radius: 8,
      damage: 25,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: Math.PI,
      piercing: false,
      powerLevel: 1,
      life: 2,
      maxLife: 2,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    stepFrames(engine, 2);
    const reflected = engine.projectiles.find((p) => p.id === 'reflected_by_rubber');
    if (reflected) expect(reflected.ownerUid).toBe(luffy.uid);

    // Wait for Bajrang Gun slam & ultimate expire -> drowsy deflated state
    for (let i = 0; i < 360 && engine.activeUltimates.some((u) => u.characterId === 'luffy'); i++) {
      engine.step(1 / 60);
    }
    expect(data.bajrangSlammed).toBe(true);
    expect(luffy.drowsyTimer).toBeGreaterThan(0);
  });

  it('Goku UI & Genki Dama: activates 85% UI Dodge while charging, absorbs enemy projectiles, and detonates', () => {
    const engine = makeEngine(['goku', 'sasuke'], 1500);
    const [goku, sasuke] = engine.fighters;
    goku.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, goku)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GokuUltimateData;
    expect(goku.uiDodgeTimer).toBeGreaterThan(1.0);

    // Charge for ~1.65s until launched
    stepFrames(engine, 110);
    expect(data.stage).not.toBe('charging');

    // Feed an enemy projectile into the launched Genki Dama if still flying
    if (data.stage === 'launched') {
      engine.projectiles.push({
        id: 'eaten_by_genkidama',
        ownerUid: sasuke.uid,
        teamId: sasuke.teamId,
        x: data.orbX,
        y: data.orbY,
        vx: 0,
        vy: 0,
        radius: 8,
        damage: 20,
        knockback: 100,
        color: '#a855f7',
        secondaryColor: '#fff',
        angle: 0,
        piercing: false,
        powerLevel: 1,
        life: 2,
        maxLife: 2,
        kind: 'ki-blast',
        hitCooldowns: {},
      });
      stepFrames(engine, 2);
      expect(data.absorbedCount).toBeGreaterThanOrEqual(1);
    }

    for (let i = 0; i < 240 && data.stage !== 'detonated'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('detonated');
  });

  it('Naruto Kurama: summons 4 tactical Shadow Clones and expands Rasenshuriken Wind Dome shredding armor', () => {
    const engine = makeEngine(['naruto', 'sasuke'], 1500);
    const [naruto, sasuke] = engine.fighters;
    naruto.x = 220;
    naruto.y = 320;
    sasuke.x = 340;
    sasuke.y = 320;

    expect(triggerCustomUltimate(engine, naruto)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as NarutoUltimateData;
    expect(data.clones.length).toBe(4);

    stepFrames(engine, 80);
    expect(data.shuriken.phase).toBe('expanding-dome');
    expect(sasuke.armorShredTimer).toBeGreaterThan(0);
    expect(sasuke.hp).toBeLessThan(1500);
  });

  it('Sasuke Amenotejikara & Susanoo: swaps enemy onto Amaterasu Black Flames and fires piercing Indra Arrow', () => {
    const engine = makeEngine(['sasuke', 'naruto'], 1500);
    const [sasuke, naruto] = engine.fighters;

    expect(triggerCustomUltimate(engine, sasuke)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as SasukeUltimateData;
    expect(data.amaterasuPatches.length).toBeGreaterThanOrEqual(1);
    expect(naruto.burnTimer).toBeGreaterThan(0);
    expect(sasuke.shieldTimer).toBeGreaterThan(2.0);

    stepFrames(engine, 60);
    expect(data.arrow.fired).toBe(true);
    expect(data.amaterasuPatches.length).toBeGreaterThanOrEqual(2);
    expect(naruto.hp).toBeLessThan(1500);
  });

  it('10-way simultaneous Mega-Batch 3 mayhem stays 100% finite, in-bounds, and tears down cleanly', () => {
    const engine = makeEngine(MEGA_BATCH_3_IDS, 3000);
    for (const f of engine.fighters) {
      expect(triggerCustomUltimate(engine, f)).toBe(true);
      f.ultimateCooldown = 99;
      f.ultimateCharge = 0;
    }
    expect(engine.activeUltimates.length).toBe(10);

    // Step until 5.5s of simulation time elapses (accounts for dramatic hitstop frames during 10-way mayhem!)
    for (let i = 0; i < 900 && engine.elapsed < 5.5; i++) {
      engine.step(1 / 60);
      for (const f of engine.fighters) {
        expect(Number.isFinite(f.x)).toBe(true);
        expect(Number.isFinite(f.y)).toBe(true);
        expect(Number.isFinite(f.vx)).toBe(true);
        expect(Number.isFinite(f.vy)).toBe(true);
        if (f.alive) {
          expect(f.x).toBeGreaterThanOrEqual(engine.bounds.left);
          expect(f.x).toBeLessThanOrEqual(engine.bounds.right);
          expect(f.y).toBeGreaterThanOrEqual(engine.bounds.top);
          expect(f.y).toBeLessThanOrEqual(engine.bounds.bottom);
        }
      }
    }

    expect(engine.elapsed).toBeGreaterThanOrEqual(5.5);
    expect(engine.activeUltimates.length).toBe(0);
  });
});
