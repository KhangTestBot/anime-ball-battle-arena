import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { DariusUltimateData } from '../darius';
import type { GogetaUltimateData } from '../gogeta';
import type { GokuBlackUltimateData } from '../gokublack';
import type { JogoUltimateData } from '../jogo';
import type { MordekaiserUltimateData } from '../mordekaiser';
import type { NatsuUltimateData } from '../natsu';
import type { NeteroUltimateData } from '../netero';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { VegitoUltimateData } from '../vegito';
import type { YoneUltimateData } from '../yone';
import type { ZedUltimateData } from '../zed';

const MEGA_BATCH_13_IDS = [
  'zed',
  'darius',
  'mordekaiser',
  'yone',
  'gogeta',
  'vegito',
  'gokublack',
  'jogo',
  'netero',
  'natsu',
] as const;

function makeEngine(ids: readonly string[], baseHp = 1800): BattleEngine {
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

describe('Mega-Batch 13 Bespoke Ultimates (Zed, Darius, Mordekaiser, Yone, Gogeta, Vegito, Goku Black, Jogo, Netero, Natsu)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 119)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_13_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(119);
  });

  it('Zed Death Mark: spawns 2 Living Shadows, fires triple shurikens, and detonates Death Mark stripping shields', () => {
    const engine = makeEngine(['zed', 'yasuo'], 1800);
    const [zed, yasuo] = engine.fighters;
    yasuo.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, zed)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ZedUltimateData;
    expect(data.shadows.length).toBe(2);

    for (let i = 0; i < 160 && !data.markDetonated; i++) {
      yasuo.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.shurikenVolleys).toBeGreaterThanOrEqual(2);
    expect(data.markDetonated).toBe(true);
    expect(yasuo.shieldTimer).toBe(0);
  });

  it('Darius Noxian Guillotine: spins Decimate to bleed & heal, then dunks stripping shields', () => {
    const engine = makeEngine(['darius', 'garen'], 1800);
    const [darius, garen] = engine.fighters;
    darius.hp = 1200;
    garen.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, darius)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as DariusUltimateData;

    for (let i = 0; i < 150 && !data.dunked; i++) {
      garen.abilityTimer = 99;
      garen.x = Math.min(engine.bounds.right - 50, darius.x + 80);
      garen.y = darius.y;
      engine.step(1 / 60);
    }
    expect(data.decimated).toBe(true);
    expect(data.dunked).toBe(true);
    expect(garen.shieldTimer).toBe(0);
    expect(garen.burnTimer).toBeGreaterThan(0);
  });

  it('Mordekaiser Realm of Death: opens spectral realm, steals stats, and lands 3 Nightfall slams', () => {
    const engine = makeEngine(['mordekaiser', 'aatrox'], 2000);
    const [morde, aatrox] = engine.fighters;
    expect(triggerCustomUltimate(engine, morde)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MordekaiserUltimateData;
    expect(aatrox.armorShredTimer).toBeGreaterThan(2);
    expect(aatrox.frostTimer).toBeGreaterThan(2);

    for (let i = 0; i < 220 && data.slamsDone < 3; i++) {
      aatrox.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.slamsDone).toBe(3);
  });

  it('Yone Fate Sealed: drags enemies in corridor then snaps back to anchor detonating Soul Unbound', () => {
    const engine = makeEngine(['yone', 'yasuo'], 1800);
    const [yone, yasuo] = engine.fighters;
    yasuo.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, yone)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as YoneUltimateData;

    for (let i = 0; i < 180 && !data.soulSnapped; i++) {
      yasuo.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.fateSealedFired).toBe(true);
    expect(data.soulSnapped).toBe(true);
    expect(yasuo.shieldTimer).toBe(0);
  });

  it('Gogeta Stardust Breaker: erases enemy projectiles & fires Full-Force Kamehameha', () => {
    const engine = makeEngine(['gogeta', 'broly'], 2000);
    const [gogeta, broly] = engine.fighters;
    broly.shieldTimer = 4.0;
    engine.projectiles.push({
      id: 'broly_orb',
      ownerUid: broly.uid,
      teamId: broly.teamId,
      kind: 'ki-blast',
      x: gogeta.x + 90,
      y: gogeta.y,
      vx: -80,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 80,
      color: '#22c55e',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 4,
      maxLife: 4,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    expect(triggerCustomUltimate(engine, gogeta)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GogetaUltimateData;

    for (let i = 0; i < 160 && !data.beamFired; i++) {
      broly.abilityTimer = 99;
      broly.x = Math.min(engine.bounds.right - 50, gogeta.x + 120);
      broly.y = gogeta.y;
      engine.step(1 / 60);
    }
    expect(data.stardustDetonated).toBe(true);
    expect(data.beamFired).toBe(true);
    expect(engine.projectiles.some((p) => p.id === 'broly_orb')).toBe(false);
    expect(broly.shieldTimer).toBe(0);
  });

  it('Vegito Spirit Excalibur & Final Kamehameha: pins foes, locks dodge & fires Final Kamehameha', () => {
    const engine = makeEngine(['vegito', 'buu'], 2000);
    const [vegito, buu] = engine.fighters;
    buu.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, vegito)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as VegitoUltimateData;

    for (let i = 0; i < 160 && !data.beamFired; i++) {
      buu.abilityTimer = 99;
      buu.x = Math.min(engine.bounds.right - 50, vegito.x + 120);
      buu.y = vegito.y;
      engine.step(1 / 60);
    }
    expect(data.swordPinned).toBe(true);
    expect(data.beamFired).toBe(true);
    expect(buu.dodgeLockedTimer).toBeGreaterThan(0);
    expect(buu.shieldTimer).toBe(0);
  });

  it('Goku Black Scythe Rift: spawns 4 waves of Rosé scythes & collapses rift shredding armor', () => {
    const engine = makeEngine(['gokublack', 'trunks'], 2000);
    const [gb, trunks] = engine.fighters;
    expect(triggerCustomUltimate(engine, gb)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GokuBlackUltimateData;

    for (let i = 0; i < 200 && !data.scytheDetonated; i++) {
      trunks.abilityTimer = 99;
      trunks.x = data.riftX + 40;
      trunks.y = data.riftY;
      engine.step(1 / 60);
    }
    expect(data.cloneVolleys).toBe(4);
    expect(data.scytheDetonated).toBe(true);
    expect(trunks.armorShredTimer).toBeGreaterThan(0);
  });

  it('Jogo Coffin of the Iron Mountain: scorches foes & drops physical Maximum: Meteor obstacle', () => {
    const engine = makeEngine(['jogo', 'sukuna'], 2000);
    const [jogo, sukuna] = engine.fighters;
    expect(triggerCustomUltimate(engine, jogo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as JogoUltimateData;

    for (let i = 0; i < 160 && !data.meteorImpacted; i++) {
      sukuna.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.meteorImpacted).toBe(true);
    expect(engine.obstacles.some((o) => o.id === data.meteorObsId)).toBe(true);
    expect(sukuna.burnTimer).toBeGreaterThan(0);
  });

  it('Netero 100-Type Guanyin: lands 5 palm strikes then unleashes ZERO HAND locking dodge', () => {
    const engine = makeEngine(['netero', 'meruem'], 2200);
    const [netero, meruem] = engine.fighters;
    meruem.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, netero)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as NeteroUltimateData;

    for (let i = 0; i < 190 && !data.zeroHandFired; i++) {
      meruem.abilityTimer = 99;
      meruem.x = Math.min(engine.bounds.right - 50, netero.x + 110);
      meruem.y = netero.y;
      engine.step(1 / 60);
    }
    expect(data.palmsStruck).toBe(5);
    expect(data.zeroHandFired).toBe(true);
    expect(meruem.shieldTimer).toBe(0);
    expect(meruem.dodgeLockedTimer).toBeGreaterThan(0);
  });

  it('Natsu Fire Dragon King Demolition Fist: eats incoming projectiles for +DMG/HP then detonates Fist', () => {
    const engine = makeEngine(['natsu', 'gray'], 2000);
    const [natsu, gray] = engine.fighters;
    natsu.hp = 1400;
    gray.shieldTimer = 4.0;
    engine.projectiles.push({
      id: 'gray_ice',
      ownerUid: gray.uid,
      teamId: gray.teamId,
      kind: 'ice-crystal',
      x: natsu.x + 35,
      y: natsu.y,
      vx: -60,
      vy: 0,
      radius: 9,
      damage: 10,
      knockback: 60,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 4,
      maxLife: 4,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    expect(triggerCustomUltimate(engine, natsu)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as NatsuUltimateData;

    for (let i = 0; i < 150 && !data.fistDetonated; i++) {
      gray.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.flamesEaten).toBeGreaterThanOrEqual(1);
    expect(data.fistDetonated).toBe(true);
    expect(gray.shieldTimer).toBe(0);
    expect(gray.burnTimer).toBeGreaterThan(0);
  });

  it('10-way simultaneous Batch 13 FFA keeps all coordinates finite inside arena bounds with clean expiration', () => {
    const engine = makeEngine(MEGA_BATCH_13_IDS, 3000);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(10);

    for (let i = 0; i < 540; i++) {
      engine.step(1 / 60);
    }

    expect(engine.activeUltimates.length).toBe(0);
    for (const f of engine.fighters) {
      expect(Number.isFinite(f.x)).toBe(true);
      expect(Number.isFinite(f.y)).toBe(true);
      expect(f.x).toBeGreaterThanOrEqual(engine.bounds.left + f.radius - 0.5);
      expect(f.x).toBeLessThanOrEqual(engine.bounds.right - f.radius + 0.5);
    }
  });
});
