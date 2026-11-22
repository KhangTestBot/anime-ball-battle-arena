import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { BlackbeardUltimateData } from '../blackbeard';
import type { CellUltimateData } from '../cell';
import type { GiyuUltimateData } from '../giyu';
import type { GonUltimateData } from '../gon';
import type { HisokaUltimateData } from '../hisoka';
import type { JirenUltimateData } from '../jiren';
import type { MeruemUltimateData } from '../meruem';
import type { MihawkUltimateData } from '../mihawk';
import type { MuzanUltimateData } from '../muzan';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { TengenUltimateData } from '../tengen';

const MEGA_BATCH_11_IDS = [
  'blackbeard',
  'mihawk',
  'cell',
  'jiren',
  'gon',
  'hisoka',
  'meruem',
  'muzan',
  'giyu',
  'tengen',
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

describe('Mega-Batch 11 Bespoke Ultimates (Blackbeard, Mihawk, Cell, Jiren, Gon, Hisoka, Meruem, Muzan, Giyu, Tengen)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 98)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_11_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(98);
  });

  it('Blackbeard Yami Black Hole & Gura Quake: nullifies shields/silence/dodge, swallows bullets, and crushes obstacles', () => {
    const engine = makeEngine(['blackbeard', 'whitebeard'], 1500);
    const [bb, wb] = engine.fighters;
    bb.ultimateCooldown = 99;
    wb.ultimateCooldown = 99;
    wb.shieldTimer = 3.0;
    wb.evadeTimer = 3.0;

    engine.obstacles.push({
      id: 'bb_obs',
      ownerUid: wb.uid,
      ownerCharId: 'whitebeard',
      teamId: null,
      kind: 'obsidian-block',
      x: bb.x + 60,
      y: bb.y,
      w: 36,
      h: 36,
      hp: 90,
      maxHp: 90,
      life: 5,
      maxLife: 5,
      blocksProjectiles: true,
      restitution: 1,
      color: '#475569',
    });

    engine.projectiles.push({
      id: 'bb_absorb_bullet',
      ownerUid: wb.uid,
      teamId: null,
      kind: 'ki-blast',
      x: bb.x + 80,
      y: bb.y,
      vx: -50,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 40,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, bb)).toBe(true);
    expect(wb.shieldTimer).toBe(0);
    expect(wb.silenceTimer).toBeGreaterThan(1.0);
    expect(wb.dodgeLockedTimer).toBeGreaterThan(1.0);

    const data = engine.activeUltimates[0].data as unknown as BlackbeardUltimateData;
    for (let i = 0; i < 160 && !data.quakeCrushed; i++) {
      if (engine.obstacles[0]) {
        engine.obstacles[0].x = bb.x + 50;
        engine.obstacles[0].y = bb.y;
      }
      engine.step(1 / 60);
    }
    expect(data.swallowedCount).toBeGreaterThanOrEqual(1);
    expect(data.quakeCrushed).toBe(true);
    expect(engine.obstacles.length).toBe(0);
  });

  it('Mihawk Black Blade Yoru: locks enemy evade and slices entire arena bisecting obstacles & shields', () => {
    const engine = makeEngine(['mihawk', 'zoro'], 1500);
    const [mihawk, zoro] = engine.fighters;
    mihawk.ultimateCooldown = 99;
    zoro.ultimateCooldown = 99;
    zoro.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, mihawk)).toBe(true);
    expect(zoro.dodgeLockedTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as MihawkUltimateData;

    for (let i = 0; i < 120 && !data.slashed; i++) {
      zoro.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.slashed).toBe(true);
    expect(zoro.shieldTimer).toBe(0);
  });

  it('Cell Juniors & Solar Kamehameha: regenerates HP, spawns 3 Cell Juniors, and fires Solar Kamehameha beam', () => {
    const engine = makeEngine(['cell', 'gohan'], 1500);
    const [cell, gohan] = engine.fighters;
    cell.ultimateCooldown = 99;
    gohan.ultimateCooldown = 99;
    cell.hp = cell.maxHp * 0.6;
    const prevHp = cell.hp;

    expect(triggerCustomUltimate(engine, cell)).toBe(true);
    expect(cell.hp).toBeGreaterThan(prevHp);
    const data = engine.activeUltimates[0].data as unknown as CellUltimateData;
    expect(data.juniorIds.length).toBe(3);
    expect(engine.minions.filter((m) => m.ownerUid === cell.uid).length).toBe(3);

    for (let i = 0; i < 150 && !data.beamFired; i++) engine.step(1 / 60);
    expect(data.beamFired).toBe(true);
    expect(engine.beams.length).toBeGreaterThanOrEqual(1);
  });

  it('Jiren Overheat Eye Glare & Power Impact: erases incoming bullets, fires Glare punches, and triggers Power Impact', () => {
    const engine = makeEngine(['jiren', 'goku'], 1500);
    const [jiren, goku] = engine.fighters;
    jiren.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    goku.x = jiren.x + 110;
    goku.y = jiren.y;

    engine.projectiles.push({
      id: 'glare_null_bullet',
      ownerUid: goku.uid,
      teamId: null,
      kind: 'ki-blast',
      x: jiren.x + 60,
      y: jiren.y,
      vx: -30,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 40,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, jiren)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as JirenUltimateData;

    for (let i = 0; i < 155 && !data.impactFired; i++) engine.step(1 / 60);
    expect(engine.projectiles.filter((p) => p.id === 'glare_null_bullet').length).toBe(0);
    expect(data.glarePunches).toBeGreaterThanOrEqual(1);
    expect(data.impactFired).toBe(true);
  });

  it('Gon Adult Binding Vow Jajanken: sacrifices HP, shoots Chi & Pa, and lands final GUU breaking shields', () => {
    const engine = makeEngine(['gon', 'pitou'], 1500);
    const [gon, pitou] = engine.fighters;
    gon.ultimateCooldown = 99;
    pitou.ultimateCooldown = 99;
    const hpBefore = gon.hp;
    pitou.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, gon)).toBe(true);
    expect(gon.hp).toBeLessThan(hpBefore);
    const data = engine.activeUltimates[0].data as unknown as GonUltimateData;

    for (let i = 0; i < 160 && data.step < 3; i++) {
      pitou.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.step).toBe(3);
    expect(pitou.shieldTimer).toBe(0);
  });

  it('Hisoka Bungee Gum & Cards: pulls tethered targets elastically, throws 8 card projectiles, and detonates snap', () => {
    const engine = makeEngine(['hisoka', 'chrollo'], 1500);
    const [hisoka, chrollo] = engine.fighters;
    hisoka.ultimateCooldown = 99;
    chrollo.ultimateCooldown = 99;
    chrollo.x = hisoka.x + 170;
    chrollo.y = hisoka.y;

    expect(triggerCustomUltimate(engine, hisoka)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as HisokaUltimateData;

    for (let i = 0; i < 170 && !data.snapCrashFired; i++) engine.step(1 / 60);
    expect(data.elasticPulls).toBeGreaterThanOrEqual(1);
    expect(data.cardsThrown).toBe(true);
    expect(data.snapCrashFired).toBe(true);
  });

  it('Meruem Photonic En & Rage Blast: locks enemy dodge arena-wide, blitzes, and blasts obstacles', () => {
    const engine = makeEngine(['meruem', 'netero'], 1500);
    const [meruem, netero] = engine.fighters;
    meruem.ultimateCooldown = 99;
    netero.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, meruem)).toBe(true);
    expect(netero.dodgeLockedTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as MeruemUltimateData;

    for (let i = 0; i < 160 && !data.blastFired; i++) engine.step(1 / 60);
    expect(data.blastFired).toBe(true);
  });

  it('Muzan Biowhip Storm & Demon Blood: regenerates Demon King HP, inflicts Blood Poison, and bursts Confusion', () => {
    const engine = makeEngine(['muzan', 'tanjiro'], 1500);
    const [muzan, tanjiro] = engine.fighters;
    muzan.ultimateCooldown = 99;
    tanjiro.ultimateCooldown = 99;
    muzan.hp = muzan.maxHp * 0.65;
    const prevHp = muzan.hp;
    tanjiro.x = muzan.x + 95;
    tanjiro.y = muzan.y;

    expect(triggerCustomUltimate(engine, muzan)).toBe(true);
    expect(muzan.hp).toBeGreaterThan(prevHp);
    const data = engine.activeUltimates[0].data as unknown as MuzanUltimateData;

    for (let i = 0; i < 170 && !data.nerveBurstFired; i++) {
      tanjiro.x = Math.min(engine.bounds.right - 36, muzan.x + 85);
      tanjiro.y = muzan.y;
      engine.step(1 / 60);
    }
    expect(data.lashCount).toBeGreaterThanOrEqual(1);
    expect(data.nerveBurstFired).toBe(true);
    expect(tanjiro.karmaTimer).toBeGreaterThan(0);
    expect(tanjiro.confusedTimer).toBeGreaterThan(0);
  });

  it('Giyu 11th Form Dead Calm: erases hostile bullets in mirror field and strikes back with Constant Flux', () => {
    const engine = makeEngine(['giyu', 'akaza'], 1500);
    const [giyu, akaza] = engine.fighters;
    giyu.ultimateCooldown = 99;
    akaza.ultimateCooldown = 99;
    akaza.x = giyu.x + 120;
    akaza.y = giyu.y;

    engine.projectiles.push({
      id: 'calm_erase_test',
      ownerUid: akaza.uid,
      teamId: null,
      kind: 'fist-wave',
      x: giyu.x + 90,
      y: giyu.y,
      vx: -60,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 40,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, giyu)).toBe(true);
    expect(giyu.evadeTimer).toBeGreaterThan(1.5);
    const data = engine.activeUltimates[0].data as unknown as GiyuUltimateData;

    for (let i = 0; i < 170 && !data.fluxFired; i++) engine.step(1 / 60);
    expect(data.nullifiedCount).toBeGreaterThanOrEqual(1);
    expect(data.fluxFired).toBe(true);
  });

  it('Tengen Musical Score & String Performance: drops 6 Gunpowder Beads breaking obstacles and slashes finish', () => {
    const engine = makeEngine(['tengen', 'gyutaro'], 1500);
    const [tengen, gyutaro] = engine.fighters;
    tengen.ultimateCooldown = 99;
    gyutaro.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, tengen)).toBe(true);
    expect(tengen.getExcitedTimer).toBeGreaterThan(2.5);
    const data = engine.activeUltimates[0].data as unknown as TengenUltimateData;

    for (let i = 0; i < 175 && !data.scoreFinished; i++) engine.step(1 / 60);
    expect(data.scoreLevel).toBe(6);
    expect(data.scoreFinished).toBe(true);
  });

  it('10-way simultaneous Batch 11 FFA keeps all coordinates finite inside arena bounds with clean expiration', () => {
    const engine = makeEngine([...MEGA_BATCH_11_IDS], 2500);
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
