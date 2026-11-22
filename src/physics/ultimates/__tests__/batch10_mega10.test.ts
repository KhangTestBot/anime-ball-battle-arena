import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AkazaUltimateData } from '../akaza';
import type { BeerusUltimateData } from '../beerus';
import type { BrolyUltimateData } from '../broly';
import type { DoflamingoUltimateData } from '../doflamingo';
import type { FriezaUltimateData } from '../frieza';
import type { GiornoUltimateData } from '../giorno';
import type { GohanUltimateData } from '../gohan';
import type { JotaroUltimateData } from '../jotaro';
import type { KatakuriUltimateData } from '../katakuri';
import type { KokushiboUltimateData } from '../kokushibo';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const MEGA_BATCH_10_IDS = [
  'jotaro',
  'giorno',
  'frieza',
  'broly',
  'gohan',
  'beerus',
  'doflamingo',
  'katakuri',
  'akaza',
  'kokushibo',
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

describe('Mega-Batch 10 Bespoke Ultimates (Jotaro, Giorno, Frieza, Broly, Gohan, Beerus, Doflamingo, Katakuri, Akaza, Kokushibo)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 88)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_10_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(88);
  });

  it('Jotaro Star Platinum: The World: stops time, delivers 6 ORA punches, reverses close bullets, and shreds armor on resume', () => {
    const engine = makeEngine(['jotaro', 'dio'], 1500);
    const [jotaro, dio] = engine.fighters;
    jotaro.ultimateCooldown = 99;
    dio.ultimateCooldown = 99;
    dio.x = jotaro.x + 120;
    dio.y = jotaro.y;

    engine.projectiles.push({
      id: 'dio_knife_test',
      ownerUid: dio.uid,
      teamId: null,
      kind: 'kunai-knife',
      x: jotaro.x + 50,
      y: jotaro.y,
      vx: -300,
      vy: 0,
      radius: 8,
      damage: 4,
      knockback: 50,
      color: '#facc15',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, jotaro)).toBe(true);
    expect(dio.stunKind).toBe('time-stop');
    const data = engine.activeUltimates[0].data as unknown as JotaroUltimateData;

    for (let i = 0; i < 160 && data.stage === 'time-stopped'; i++) engine.step(1 / 60);
    expect(data.punchesLeft).toBe(0);
    expect(data.stage).toBe('resumed');
    expect(dio.armorShredTimer).toBeGreaterThan(0);
    expect(engine.projectiles[0].ownerUid).toBe(jotaro.uid);
    expect(engine.projectiles[0].vx).toBeGreaterThan(0);
  });

  it('Giorno Gold Experience Requiem: snapshots enemy coordinates, rewinds Return to Zero, strips shields, and locks healing', () => {
    const engine = makeEngine(['giorno', 'diavolo'], 1500);
    const [giorno, diavolo] = engine.fighters;
    giorno.ultimateCooldown = 99;
    diavolo.ultimateCooldown = 99;
    giorno.hp = giorno.maxHp * 0.65;
    const hpBeforeCast = giorno.hp;
    const origX = diavolo.x;
    const origY = diavolo.y;

    expect(triggerCustomUltimate(engine, giorno)).toBe(true);
    expect(giorno.hp).toBeGreaterThan(hpBeforeCast);
    const data = engine.activeUltimates[0].data as unknown as GiornoUltimateData;

    diavolo.x = origX + 120;
    diavolo.y = origY + 40;
    diavolo.shieldTimer = 4.0;

    for (let i = 0; i < 140 && !data.returnedToZero; i++) {
      diavolo.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.returnedToZero).toBe(true);
    expect(Math.hypot(diavolo.x - origX, diavolo.y - origY)).toBeLessThan(80);
    expect(diavolo.shieldTimer).toBe(0);
    expect(diavolo.antiHealTimer).toBeGreaterThan(0);
  });

  it('Frieza Twin Death Saucers & Supernova: fires homing boomerang discs and smashes obstacles on Supernova drop', () => {
    const engine = makeEngine(['frieza', 'goku'], 1500);
    const [frieza, goku] = engine.fighters;
    frieza.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    engine.obstacles.push({
      id: 'frieza_obs',
      ownerUid: goku.uid,
      ownerCharId: 'goku',
      teamId: null,
      kind: 'obsidian-block',
      x: goku.x,
      y: goku.y,
      w: 36,
      h: 36,
      hp: 80,
      maxHp: 80,
      life: 5,
      maxLife: 5,
      blocksProjectiles: true,
      restitution: 1,
      color: '#475569',
    });

    expect(triggerCustomUltimate(engine, frieza)).toBe(true);
    expect(engine.projectiles.filter((p) => p.kind === 'chakram-ring').length).toBe(2);
    const data = engine.activeUltimates[0].data as unknown as FriezaUltimateData;

    for (let i = 0; i < 160 && !data.detonated; i++) {
      if (engine.obstacles[0]) {
        engine.obstacles[0].x = goku.x;
        engine.obstacles[0].y = goku.y;
      }
      engine.step(1 / 60);
    }
    expect(data.detonated).toBe(true);
    expect(engine.obstacles.length).toBe(0);
  });

  it('Broly Omega Blaster & Rage Evolution: gains Missing-HP Rage, slams enemies, and swallows bullets to grow Omega Blaster', () => {
    const engine = makeEngine(['broly', 'vegeta'], 1500);
    const [broly, vegeta] = engine.fighters;
    broly.ultimateCooldown = 99;
    vegeta.ultimateCooldown = 99;
    broly.hp = broly.maxHp * 0.4;
    vegeta.x = broly.x + 220;
    vegeta.y = broly.y;

    expect(triggerCustomUltimate(engine, broly)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as BrolyUltimateData;

    for (let i = 0; i < 240 && data.stage === 'rage-slam'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('omega-blaster');

    // Feed a bullet right into Broly's Omega Blaster orb
    engine.projectiles.push({
      id: 'feed_omega',
      ownerUid: vegeta.uid,
      teamId: null,
      kind: 'ki-blast',
      x: data.omegaX,
      y: data.omegaY,
      vx: 0,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 50,
      color: '#a855f7',
      secondaryColor: '#ffffff',
      angle: 0,
      life: 1.5,
      maxLife: 1.5,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    engine.step(1 / 60);
    expect(data.absorbedCount).toBeGreaterThanOrEqual(1);
    expect(data.omegaRadius).toBeGreaterThan(24);
  });

  it('Gohan Beast Makankosappo: locks evade on Awakening, charges helix, and fires piercing Beam tearing shields', () => {
    const engine = makeEngine(['gohan', 'cell'], 1500);
    const [gohan, cell] = engine.fighters;
    gohan.ultimateCooldown = 99;
    cell.ultimateCooldown = 99;
    cell.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, gohan)).toBe(true);
    expect(cell.dodgeLockedTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as GohanUltimateData;

    for (let i = 0; i < 120 && !data.beamFired; i++) {
      cell.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.beamFired).toBe(true);
    expect(engine.beams.length).toBeGreaterThanOrEqual(1);
    expect(cell.shieldTimer).toBe(0);
  });

  it('Beerus Sphere of Destruction & Hakai: places 5 Destroyer Sun orbs and erases all bullets + shields on Hakai snap', () => {
    const engine = makeEngine(['beerus', 'goku'], 1500);
    const [beerus, goku] = engine.fighters;
    beerus.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    goku.x = beerus.x + 120;
    goku.y = beerus.y;
    goku.shieldTimer = 4.0;
    goku.evadeTimer = 3.0;

    engine.projectiles.push({
      id: 'hakai_bullet',
      ownerUid: goku.uid,
      teamId: null,
      kind: 'ki-blast',
      x: beerus.x + 180,
      y: beerus.y,
      vx: -10,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 40,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 4.0,
      maxLife: 4.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, beerus)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as BeerusUltimateData;
    expect(data.orbs.length).toBe(5);

    for (let i = 0; i < 160 && !data.hakaiFired; i++) {
      goku.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.hakaiFired).toBe(true);
    expect(engine.projectiles.filter((p) => p.id === 'hakai_bullet').length).toBe(0);
    expect(goku.shieldTimer).toBe(0);
    expect(goku.evadeTimer).toBe(0);
  });

  it('Doflamingo Torikago & 16 Holy Bullets: slices perimeter bullets, compresses cage, and unleashes 16 God Thread lances', () => {
    const engine = makeEngine(['doflamingo', 'law'], 1500);
    const [doflamingo, law] = engine.fighters;
    doflamingo.ultimateCooldown = 99;
    law.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, doflamingo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as DoflamingoUltimateData;
    const initCage = data.cageRadius;

    engine.projectiles.push({
      id: 'cage_slice_test',
      ownerUid: law.uid,
      teamId: null,
      kind: 'sword-wave',
      x: data.centerX + initCage + 10,
      y: data.centerY,
      vx: 0,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 40,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: 0,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    for (let i = 0; i < 170 && !data.godThreadFired; i++) engine.step(1 / 60);
    expect(data.slicedBullets).toBeGreaterThanOrEqual(1);
    expect(data.cageRadius).toBeLessThan(initCage);
    expect(data.godThreadFired).toBe(true);
    expect(data.spears.length).toBe(16);
  });

  it('Katakuri Future Sight & Zan Giri Mochi: gains evade, lays sticky mochi puddles, fires Power Mochi, and smashes obstacles', () => {
    const engine = makeEngine(['katakuri', 'luffy'], 1500);
    const [katakuri, luffy] = engine.fighters;
    katakuri.ultimateCooldown = 99;
    luffy.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, katakuri)).toBe(true);
    expect(katakuri.evadeTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as KatakuriUltimateData;
    expect(data.puddles.length).toBe(4);

    for (let i = 0; i < 175 && !data.zanGiriSlammed; i++) engine.step(1 / 60);
    expect(data.donutsLeft).toBe(0);
    expect(data.zanGiriSlammed).toBe(true);
  });

  it('Akaza Compass Needle & Chaotic Afterglow: scales counter-strikes inside Snowflake Compass and fires 10 Afterglow waves', () => {
    const engine = makeEngine(['akaza', 'rengoku'], 1500);
    const [akaza, rengoku] = engine.fighters;
    akaza.ultimateCooldown = 99;
    rengoku.ultimateCooldown = 99;
    rengoku.x = akaza.x + 80;
    rengoku.y = akaza.y;
    rengoku.vx = 280;

    expect(triggerCustomUltimate(engine, akaza)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as AkazaUltimateData;

    for (let i = 0; i < 165 && !data.afterglowFired; i++) {
      rengoku.x = Math.min(engine.bounds.right - 40, akaza.x + 70);
      rengoku.y = akaza.y;
      rengoku.vx = 280;
      engine.step(1 / 60);
    }
    expect(data.counterHits).toBeGreaterThanOrEqual(1);
    expect(data.afterglowFired).toBe(true);
    expect(engine.projectiles.some((p) => p.ownerUid === akaza.uid && p.kind === 'fist-wave')).toBe(
      true,
    );
  });

  it('Kokushibo Moon Breathing 16th Form: emits chaotic moon rings, 16th form crescent beams, and inflicts Anti-Heal', () => {
    const engine = makeEngine(['kokushibo', 'gyomei'], 1500);
    const [kokushibo, gyomei] = engine.fighters;
    kokushibo.ultimateCooldown = 99;
    gyomei.ultimateCooldown = 99;
    gyomei.x = kokushibo.x + 110;
    gyomei.y = kokushibo.y;

    expect(triggerCustomUltimate(engine, kokushibo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as KokushiboUltimateData;

    for (let i = 0; i < 170 && !data.sixteenthFired; i++) {
      gyomei.x = Math.min(engine.bounds.right - 36, kokushibo.x + 110);
      gyomei.y = kokushibo.y;
      engine.step(1 / 60);
    }
    expect(data.waveCount).toBe(2);
    expect(data.sixteenthFired).toBe(true);
    expect(gyomei.antiHealTimer).toBeGreaterThan(0);
    expect(engine.beams.length).toBeGreaterThanOrEqual(6);
  });

  it('10-way simultaneous Batch 10 FFA keeps all coordinates finite inside arena bounds with clean expiration', () => {
    const engine = makeEngine([...MEGA_BATCH_10_IDS], 2500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      triggerCustomUltimate(engine, f);
    }
    expect(engine.activeUltimates.length).toBe(10);

    for (let step = 0; step < 540; step++) {
      engine.step(1 / 60);
      for (const f of engine.fighters) {
        expect(Number.isFinite(f.x)).toBe(true);
        expect(Number.isFinite(f.y)).toBe(true);
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
