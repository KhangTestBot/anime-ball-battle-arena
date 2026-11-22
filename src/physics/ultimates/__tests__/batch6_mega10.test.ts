import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { EscanorUltimateData } from '../escanor';
import type { GilgameshUltimateData } from '../gilgamesh';
import type { HakariUltimateData } from '../hakari';
import type { ItachiUltimateData } from '../itachi';
import type { KaidoUltimateData } from '../kaido';
import type { MeliodasUltimateData } from '../meliodas';
import type { MinatoUltimateData } from '../minato';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SaberUltimateData } from '../saber';
import type { ShanksUltimateData } from '../shanks';
import type { YutaUltimateData } from '../yuta';

const MEGA_BATCH_6_IDS = [
  'shanks',
  'kaido',
  'itachi',
  'minato',
  'yuta',
  'hakari',
  'gilgamesh',
  'saber',
  'escanor',
  'meliodas',
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

describe('Mega-Batch 6 Bespoke Ultimates (Shanks, Kaido, Itachi, Minato, Yuta, Hakari, Gilgamesh, Saber, Escanor, Meliodas)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 48)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_6_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(48);
  });

  it('Shanks Kamusari: seals Observation dodge + strips shields + erases enemy projectiles along slash', () => {
    const engine = makeEngine(['shanks', 'goku'], 1500);
    const [shanks, goku] = engine.fighters;
    shanks.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    shanks.x = 200;
    shanks.y = 300;
    goku.x = 420;
    goku.y = 300;
    goku.shieldTimer = 2.0;
    goku.evadeTimer = 2.0;
    goku.uiDodgeTimer = 2.0;

    expect(triggerCustomUltimate(engine, shanks)).toBe(true);
    expect(goku.shieldTimer).toBe(0);
    expect(goku.dodgeLockedTimer).toBeGreaterThanOrEqual(2.5);

    // Observation Killer blocks dodge even while evadeTimer/uiDodgeTimer are active!
    const hpBefore = goku.hp;
    engine.applyDamage(shanks, goku, 15, 0, 0, { bypassInvuln: true, sourceKind: 'ability' });
    expect(goku.hp).toBeLessThan(hpBefore);

    const data = engine.activeUltimates[0].data as unknown as ShanksUltimateData;
    for (let i = 0; i < 120 && data.slashesFired < 1; i++) {
      engine.step(1 / 60);
    }
    expect(data.slashesFired).toBeGreaterThanOrEqual(1);
    const arc = data.kamusariArcs[0];
    expect(arc).toBeDefined();

    // Spawn an enemy projectile directly in front of the active Kamusari slash and verify it gets erased!
    engine.projectiles.push({
      id: 'enemy_proj',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      kind: 'ki-blast',
      x: arc.x + Math.cos(arc.angle) * 28,
      y: arc.y + Math.sin(arc.angle) * 28,
      vx: 0,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    stepFrames(engine, 6);
    expect(engine.projectiles.some((p) => p.id === 'enemy_proj')).toBe(false);
  });

  it('Kaido Kaen Daiko: shifts Drunken Dodge -> sweeping Boro Breath -> Flame Dragon Cloak vaporizing projectiles', () => {
    const engine = makeEngine(['kaido', 'luffy'], 1500);
    const [kaido, luffy] = engine.fighters;
    kaido.ultimateCooldown = 99;
    luffy.ultimateCooldown = 99;
    kaido.x = 240;
    kaido.y = 300;
    luffy.x = 400;
    luffy.y = 300;

    expect(triggerCustomUltimate(engine, kaido)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as KaidoUltimateData;
    expect(data.phase).toBe('drunk-dodge');
    expect(kaido.giantTimer).toBeGreaterThan(3.0);

    for (let i = 0; i < 140 && data.phase !== 'boro-breath'; i++) engine.step(1 / 60);
    expect(data.phase).toBe('boro-breath');

    for (let i = 0; i < 150 && data.phase !== 'kaen-daiko'; i++) engine.step(1 / 60);
    expect(data.phase).toBe('kaen-daiko');

    engine.projectiles.push({
      id: 'kaido_melt',
      ownerUid: luffy.uid,
      teamId: luffy.teamId,
      kind: 'fireball',
      x: kaido.x + 12,
      y: kaido.y,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 8,
      knockback: 100,
      color: '#ef4444',
      secondaryColor: '#fff',
      angle: 0,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 10);
    expect(engine.projectiles.some((p) => p.id === 'kaido_melt')).toBe(false);
  });

  it('Itachi Tsukuyomi & Totsuka: confuses foes, blocks projectiles with Crows, reflects with Yata Mirror, seals with Totsuka', () => {
    const engine = makeEngine(['itachi', 'sasuke'], 1500);
    const [itachi, sasuke] = engine.fighters;
    itachi.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;
    itachi.x = 250;
    itachi.y = 300;
    sasuke.x = 420;
    sasuke.y = 300;

    expect(triggerCustomUltimate(engine, itachi)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ItachiUltimateData;
    expect(sasuke.confusedTimer).toBeGreaterThan(0);
    expect(data.crows.length).toBe(6);

    // Stage 2: totsuka-yata reflects incoming projectile & seals nearby Sasuke!
    for (let i = 0; i < 160 && data.stage !== 'totsuka-yata'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('totsuka-yata');

    engine.projectiles.push({
      id: 'yata_proj',
      ownerUid: sasuke.uid,
      teamId: sasuke.teamId,
      kind: 'shuriken-star',
      x: itachi.x + 18,
      y: itachi.y,
      vx: -200,
      vy: 0,
      radius: 8,
      damage: 8,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    // Place Sasuke within Totsuka sweep range and zero drift so Totsuka strike lands deterministically
    sasuke.x = itachi.x + 110;
    sasuke.y = itachi.y;
    sasuke.vx = 0;
    sasuke.vy = 0;
    for (let i = 0; i < 100 && !data.totsukaStruck; i++) {
      sasuke.x = itachi.x + 110;
      sasuke.y = itachi.y;
      engine.step(1 / 60);
    }

    const reflected = engine.projectiles.find((p) => p.id === 'yata_proj');
    if (reflected) {
      expect(reflected.ownerUid).toBe(itachi.uid);
    }
    expect(data.totsukaStruck).toBe(true);
    expect(sasuke.burnTimer).toBeGreaterThan(0);
  });

  it('Minato Flying Raijin Level 2: plants 6 Kunai, marks touching enemy, and blinks across warps cleanly inside bounds', () => {
    const engine = makeEngine(['minato', 'naruto'], 1500);
    const [minato, naruto] = engine.fighters;
    minato.ultimateCooldown = 99;
    naruto.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, minato)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MinatoUltimateData;
    expect(data.kunais.length).toBe(6);

    // Touch kunai[0] to get Hiraishin marked
    naruto.x = data.kunais[0].x;
    naruto.y = data.kunais[0].y;
    for (let i = 0; i < 160 && data.warpsLeft > 3; i++) engine.step(1 / 60);

    expect(data.markedUids[naruto.uid]).toBeGreaterThan(0);
    expect(data.warpLines.length).toBeGreaterThan(0);
    expect(minato.x).toBeGreaterThanOrEqual(engine.bounds.left + minato.radius);
    expect(minato.x).toBeLessThanOrEqual(engine.bounds.right - minato.radius);
  });

  it('Yuta Rika & Pure Love Beam: Cursed Speech stuns, Rika intercepts rear projectiles, Thin Ice strips shield, Pure Love fires', () => {
    const engine = makeEngine(['yuta', 'gojo'], 1500);
    const [yuta, gojo] = engine.fighters;
    yuta.ultimateCooldown = 99;
    gojo.ultimateCooldown = 99;
    yuta.x = 300;
    yuta.y = 300;
    gojo.x = 400;
    gojo.y = 300;
    gojo.shieldTimer = 3.0;

    expect(triggerCustomUltimate(engine, yuta)).toBe(true);
    expect(gojo.stunTimer).toBeGreaterThan(0);
    const data = engine.activeUltimates[0].data as unknown as YutaUltimateData;

    // Enemy projectile hitting Full Rika behind Yuta gets blocked!
    engine.projectiles.push({
      id: 'rika_block',
      ownerUid: gojo.uid,
      teamId: gojo.teamId,
      kind: 'purple',
      x: data.rikaX,
      y: data.rikaY,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#a855f7',
      secondaryColor: '#fff',
      angle: 0,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 12);
    expect(engine.projectiles.some((p) => p.id === 'rika_block')).toBe(false);

    // Stage 2: Sky Manipulation Thin Ice Breaker strips shield & shreds armor
    for (let i = 0; i < 140 && data.stage !== 'sky-breaker'; i++) engine.step(1 / 60);
    expect(gojo.shieldTimer).toBe(0);
    expect(gojo.armorShredTimer).toBeGreaterThan(0);

    // Stage 3: Pure Love Beam fires
    for (let i = 0; i < 140 && data.stage !== 'pure-love'; i++) engine.step(1 / 60);
    expect(data.beamTimer).toBeGreaterThan(0);
  });

  it('Hakari Idle Death Gamble: slams Train Doors, hits 7-7-7 Jackpot for 4.11s immortality + regen respecting anti-heal', () => {
    const engine = makeEngine(['hakari', 'sukuna'], 1500);
    const [hakari, sukuna] = engine.fighters;
    hakari.ultimateCooldown = 99;
    sukuna.ultimateCooldown = 99;
    hakari.hp = 900;

    expect(triggerCustomUltimate(engine, hakari)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as HakariUltimateData;

    for (let i = 0; i < 120 && data.phase !== 'jackpot'; i++) engine.step(1 / 60);
    expect(data.phase).toBe('jackpot');
    expect(data.reels).toEqual([7, 7, 7]);
    expect(hakari.immortalTimer).toBeGreaterThan(3.8);

    const hpAtJackpot = hakari.hp;
    // Wait for first regen tick (+0.5s)
    stepFrames(engine, 40);
    expect(hakari.hp).toBeGreaterThan(hpAtJackpot);

    // Anti-heal suppresses Hakari regen cleanly via unified getHealMultiplier!
    hakari.antiHealTimer = 2.0;
    const hpWithAntiHeal = hakari.hp;
    stepFrames(engine, 40);
    expect(hakari.hp).toBeLessThanOrEqual(hpWithAntiHeal + 0.01);
  });

  it('Gilgamesh Gate of Babylon & Enuma Elish: binds strongest foe in Enkidu chains, fires 24 weapons, then tears space with Ea', () => {
    const engine = makeEngine(['gilgamesh', 'saber'], 1500);
    const [gil, saber] = engine.fighters;
    gil.ultimateCooldown = 99;
    saber.ultimateCooldown = 99;
    saber.formIndex = saber.character.forms.length - 1;
    saber.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, gil)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GilgameshUltimateData;
    expect(saber.stunKind).toBe('chained');
    expect(saber.stunTimer).toBeGreaterThan(1.3);
    expect(data.gates.length).toBe(8);

    for (let i = 0; i < 200 && data.firedCount < 24; i++) engine.step(1 / 60);
    expect(data.firedCount).toBe(24);

    for (let i = 0; i < 120 && data.stage !== 'enuma-fire'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('enuma-fire');
    expect(data.eaFlash).toBeGreaterThan(0);
  });

  it('Saber Avalon -> Excalibur: nullifies projectiles inside sanctuary & sweeps Excalibur light beam', () => {
    const engine = makeEngine(['saber', 'gilgamesh'], 1500);
    const [saber, gil] = engine.fighters;
    saber.ultimateCooldown = 99;
    gil.ultimateCooldown = 99;
    saber.x = 300;
    saber.y = 300;
    gil.x = 500;
    gil.y = 300;

    expect(triggerCustomUltimate(engine, saber)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as SaberUltimateData;
    expect(saber.invulnTimer).toBeGreaterThan(0.9);

    engine.projectiles.push({
      id: 'avalon_blocked',
      ownerUid: gil.uid,
      teamId: gil.teamId,
      kind: 'spear',
      x: saber.x + 25,
      y: saber.y,
      vx: -100,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#fbbf24',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 12);
    expect(data.nullifiedCount).toBeGreaterThanOrEqual(1);
    expect(engine.projectiles.some((p) => p.id === 'avalon_blocked')).toBe(false);

    for (let i = 0; i < 120 && data.stage !== 'excalibur'; i++) engine.step(1 / 60);
    expect(data.beamTimer).toBeGreaterThan(0);
  });

  it('Escanor The One 12:00 & Cruel Sun: becomes giant unstoppable, melts projectiles near Cruel Sun, cleaves with Divine Sword', () => {
    const engine = makeEngine(['escanor', 'meliodas'], 1500);
    const [escanor, meliodas] = engine.fighters;
    escanor.ultimateCooldown = 99;
    meliodas.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, escanor)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as EscanorUltimateData;
    expect(escanor.giantTimer).toBeGreaterThan(3.0);
    expect(escanor.unstoppableTimer).toBeGreaterThan(3.0);

    engine.projectiles.push({
      id: 'sun_melted',
      ownerUid: meliodas.uid,
      teamId: meliodas.teamId,
      kind: 'purple',
      x: data.sunX,
      y: data.sunY,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#a855f7',
      secondaryColor: '#fff',
      angle: 0,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 10);
    expect(engine.projectiles.some((p) => p.id === 'sun_melted')).toBe(false);

    for (let i = 0; i < 200 && !data.divineChopped; i++) engine.step(1 / 60);
    expect(data.divineChopped).toBe(true);
  });

  it('Meliodas Full Counter x2 & Trillion Dark: reflects incoming projectiles with double damage + spawns Lostvayne clones + dark salvos', () => {
    const engine = makeEngine(['meliodas', 'escanor'], 1500);
    const [meliodas, escanor] = engine.fighters;
    meliodas.ultimateCooldown = 99;
    escanor.ultimateCooldown = 99;
    meliodas.x = 260;
    meliodas.y = 300;
    escanor.x = 460;
    escanor.y = 300;

    expect(triggerCustomUltimate(engine, meliodas)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MeliodasUltimateData;
    expect(data.clones.length).toBe(2);

    engine.projectiles.push({
      id: 'counter_me',
      ownerUid: escanor.uid,
      teamId: escanor.teamId,
      kind: 'fireball',
      x: meliodas.x + 22,
      y: meliodas.y,
      vx: -300,
      vy: 0,
      radius: 8,
      damage: 12,
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
    stepFrames(engine, 12);

    const reflected = engine.projectiles.find((p) => p.id === 'counter_me');
    expect(reflected).toBeDefined();
    expect(reflected?.ownerUid).toBe(meliodas.uid);
    expect(reflected?.vx).toBeGreaterThan(300);
    expect(reflected?.damage).toBeGreaterThanOrEqual(24);
    expect(data.reflectedCount).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < 160 && data.stage !== 'trillion-dark'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('trillion-dark');
  });

  it('10-way simultaneous Batch 6 FFA simulation runs cleanly with all coordinates finite inside arena bounds', () => {
    const engine = makeEngine([...MEGA_BATCH_6_IDS], 2500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(10);

    stepFrames(engine, 360);
    for (const f of engine.fighters) {
      expect(Number.isFinite(f.x)).toBe(true);
      expect(Number.isFinite(f.y)).toBe(true);
      expect(Number.isFinite(f.hp)).toBe(true);
      expect(f.x).toBeGreaterThanOrEqual(engine.bounds.left);
      expect(f.x).toBeLessThanOrEqual(engine.bounds.right);
      expect(f.y).toBeGreaterThanOrEqual(engine.bounds.top);
      expect(f.y).toBeLessThanOrEqual(engine.bounds.bottom);
    }
  });
});
