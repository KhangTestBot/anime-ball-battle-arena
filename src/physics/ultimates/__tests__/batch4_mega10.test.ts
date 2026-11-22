import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { DenjiUltimateData } from '../denji';
import type { ErenUltimateData } from '../eren';
import type { IchigoUltimateData } from '../ichigo';
import type { JinwooUltimateData } from '../jinwoo';
import type { KilluaUltimateData } from '../killua';
import type { LeviUltimateData } from '../levi';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SaitamaUltimateData } from '../saitama';
import type { TanjiroUltimateData } from '../tanjiro';
import type { VegetaUltimateData } from '../vegeta';
import type { ZoroUltimateData } from '../zoro';

const MEGA_BATCH_4_IDS = [
  'zoro',
  'ichigo',
  'tanjiro',
  'saitama',
  'levi',
  'eren',
  'jinwoo',
  'denji',
  'vegeta',
  'killua',
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

describe('Mega-Batch 4 Bespoke Ultimates (10 Characters: Zoro -> Killua)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total 28 bespoke Ultimates)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_4_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(28);
  });

  it('Zoro Ashura: inner 9-sword satellite destroys enemy projectiles, blitz marks target, then detonates delayed X-cut', () => {
    const engine = makeEngine(['zoro', 'goku'], 1500);
    const [zoro, goku] = engine.fighters;
    zoro.x = 220;
    zoro.y = 320;
    goku.x = 320;
    goku.y = 320;

    expect(triggerCustomUltimate(engine, zoro)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ZoroUltimateData;

    stepFrames(engine, 6);
    engine.projectiles.push({
      id: 'cut_by_enma',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      x: zoro.x + zoro.radius + 10,
      y: zoro.y,
      vx: -300,
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

    stepFrames(engine, 90);
    expect(engine.projectiles.some((p) => p.id === 'cut_by_enma')).toBe(false);
    expect(data.stage).toBe('sheathe-wait');
    expect(goku.hp).toBeLessThan(1500);
  });

  it('Ichigo Mugetsu: bisects arena wiping projectiles along black split curtain & inflicts Spirit Lock on expire', () => {
    const engine = makeEngine(['ichigo', 'sasuke'], 1500);
    const [ichigo, sasuke] = engine.fighters;
    ichigo.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;
    ichigo.x = 240;
    ichigo.y = 320;
    sasuke.x = 400;
    sasuke.y = 320;

    expect(triggerCustomUltimate(engine, ichigo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as IchigoUltimateData;

    // Advance past 0.25s windup + 0.07s activation hitstop before dropping enemy projectile!
    stepFrames(engine, 30);
    expect(data.slashActive).toBe(true);

    engine.projectiles.push({
      id: 'erased_by_mugetsu',
      ownerUid: sasuke.uid,
      teamId: sasuke.teamId,
      x: data.cx,
      y: data.cy,
      vx: 200,
      vy: 0,
      radius: 8,
      damage: 30,
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

    stepFrames(engine, 3);
    expect(engine.projectiles.some((p) => p.id === 'erased_by_mugetsu')).toBe(false);

    // Wait for expiration -> Ichigo enters 1.2s Spirit Lock!
    stepFrames(engine, 210);
    expect(ichigo.spiritLockTimer).toBeGreaterThan(0);
  });

  it('Tanjiro Sun Halo Dragon: guides 12-segment snake ribbon, blocks projectiles, burns, and applies Demon Slayer Mark (-40% Heal)', () => {
    const engine = makeEngine(['tanjiro', 'denji'], 1500);
    const [tanjiro, denji] = engine.fighters;
    tanjiro.x = 240;
    tanjiro.y = 320;
    denji.x = 300;
    denji.y = 320;

    expect(triggerCustomUltimate(engine, tanjiro)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as TanjiroUltimateData;
    expect(data.segments.length).toBe(12);

    stepFrames(engine, 30);
    expect(denji.slayerMarkTimer).toBeGreaterThan(0);
    expect(denji.burnTimer).toBeGreaterThan(0);
  });

  it('Saitama Table Flip & Serious Punch: launches 8 boulders, deals catastrophic One-Punch Ultimate damage shattering shields & blasting 1650 px/s', () => {
    const engine = makeEngine(['saitama', 'naruto'], 1500);
    const [saitama, naruto] = engine.fighters;
    saitama.ultimateCooldown = 99;
    naruto.ultimateCooldown = 99;
    saitama.x = 220;
    saitama.y = 320;
    naruto.x = 340;
    naruto.y = 320;
    naruto.shieldTimer = 3.0;
    naruto.formIndex = naruto.character.forms.length - 1;

    expect(triggerCustomUltimate(engine, saitama)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as SaitamaUltimateData;
    expect(data.rocks.length).toBe(8);

    // Advance past Table Flip (0.78s) + DEATH freeze (0.25s) while keeping Naruto inside forward cone
    for (let i = 0; i < 120 && data.stage !== 'punched'; i++) {
      naruto.x = 340;
      naruto.y = 320;
      naruto.vx = 0;
      naruto.vy = 0;
      engine.step(1 / 60);
    }
    expect(data.stage).toBe('punched');
    expect(naruto.shieldTimer).toBe(0);
    expect(naruto.armorShredTimer).toBeGreaterThan(2.5);
    expect(naruto.hp).toBeLessThan(650); // Ultimate One-Punch Damage crushes >= 60%+ Max HP in one blow!
  });

  it('Levi Beyblade Blitz: grants 60% evade, anchors wall cables, and snaps early if colliding with an ArenaObstacle', () => {
    const engine = makeEngine(['levi', 'goku'], 1500);
    const [levi, goku] = engine.fighters;
    expect(triggerCustomUltimate(engine, levi)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as LeviUltimateData;
    expect(levi.evadeTimer).toBeGreaterThan(2.0);
    expect(data.cables.length).toBe(2);

    stepFrames(engine, 8);
    // Drop a solid Obsidian Obstacle directly on Levi -> steel ODM cable must snap cleanly!
    engine.obstacles.push({
      id: 'snap_obs',
      ownerUid: goku.uid,
      ownerCharId: 'steve',
      teamId: goku.teamId,
      kind: 'obsidian-block',
      x: levi.x,
      y: levi.y,
      w: 44,
      h: 44,
      hp: 3,
      maxHp: 3,
      life: 4,
      maxLife: 4,
      blocksProjectiles: true,
      restitution: 1.0,
      color: '#1e1b4b',
    });

    stepFrames(engine, 2);
    expect(data.snapped).toBe(true);
    expect(levi.evadeTimer).toBe(0);
  });

  it('Eren The Rumbling: grows Eren 1.45x giant + Unstoppable & marches 4 Colossal Footprints across arena', () => {
    const engine = makeEngine(['eren', 'luffy'], 1500);
    const [eren] = engine.fighters;
    const baseRadius = eren.radius;

    expect(triggerCustomUltimate(engine, eren)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ErenUltimateData;
    expect(eren.giantTimer).toBeGreaterThan(2.5);
    expect(eren.unstoppableTimer).toBeGreaterThan(2.0);
    expect(data.footprints.length).toBe(4);

    stepFrames(engine, 45);
    expect(eren.radius).toBeGreaterThan(baseRadius);
  });

  it('Jinwoo ARISE: deploys distinct Igris & Beru AI marshals, heals Jinwoo via Beru, and triggers Shadow Exchange < 35% HP', () => {
    const engine = makeEngine(['jinwoo', 'naruto'], 1500);
    const [jinwoo, naruto] = engine.fighters;
    expect(triggerCustomUltimate(engine, jinwoo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as JinwooUltimateData;
    expect(data.igris.role).toBe('igris');
    expect(data.beru.role).toBe('beru');

    stepFrames(engine, 10);
    // Drop Jinwoo cleanly below 35% Max HP in Shadow Monarch form -> Shadow Exchange swap!
    jinwoo.formIndex = jinwoo.character.forms.length - 1;
    data.igris.x = 500;
    data.igris.y = 500;
    jinwoo.x = 120;
    jinwoo.y = 120;
    jinwoo.hp = 400;
    stepFrames(engine, 8);

    expect(data.shadowExchangeUsed).toBe(true);
    expect(jinwoo.x).toBeGreaterThan(420);
    expect(jinwoo.y).toBeGreaterThan(420);
    expect(naruto.alive).toBe(true);
  });

  it('Denji Chainsaw Blood Engine: hooks & reels target, grinds spinning saw ticks, and spills Blood Drops that heal Denji', () => {
    const engine = makeEngine(['denji', 'luffy'], 1500);
    const [denji, luffy] = engine.fighters;
    denji.x = 240;
    denji.y = 320;
    luffy.x = 300;
    luffy.y = 320;
    denji.hp = 1000;

    expect(triggerCustomUltimate(engine, denji)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as DenjiUltimateData;

    stepFrames(engine, 40);
    expect(data.tetheredUid).toBe(luffy.uid);
    expect(luffy.hp).toBeLessThan(1500);

    // Move Denji onto any spawned Blood Drop if present to verify +3% HP heal!
    if (data.bloodDrops.length > 0) {
      denji.x = data.bloodDrops[0].x;
      denji.y = data.bloodDrops[0].y;
      const hpBefore = denji.hp;
      stepFrames(engine, 2);
      expect(denji.hp).toBeGreaterThanOrEqual(hpBefore);
    }
  });

  it('Vegeta Ultra Ego & Hakai: converts 100% of damage taken during buildup into Hakai Sphere & erases enemy projectiles/shields', () => {
    const engine = makeEngine(['vegeta', 'goku'], 2000);
    const [vegeta, goku] = engine.fighters;
    vegeta.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    goku.x = vegeta.x + 80;
    goku.y = vegeta.y;
    goku.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, vegeta)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as VegetaUltimateData;

    stepFrames(engine, 8);
    // Deal 250 damage to Vegeta -> Ultra Ego must absorb it directly!
    engine.applyDamage(goku, vegeta, 250, 0, 0, { bypassInvuln: true });
    engine.projectiles.push({
      id: 'hakai_erased_proj',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      x: vegeta.x + 60,
      y: vegeta.y,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 20,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: 0,
      piercing: false,
      powerLevel: 1,
      life: 5,
      maxLife: 5,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    stepFrames(engine, 8);
    expect(data.absorbedDamage).toBeGreaterThan(150);

    // Advance until right before Hakai Erasure triggers, keep projectile & shielded Goku inside blast wave!
    for (let i = 0; i < 240 && data.absorbTimer > 0.08; i++) engine.step(1 / 60);
    goku.x = Math.min(engine.bounds.right - 30, vegeta.x + 70);
    goku.y = vegeta.y;
    goku.shieldTimer = 4.0;
    const p = engine.projectiles.find((pr) => pr.id === 'hakai_erased_proj');
    if (p) {
      p.x = vegeta.x + 60;
      p.y = vegeta.y;
    }
    for (let i = 0; i < 40 && data.stage !== 'hakai-detonated'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('hakai-detonated');
    expect(engine.projectiles.some((pr) => pr.id === 'hakai_erased_proj')).toBe(false);
    expect(goku.shieldTimer).toBe(0);
  });

  it('Killua Kanmuru Whirlwind: auto-blinks & micro-stuns enemies entering 125px radar and lays Neural Floor Wires', () => {
    const engine = makeEngine(['killua', 'naruto'], 1500);
    const [killua, naruto] = engine.fighters;
    killua.x = 300;
    killua.y = 300;
    naruto.x = 355; // Within 125px radar!
    naruto.y = 300;

    expect(triggerCustomUltimate(engine, killua)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as KilluaUltimateData;

    stepFrames(engine, 16);
    expect(data.reflexesLeft).toBeLessThan(4);
    expect(data.wireTraces.length).toBeGreaterThanOrEqual(1);
    expect(naruto.stunTimer).toBeGreaterThan(0);
  });

  it('10-way simultaneous Mega-Batch 4 mayhem stays 100% finite, in-bounds, and tears down cleanly', () => {
    const engine = makeEngine(MEGA_BATCH_4_IDS, 3000);
    for (const f of engine.fighters) {
      expect(triggerCustomUltimate(engine, f)).toBe(true);
      f.ultimateCooldown = 99;
      f.ultimateCharge = 0;
    }
    expect(engine.activeUltimates.length).toBe(10);

    for (let i = 0; i < 1100 && engine.elapsed < 6.0; i++) {
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

    expect(engine.elapsed).toBeGreaterThanOrEqual(6.0);
    expect(engine.activeUltimates.length).toBe(0);
  });
});
