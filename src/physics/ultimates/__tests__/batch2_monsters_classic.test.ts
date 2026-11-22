import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { CreeperUltimateData } from '../creeper';
import type { PikachuUltimateData } from '../pikachu';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SansUltimateData } from '../sans';
import type { WitherUltimateData } from '../wither';

function createTestEngine(charIds: string[], baseHp = 1200): BattleEngine {
  const cfg: MatchConfig = {
    mode: charIds.length === 2 ? '1v1' : 'ffa',
    arenaSize: 'medium',
    baseHp,
    simSpeed: 1,
    suddenDeath: false,
    verticalMode: false,
    slots: charIds.map((id, i) => ({ slotId: `s_${i}`, characterId: id, teamId: null })),
  };
  return new BattleEngine(cfg);
}

function stepFrames(engine: BattleEngine, frames: number, dt = 1 / 60): void {
  for (let i = 0; i < frames; i++) {
    engine.step(dt);
  }
}

describe('Batch 2 Bespoke Ultimates (Wither, Creeper, Sans, Pikachu)', () => {
  it('registers isolated physics handlers and Canvas 2D renderers for all 4 Batch 2 characters', () => {
    const ids = ['wither', 'creeper', 'sans', 'pikachu'];
    const handlers = new Set();
    const renderers = new Set();

    for (const id of ids) {
      expect(hasCustomUltimate(id)).toBe(true);
      const h = ULTIMATE_HANDLERS[id];
      const r = ULTIMATE_RENDERERS[id];
      expect(h).toBeDefined();
      expect(r).toBeDefined();
      handlers.add(h);
      renderers.add(r);
    }

    expect(handlers.size).toBe(4);
    expect(renderers.size).toBe(4);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(8);
  });

  it('Wither Storm: activates Wither Armor that blocks ranged projectiles, pulls in Tractor Beam cone, and applies Wither Decay', () => {
    const engine = createTestEngine(['wither', 'goku'], 1200);
    const wither = engine.fighters[0];
    const goku = engine.fighters[1];
    wither.x = 320;
    wither.y = 320;
    wither.facingAngle = 0;

    expect(triggerCustomUltimate(engine, wither)).toBe(true);
    const ult = engine.activeUltimates.find((u) => u.characterId === 'wither')!;
    const data = ult.data as unknown as WitherUltimateData;
    expect(data.witherArmorTimer).toBeGreaterThan(2.5);
    expect(data.voxels.length).toBe(18);

    // Clear cast hitstop
    stepFrames(engine, 8);

    // Spawn an enemy projectile right next to Wither -> Wither Armor must intercept & delete it
    engine.projectiles.push({
      id: 'enemy_proj_1',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      x: wither.x + wither.radius + 4,
      y: wither.y,
      vx: -300,
      vy: 0,
      radius: 8,
      damage: 40,
      knockback: 200,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      piercing: false,
      powerLevel: 1,
      life: 2.0,
      maxLife: 2.0,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    // Place Goku directly inside Tractor Beam cone #0
    const ang = data.beamAngle;
    goku.x = wither.x + Math.cos(ang) * 140;
    goku.y = wither.y + Math.sin(ang) * 140;
    goku.vx = 0;
    goku.vy = 0;
    data.decayTickCd = 0.01;

    stepFrames(engine, 2);

    expect(engine.projectiles.some((p) => p.id === 'enemy_proj_1')).toBe(false);
    expect(goku.karmaKind).toBe('wither');
    expect(goku.karmaTimer).toBeGreaterThan(0);

    // Verify Wither Decay ticks DoT damage even through invuln!
    goku.invulnTimer = 2.0;
    const hpBeforeDecay = goku.hp;
    stepFrames(engine, 24);
    expect(goku.hp).toBeLessThan(hpBeforeDecay);
  });

  it('Creeper: consumes 12% current HP safely (never self-KO), detonates 3-beat Super-Fuse, and creates Blast Craters', () => {
    const engine = createTestEngine(['creeper', 'luffy'], 1000);
    const creeper = engine.fighters[0];
    const luffy = engine.fighters[1];
    creeper.x = 300;
    creeper.y = 300;
    luffy.x = 340;
    luffy.y = 300;

    // Test normal 12% HP self-cost
    const hpBefore = creeper.hp;
    expect(triggerCustomUltimate(engine, creeper)).toBe(true);
    expect(creeper.hp).toBe(hpBefore - Math.floor(hpBefore * 0.12));

    const ult = engine.activeUltimates.find((u) => u.characterId === 'creeper')!;
    const data = ult.data as unknown as CreeperUltimateData;
    expect(data.superchargedMult).toBe(1.5);

    // Advance through all 3 countdown beats (~2.4s)
    stepFrames(engine, 160);
    expect(data.blastsDone).toBe(3);
    expect(data.craters.length).toBeGreaterThanOrEqual(2);
    expect(luffy.hp).toBeLessThan(1000);

    // Verify safety: casting at 1 HP NEVER self-KOs!
    const lowHpEngine = createTestEngine(['creeper', 'luffy'], 1000);
    const lowCreeper = lowHpEngine.fighters[0];
    lowCreeper.hp = 1;
    expect(triggerCustomUltimate(lowHpEngine, lowCreeper)).toBe(true);
    expect(lowCreeper.hp).toBe(1);
    expect(lowCreeper.alive).toBe(true);
  });

  it('Sans: enforces Blue Bone (still=SAFE, moving=KR) & Orange Bone (fast=SAFE, slow=KR) rules, spawns 6 Gaster Blasters, and becomes Drowsy on expire', () => {
    const engine = createTestEngine(['sans', 'goku'], 1500);
    const sans = engine.fighters[0];
    const goku = engine.fighters[1];
    sans.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, sans)).toBe(true);
    const ult = engine.activeUltimates.find((u) => u.characterId === 'sans')!;
    const data = ult.data as unknown as SansUltimateData;

    // Clear cast hitstop
    stepFrames(engine, 8);

    // 1. Test Blue Bone Wall: standing still (speed <= 180) -> SAFE!
    data.boneWalls.push({
      id: 'test_blue_safe',
      colorKind: 'blue',
      x: 300,
      vx: 0,
      width: 24,
      hitUids: {},
    });
    goku.x = 300;
    goku.y = 320;
    goku.vx = 10;
    goku.vy = 10;
    goku.karmaTimer = 0;
    goku.karmaKind = null;
    const hpBeforeBlueSafe = goku.hp;
    stepFrames(engine, 1);
    expect(goku.hp).toBe(hpBeforeBlueSafe);
    expect(goku.karmaKind).toBeNull();

    // 2. Test Blue Bone Wall: moving fast (speed > 180) -> HURTS + KR!
    data.boneWalls.push({
      id: 'test_blue_hit',
      colorKind: 'blue',
      x: 360,
      vx: 0,
      width: 24,
      hitUids: {},
    });
    goku.x = 360;
    goku.y = 320;
    goku.vx = 360;
    goku.vy = 0;
    const hpBeforeBlueHit = goku.hp;
    stepFrames(engine, 1);
    expect(goku.hp).toBeLessThan(hpBeforeBlueHit);
    expect(goku.karmaKind).toBe('kr');

    // 3. Test Orange Bone Wall: moving fast (speed >= 260) -> SAFE!
    data.boneWalls.push({
      id: 'test_orange_safe',
      colorKind: 'orange',
      x: 420,
      vx: 0,
      width: 24,
      hitUids: {},
    });
    goku.x = 420;
    goku.y = 320;
    goku.vx = 380;
    goku.vy = 0;
    const hpBeforeOrangeSafe = goku.hp;
    stepFrames(engine, 1);
    expect(goku.hp).toBe(hpBeforeOrangeSafe);

    // 4. Advance until climax -> 6 Gaster Blasters spawn, then onExpire sets Sans drowsyTimer!
    let sawSixBlasters = false;
    for (let i = 0; i < 320; i++) {
      engine.step(1 / 60);
      if (data.blasters.length === 6) {
        sawSixBlasters = true;
      }
      if (!engine.activeUltimates.some((u) => u.characterId === 'sans')) {
        break;
      }
    }
    expect(sawSixBlasters).toBe(true);
    expect(sans.drowsyTimer).toBeGreaterThan(0);
  });

  it('Pikachu Z-Move: slows enemies in Electroweb, fires 7 curved rainbow bolts, and inflicts Pokémon [PAR] paralysis on >= 2 hits', () => {
    const engine = createTestEngine(['pikachu', 'naruto'], 1500);
    const pikachu = engine.fighters[0];
    const naruto = engine.fighters[1];
    pikachu.ultimateCooldown = 99;
    naruto.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, pikachu)).toBe(true);
    const ult = engine.activeUltimates.find((u) => u.characterId === 'pikachu')!;
    const data = ult.data as unknown as PikachuUltimateData;

    // Clear hitstop
    stepFrames(engine, 8);

    // Place Naruto inside Electroweb center -> speed should be dampened
    naruto.x = data.webX;
    naruto.y = data.webY;
    naruto.vx = 400;
    naruto.vy = 0;
    stepFrames(engine, 5);
    expect(Math.hypot(naruto.vx, naruto.vy)).toBeLessThan(390);

    // Step through the 7 sequential curved rainbow bolts (~3.0s)
    stepFrames(engine, 195);
    expect(data.boltsFired).toBe(7);
    expect(data.hitsByUid[naruto.uid] ?? 0).toBeGreaterThanOrEqual(2);
    expect(naruto.paralyzeTimer).toBeGreaterThan(0);

    // Verify [PAR] triggers periodic micro-stun within 1.1s
    let sawParStun = false;
    for (let i = 0; i < 70; i++) {
      engine.step(1 / 60);
      if (naruto.stunTimer > 0) {
        sawParStun = true;
        break;
      }
    }
    expect(sawParStun).toBe(true);
  });

  it('4-way Batch 2 simultaneous overlap (Wither + Creeper + Sans + Pikachu) stays finite, in-bounds, and tears down cleanly', () => {
    const engine = createTestEngine(['wither', 'creeper', 'sans', 'pikachu'], 2500);
    for (const f of engine.fighters) {
      expect(triggerCustomUltimate(engine, f)).toBe(true);
      // Prevent automatic second-wave re-cast so we verify single-wave clean teardown
      f.ultimateCooldown = 99;
      f.ultimateCharge = 0;
    }

    expect(engine.activeUltimates.length).toBe(4);

    // Step 400 frames (~6.67s, beyond the longest Batch 2 duration of 5.0s)
    for (let i = 0; i < 400; i++) {
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

    expect(engine.activeUltimates.length).toBe(0);
  });
});
