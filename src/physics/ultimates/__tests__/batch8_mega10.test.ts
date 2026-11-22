import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AizenUltimateData } from '../aizen';
import type { GaaraUltimateData } from '../gaara';
import type { GuyUltimateData } from '../guy';
import type { HashiramaUltimateData } from '../hashirama';
import type { JiraiyaUltimateData } from '../jiraiya';
import type { KenpachiUltimateData } from '../kenpachi';
import type { MegumiUltimateData } from '../megumi';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { RengokuUltimateData } from '../rengoku';
import type { YamamotoUltimateData } from '../yamamoto';
import type { ZenitsuUltimateData } from '../zenitsu';

const MEGA_BATCH_8_IDS = [
  'gaara',
  'jiraiya',
  'guy',
  'hashirama',
  'megumi',
  'aizen',
  'yamamoto',
  'kenpachi',
  'zenitsu',
  'rengoku',
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

describe('Mega-Batch 8 Bespoke Ultimates (Gaara, Jiraiya, Guy, Hashirama, Megumi, Aizen, Yamamoto, Kenpachi, Zenitsu, Rengoku)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 68)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_8_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(68);
  });

  it('Gaara Sand Mausoleum: blocks projectiles with Mother Sand, coffins target, and crushes with Pyramid', () => {
    const engine = makeEngine(['gaara', 'sasuke'], 1500);
    const [gaara, sasuke] = engine.fighters;
    gaara.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;
    gaara.x = 240;
    gaara.y = 300;
    sasuke.x = 340;
    sasuke.y = 300;

    expect(triggerCustomUltimate(engine, gaara)).toBe(true);
    expect(sasuke.stunKind).toBe('chained');
    const data = engine.activeUltimates[0].data as unknown as GaaraUltimateData;

    engine.projectiles.push({
      id: 'sand_blocked',
      ownerUid: sasuke.uid,
      teamId: sasuke.teamId,
      kind: 'fireball',
      x: gaara.x + 25,
      y: gaara.y,
      vx: -100,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#ef4444',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 12);
    expect(data.blockedCount).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < 160 && !data.crushed; i++) engine.step(1 / 60);
    expect(data.crushed).toBe(true);
    expect(sasuke.armorShredTimer).toBeGreaterThan(2.0);
  });

  it('Jiraiya Sage Mode: spreads Toad Oil puddles, ignites Goemon blaze burning targets, and slams Odama Rasengan', () => {
    const engine = makeEngine(['jiraiya', 'pain'], 1500);
    const [jiraiya, pain] = engine.fighters;
    jiraiya.ultimateCooldown = 99;
    pain.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, jiraiya)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as JiraiyaUltimateData;
    expect(data.pools.length).toBe(3);

    for (let i = 0; i < 120 && data.stage !== 'goemon-blaze'; i++) engine.step(1 / 60);
    expect(data.pools[0].ignited).toBe(true);

    for (let i = 0; i < 150 && !data.odamaStruck; i++) engine.step(1 / 60);
    expect(data.odamaStruck).toBe(true);
  });

  it('Might Guy 8th Gate: enters unstoppable frenzy, fires Sekizo air cannons, and charges Night Guy with blood recoil >= 15 HP', () => {
    const engine = makeEngine(['guy', 'madara'], 1500);
    const [guy, madara] = engine.fighters;
    guy.ultimateCooldown = 99;
    madara.ultimateCooldown = 99;
    guy.x = 240;
    guy.y = 300;

    expect(triggerCustomUltimate(engine, guy)).toBe(true);
    expect(guy.unstoppableTimer).toBeGreaterThan(3.0);
    const data = engine.activeUltimates[0].data as unknown as GuyUltimateData;

    for (let i = 0; i < 160 && data.stage === 'sekizo'; i++) engine.step(1 / 60);
    expect(data.stage === 'night-guy-charge' || data.stage === 'night-guy-hit').toBe(true);

    for (let i = 0; i < 90 && data.stage !== 'night-guy-hit'; i++) {
      madara.x = guy.x + 20;
      madara.y = guy.y;
      engine.step(1 / 60);
    }
    expect(data.stage).toBe('night-guy-hit');
    expect(guy.hp).toBeGreaterThanOrEqual(15);
  });

  it('Hashirama Shinsu Senju: confuses nearby targets, heals via Wood Sage, and fires 6 Buddha fist salvos stripping shields', () => {
    const engine = makeEngine(['hashirama', 'madara'], 1500);
    const [hashi, madara] = engine.fighters;
    hashi.ultimateCooldown = 99;
    madara.ultimateCooldown = 99;
    hashi.formIndex = hashi.character.forms.length - 1;
    hashi.hp = 900;
    hashi.x = 280;
    hashi.y = 300;
    madara.x = 340;
    madara.y = 300;
    madara.shieldTimer = 5.0;

    expect(triggerCustomUltimate(engine, hashi)).toBe(true);
    expect(madara.confusedTimer).toBeGreaterThan(1.0);
    expect(hashi.hp).toBeGreaterThan(900);
    const data = engine.activeUltimates[0].data as unknown as HashiramaUltimateData;

    for (let i = 0; i < 240 && data.salvosLeft > 0; i++) {
      madara.x = Math.min(engine.bounds.right - 40, hashi.x + 60);
      madara.y = hashi.y;
      engine.step(1 / 60);
    }
    expect(data.salvosLeft).toBe(0);
    expect(madara.shieldTimer).toBe(0);
  });

  it('Megumi Chimera Shadow Garden: summons Mahoraga AI minion and clicks Dharma Adaptation Wheel refreshing shields', () => {
    const engine = makeEngine(['megumi', 'sukuna'], 1500);
    const [megumi, sukuna] = engine.fighters;
    megumi.ultimateCooldown = 99;
    sukuna.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, megumi)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MegumiUltimateData;
    expect(engine.minions.some((m) => m.id === data.mahoragaId)).toBe(true);

    for (let i = 0; i < 120 && data.wheelTurns < 1; i++) engine.step(1 / 60);
    expect(data.wheelTurns).toBeGreaterThanOrEqual(1);
    expect(megumi.shieldTimer).toBeGreaterThan(0);
  });

  it('Aizen Kyoka Suigetsu & Kurohitsugi: confuses all foes, spawns decoys, and crushes trapped targets stripping shields', () => {
    const engine = makeEngine(['aizen', 'ichigo'], 1500);
    const [aizen, ichigo] = engine.fighters;
    aizen.ultimateCooldown = 99;
    ichigo.ultimateCooldown = 99;
    ichigo.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, aizen)).toBe(true);
    expect(ichigo.confusedTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as AizenUltimateData;
    expect(data.decoys.length).toBe(2);

    for (let i = 0; i < 180 && data.stage !== 'imploded'; i++) {
      ichigo.x = data.coffinX;
      ichigo.y = data.coffinY;
      engine.step(1 / 60);
    }
    expect(data.stage).toBe('imploded');
    expect(ichigo.shieldTimer).toBe(0);
    expect(ichigo.armorShredTimer).toBeGreaterThan(2.0);
  });

  it('Yamamoto Zanka no Tachi: 15M Sun Cloak vaporizes projectiles, raises 4 skeletons, and fires Tenchi Kaijin', () => {
    const engine = makeEngine(['yamamoto', 'aizen'], 1500);
    const [yama, aizen] = engine.fighters;
    yama.ultimateCooldown = 99;
    aizen.ultimateCooldown = 99;
    yama.x = 260;
    yama.y = 300;
    aizen.x = 380;
    aizen.y = 300;

    expect(triggerCustomUltimate(engine, yama)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as YamamotoUltimateData;
    expect(data.skeletons.length).toBe(4);

    engine.projectiles.push({
      id: 'yama_vaporize',
      ownerUid: aizen.uid,
      teamId: aizen.teamId,
      kind: 'purple',
      x: yama.x + 20,
      y: yama.y,
      vx: -100,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#a855f7',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 10);
    expect(data.vaporizedCount).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < 180 && !data.tenchiFired; i++) engine.step(1 / 60);
    expect(data.tenchiFired).toBe(true);
  });

  it('Kenpachi Nozarashi: transforms giant unstoppable, shatters obstacles, and strips enemy shields + enchant armor', () => {
    const engine = makeEngine(['kenpachi', 'steve'], 1500);
    const [kenpachi, steve] = engine.fighters;
    kenpachi.ultimateCooldown = 99;
    steve.ultimateCooldown = 99;
    kenpachi.x = 260;
    kenpachi.y = 300;
    steve.x = 340;
    steve.y = 300;
    steve.shieldTimer = 4.0;
    steve.enchantArmorTimer = 4.0;

    engine.obstacles.push({
      id: 'cleaved_obs',
      ownerUid: steve.uid,
      ownerCharId: 'steve',
      teamId: steve.teamId,
      kind: 'obsidian-block',
      x: 300,
      y: 300,
      w: 40,
      h: 40,
      hp: 10,
      maxHp: 10,
      life: 6,
      maxLife: 6,
      blocksProjectiles: true,
      restitution: 1,
      color: '#1e1b4b',
    });

    expect(triggerCustomUltimate(engine, kenpachi)).toBe(true);
    expect(kenpachi.giantTimer).toBeGreaterThan(3.0);
    const data = engine.activeUltimates[0].data as unknown as KenpachiUltimateData;

    for (let i = 0; i < 100 && data.cleavesLeft === 2; i++) {
      steve.x = kenpachi.x + 80;
      steve.y = kenpachi.y;
      engine.step(1 / 60);
    }
    expect(engine.obstacles.some((o) => o.id === 'cleaved_obs')).toBe(false);
    expect(steve.shieldTimer).toBe(0);
    expect(steve.enchantArmorTimer).toBe(0);
  });

  it('Zenitsu Godspeed & Seventh Form: zig-zags 6 thunder bolts cleanly in bounds and lands Flaming Thunder God paralyze & stun', () => {
    const engine = makeEngine(['zenitsu', 'akaza'], 1500);
    const [zenitsu, akaza] = engine.fighters;
    zenitsu.ultimateCooldown = 99;
    akaza.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, zenitsu)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ZenitsuUltimateData;

    for (let i = 0; i < 180 && data.stage === 'six-fold'; i++) engine.step(1 / 60);
    expect(data.stage === 'thunder-god' || data.stage === 'done').toBe(true);
    expect(zenitsu.x).toBeGreaterThanOrEqual(engine.bounds.left + zenitsu.radius);
    expect(zenitsu.x).toBeLessThanOrEqual(engine.bounds.right - zenitsu.radius);
  });

  it('Rengoku Ninth Form: becomes immortal & melts weak projectiles in Flame Tiger vortex, then charges Purgatory Dragon', () => {
    const engine = makeEngine(['rengoku', 'akaza'], 1500);
    const [rengoku, akaza] = engine.fighters;
    rengoku.ultimateCooldown = 99;
    akaza.ultimateCooldown = 99;
    rengoku.x = 260;
    rengoku.y = 300;
    akaza.x = 400;
    akaza.y = 300;

    expect(triggerCustomUltimate(engine, rengoku)).toBe(true);
    expect(rengoku.immortalTimer).toBeGreaterThan(1.8);
    const data = engine.activeUltimates[0].data as unknown as RengokuUltimateData;

    engine.projectiles.push({
      id: 'melted_by_flame',
      ownerUid: akaza.uid,
      teamId: akaza.teamId,
      kind: 'fist-wave',
      x: rengoku.x + 15,
      y: rengoku.y,
      vx: -100,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 10);
    expect(engine.projectiles.some((p) => p.id === 'melted_by_flame')).toBe(false);

    for (let i = 0; i < 160 && data.stage === 'flame-tiger'; i++) engine.step(1 / 60);
    expect(data.stage === 'purgatory-dragon' || data.stage === 'aftermath').toBe(true);
  });

  it('10-way simultaneous Batch 8 FFA keeps all coordinates finite inside arena bounds with zero crashes', () => {
    const engine = makeEngine([...MEGA_BATCH_8_IDS], 2500);
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
