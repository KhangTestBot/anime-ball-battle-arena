import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AkainuUltimateData } from '../akainu';
import type { AllMightUltimateData } from '../allmight';
import type { AokijiUltimateData } from '../aokiji';
import type { BakugoUltimateData } from '../bakugo';
import type { KizaruUltimateData } from '../kizaru';
import type { MahitoUltimateData } from '../mahito';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { RukiaUltimateData } from '../rukia';
import type { ShigarakiUltimateData } from '../shigaraki';
import type { TodorokiUltimateData } from '../todoroki';
import type { ToshiroUltimateData } from '../toshiro';

const MEGA_BATCH_12_IDS = [
  'bakugo',
  'todoroki',
  'allmight',
  'shigaraki',
  'akainu',
  'kizaru',
  'aokiji',
  'toshiro',
  'rukia',
  'mahito',
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

describe('Mega-Batch 12 Bespoke Ultimates (Bakugo, Todoroki, All Might, Shigaraki, Akainu, Kizaru, Aokiji, Toshiro, Rukia, Mahito)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 108)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_12_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(108);
  });

  it('Bakugo Cluster Howitzer Impact: spirals 3 dashes leaving Cluster sparks and smashes obstacles on Impact', () => {
    const engine = makeEngine(['bakugo', 'deku'], 1500);
    const [bakugo, deku] = engine.fighters;
    bakugo.ultimateCooldown = 99;
    deku.ultimateCooldown = 99;
    deku.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, bakugo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as BakugoUltimateData;

    for (let i = 0; i < 160 && !data.impacted; i++) {
      deku.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.dashesLeft).toBe(0);
    expect(data.impacted).toBe(true);
    expect(deku.shieldTimer).toBe(0);
  });

  it('Todoroki Phosphor Great Glacier Aegir: spawns 3 Ice Walls and shatters them in Thermal Vapor burst', () => {
    const engine = makeEngine(['todoroki', 'dabi'], 1500);
    const [shoto, dabi] = engine.fighters;
    shoto.ultimateCooldown = 99;
    dabi.ultimateCooldown = 99;
    dabi.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, shoto)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as TodorokiUltimateData;
    expect(data.iceWallIds.length).toBe(3);
    expect(engine.obstacles.filter((o) => data.iceWallIds.includes(o.id)).length).toBe(3);

    for (let i = 0; i < 170 && !data.phosphorDetonated; i++) {
      dabi.abilityTimer = 99;
      shoto.x = Math.min(engine.bounds.right - 60, Math.max(engine.bounds.left + 60, dabi.x - 80));
      shoto.y = dabi.y;
      engine.step(1 / 60);
    }
    expect(data.phosphorDetonated).toBe(true);
    expect(engine.obstacles.filter((o) => data.iceWallIds.includes(o.id)).length).toBe(0);
    expect(dabi.shieldTimer).toBe(0);
    expect(dabi.frostTimer).toBeGreaterThan(0);
  });

  it('All Might United States of Smash: clears incoming bullets and launches targets airborne shattering shields', () => {
    const engine = makeEngine(['allmight', 'allforone'], 1500);
    const [am, afo] = engine.fighters;
    am.ultimateCooldown = 99;
    afo.ultimateCooldown = 99;
    afo.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, am)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as AllMightUltimateData;

    for (let i = 0; i < 165 && !data.smashed; i++) {
      afo.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.smashed).toBe(true);
    expect(afo.shieldTimer).toBe(0);
  });

  it('Shigaraki Decay Wave: expands floor decay, crumbles obstacles to dust, and locks enemy healing', () => {
    const engine = makeEngine(['shigaraki', 'deku'], 1500);
    const [shig, deku] = engine.fighters;
    shig.ultimateCooldown = 99;
    deku.ultimateCooldown = 99;
    deku.x = shig.x + 80;
    deku.y = shig.y;

    engine.obstacles.push({
      id: 'decay_obs',
      ownerUid: deku.uid,
      ownerCharId: 'deku',
      teamId: null,
      kind: 'obsidian-block',
      x: shig.x + 110,
      y: shig.y,
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

    expect(triggerCustomUltimate(engine, shig)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ShigarakiUltimateData;

    for (let i = 0; i < 175 && !data.rivetBurstFired; i++) {
      deku.x = Math.min(engine.bounds.right - 36, data.decayX + 80);
      deku.y = data.decayY;
      engine.step(1 / 60);
    }
    expect(data.decayRadius).toBeGreaterThan(200);
    expect(engine.obstacles.length).toBe(0);
    expect(data.rivetBurstFired).toBe(true);
    expect(deku.antiHealTimer).toBeGreaterThan(0);
  });

  it('Akainu Ryusei Kazan: lays 4 magma craters, inflicts intense burn, and drops 6 Magma Meteors', () => {
    const engine = makeEngine(['akainu', 'ace'], 1500);
    const [akainu, ace] = engine.fighters;
    akainu.ultimateCooldown = 99;
    ace.ultimateCooldown = 99;
    ace.x = akainu.x + 90;
    ace.y = akainu.y;

    expect(triggerCustomUltimate(engine, akainu)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as AkainuUltimateData;
    expect(data.craters.length).toBe(4);

    for (let i = 0; i < 180 && data.meteorsLeft > 0; i++) engine.step(1 / 60);
    expect(data.meteorsLeft).toBe(0);
    expect(ace.burnTimer).toBeGreaterThan(0);
  });

  it('Kizaru Yasakani no Magatama: bounces 3 Yata mirror paths and fires 12 sacred jewel light lasers', () => {
    const engine = makeEngine(['kizaru', 'luffy'], 1500);
    const [kizaru, luffy] = engine.fighters;
    kizaru.ultimateCooldown = 99;
    luffy.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, kizaru)).toBe(true);
    expect(kizaru.evadeTimer).toBeGreaterThan(1.8);
    const data = engine.activeUltimates[0].data as unknown as KizaruUltimateData;

    for (let i = 0; i < 165 && !data.jewelsFired; i++) engine.step(1 / 60);
    expect(data.bouncesLeft).toBe(0);
    expect(data.jewelsFired).toBe(true);
    expect(engine.projectiles.some((p) => p.ownerUid === kizaru.uid && p.kind === 'ki-blast')).toBe(
      true,
    );
  });

  it('Aokiji Ice Age & Pheasant Beak: flash-freezes foes with frozen stun and launches piercing Ice Bird', () => {
    const engine = makeEngine(['aokiji', 'akainu'], 1500);
    const [aokiji, akainu] = engine.fighters;
    aokiji.ultimateCooldown = 99;
    akainu.ultimateCooldown = 99;
    akainu.x = aokiji.x + 90;
    akainu.y = aokiji.y;

    expect(triggerCustomUltimate(engine, aokiji)).toBe(true);
    expect(akainu.stunKind).toBe('frozen');
    const data = engine.activeUltimates[0].data as unknown as AokijiUltimateData;

    for (let i = 0; i < 140 && !data.pheasantFired; i++) engine.step(1 / 60);
    expect(data.pheasantFired).toBe(true);
    expect(
      engine.projectiles.some((p) => p.ownerUid === aokiji.uid && p.kind === 'ice-crystal'),
    ).toBe(true);
  });

  it('Toshiro Daiguren Hyorinmaru Shikai Hyoketsu: counts down 4 petals then freezes, silences & locks dodge', () => {
    const engine = makeEngine(['toshiro', 'grimmjow'], 1500);
    const [toshiro, foe] = engine.fighters;
    toshiro.ultimateCooldown = 99;
    foe.ultimateCooldown = 99;
    foe.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, toshiro)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ToshiroUltimateData;
    expect(data.petalsLeft).toBe(4);

    for (let i = 0; i < 175 && !data.hyoketsuTriggered; i++) {
      foe.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.petalsLeft).toBe(0);
    expect(data.hyoketsuTriggered).toBe(true);
    expect(foe.stunKind).toBe('frozen');
    expect(foe.silenceTimer).toBeGreaterThan(1.5);
    expect(foe.dodgeLockedTimer).toBeGreaterThan(1.5);
    expect(foe.shieldTimer).toBe(0);
  });

  it('Rukia Bankai Hakka no Togame: freezes approaching bullets at -273.15C and shatters them cleanly', () => {
    const engine = makeEngine(['rukia', 'yhwach'], 1500);
    const [rukia, foe] = engine.fighters;
    rukia.ultimateCooldown = 99;
    foe.ultimateCooldown = 99;
    foe.x = rukia.x + 110;
    foe.y = rukia.y;

    engine.projectiles.push({
      id: 'hakka_frozen_bullet',
      ownerUid: foe.uid,
      teamId: null,
      kind: 'ki-blast',
      x: rukia.x + 70,
      y: rukia.y,
      vx: -40,
      vy: 0,
      radius: 10,
      damage: 5,
      knockback: 40,
      color: '#a855f7',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 4.0,
      maxLife: 4.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, rukia)).toBe(true);
    expect(rukia.invulnTimer).toBeGreaterThan(0.5);
    const data = engine.activeUltimates[0].data as unknown as RukiaUltimateData;
    expect(data.frozenBullets).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < 160 && !data.shattered; i++) engine.step(1 / 60);
    expect(data.shattered).toBe(true);
    expect(engine.projectiles.filter((p) => p.id === 'hakka_frozen_bullet').length).toBe(0);
    expect(foe.antiHealTimer).toBeGreaterThan(0);
  });

  it('Mahito Self-Embodiment of Perfection: spawns 2 transfigured minions, locks healing, and inflicts Karma bleed', () => {
    const engine = makeEngine(['mahito', 'nanami'], 1500);
    const [mahito, nanami] = engine.fighters;
    mahito.ultimateCooldown = 99;
    nanami.ultimateCooldown = 99;
    nanami.x = mahito.x + 95;
    nanami.y = mahito.y;

    expect(triggerCustomUltimate(engine, mahito)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MahitoUltimateData;
    expect(data.humanoidIds.length).toBe(2);
    expect(engine.minions.filter((m) => m.ownerUid === mahito.uid).length).toBe(2);

    for (let i = 0; i < 175 && !data.perfectionEvolved; i++) {
      nanami.x = Math.min(engine.bounds.right - 36, mahito.x + 95);
      nanami.y = mahito.y;
      engine.step(1 / 60);
    }
    expect(data.perfectionEvolved).toBe(true);
    expect(nanami.antiHealTimer).toBeGreaterThan(0);
    expect(nanami.karmaTimer).toBeGreaterThan(0);
  });

  it('10-way simultaneous Batch 12 FFA keeps all coordinates finite inside arena bounds with clean expiration', () => {
    const engine = makeEngine([...MEGA_BATCH_12_IDS], 2500);
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
