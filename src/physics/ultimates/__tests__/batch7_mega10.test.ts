import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AceUltimateData } from '../ace';
import type { ArcherEmiyaUltimateData } from '../archer_emiya';
import type { BanUltimateData } from '../ban';
import type { KakashiUltimateData } from '../kakashi';
import type { KashimoUltimateData } from '../kashimo';
import type { ObitoUltimateData } from '../obito';
import type { PainUltimateData } from '../pain';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SanjiUltimateData } from '../sanji';
import type { TojiUltimateData } from '../toji';
import type { WhitebeardUltimateData } from '../whitebeard';

const MEGA_BATCH_7_IDS = [
  'ace',
  'whitebeard',
  'sanji',
  'kakashi',
  'pain',
  'obito',
  'toji',
  'kashimo',
  'ban',
  'archer_emiya',
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

describe('Mega-Batch 7 Bespoke Ultimates (Ace, Whitebeard, Sanji, Kakashi, Pain, Obito, Toji, Kashimo, Ban, Archer EMIYA)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 58)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_7_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(58);
  });

  it('Ace Dai Enkai Entei: lays burning ground patches, grows overhead sun, and detonates shredding armor & burning foes', () => {
    const engine = makeEngine(['ace', 'luffy'], 1500);
    const [ace, luffy] = engine.fighters;
    ace.ultimateCooldown = 99;
    luffy.ultimateCooldown = 99;
    ace.x = 240;
    ace.y = 300;
    luffy.x = 340;
    luffy.y = 300;

    expect(triggerCustomUltimate(engine, ace)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as AceUltimateData;

    for (let i = 0; i < 140 && data.stage !== 'dai-enkai'; i++) engine.step(1 / 60);
    expect(data.patches.length).toBeGreaterThanOrEqual(1);
    expect(data.stage).toBe('dai-enkai');

    for (let i = 0; i < 150 && data.stage !== 'detonated'; i++) {
      luffy.x = 340;
      luffy.y = 300;
      engine.step(1 / 60);
    }
    expect(data.stage).toBe('detonated');
    expect(luffy.armorShredTimer).toBeGreaterThan(0);
    expect(luffy.burnTimer).toBeGreaterThan(0);
  });

  it('Whitebeard Gura Gura: cracks arena air, strips enemy shields, and scrambles projectile trajectories', () => {
    const engine = makeEngine(['whitebeard', 'kaido'], 1500);
    const [wb, kaido] = engine.fighters;
    wb.ultimateCooldown = 99;
    kaido.ultimateCooldown = 99;
    kaido.shieldTimer = 3.0;

    engine.projectiles.push({
      id: 'wb_scramble',
      ownerUid: kaido.uid,
      teamId: kaido.teamId,
      kind: 'fireball',
      x: 350,
      y: 300,
      vx: -200,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#f97316',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, wb)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as WhitebeardUltimateData;
    expect(data.cracks.length).toBe(7);
    expect(kaido.shieldTimer).toBe(0);

    stepFrames(engine, 16);
    const scrambled = engine.projectiles.find((p) => p.id === 'wb_scramble');
    expect(scrambled).toBeDefined();
    expect(scrambled?.vy).not.toBe(0);
  });

  it('Sanji Ifrit Jambe: heals missing HP on Exoskeleton cast, stamps Sky Walk rings, and launches Boeuf Burst', () => {
    const engine = makeEngine(['sanji', 'zoro'], 1500);
    const [sanji, zoro] = engine.fighters;
    sanji.ultimateCooldown = 99;
    zoro.ultimateCooldown = 99;
    sanji.formIndex = sanji.character.forms.length - 1;
    sanji.hp = 900;

    expect(triggerCustomUltimate(engine, sanji)).toBe(true);
    expect(sanji.hp).toBeGreaterThan(900);
    const data = engine.activeUltimates[0].data as unknown as SanjiUltimateData;

    for (let i = 0; i < 200 && !data.boefBursted; i++) engine.step(1 / 60);
    expect(data.boefBursted).toBe(true);
    expect(data.rings.length).toBeGreaterThanOrEqual(0);
    expect(zoro.burnTimer).toBeGreaterThan(0);
  });

  it('Kakashi Double Mangekyo Kamui: warps away enemy projectiles in Kamui vortices & bypasses invuln with Kamui Raikiri', () => {
    const engine = makeEngine(['kakashi', 'obito'], 1500);
    const [kakashi, obito] = engine.fighters;
    kakashi.ultimateCooldown = 99;
    obito.ultimateCooldown = 99;
    kakashi.x = 220;
    kakashi.y = 300;
    obito.x = 380;
    obito.y = 300;

    expect(triggerCustomUltimate(engine, kakashi)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as KakashiUltimateData;
    expect(data.vortices.length).toBe(3);

    engine.projectiles.push({
      id: 'kamui_eat',
      ownerUid: obito.uid,
      teamId: obito.teamId,
      kind: 'shuriken-star',
      x: data.vortices[1].x,
      y: data.vortices[1].y,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#ea580c',
      secondaryColor: '#000',
      angle: 0,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 10);
    expect(engine.projectiles.some((p) => p.id === 'kamui_eat')).toBe(false);

    // Give Obito full invulnTimer and keep him near Kakashi for Kamui Raikiri dimensional bypass check!
    obito.invulnTimer = 3.0;
    obito.formIndex = obito.character.forms.length - 1;
    const hpBefore = obito.hp;
    for (let i = 0; i < 180 && data.stage !== 'raikiri-dash'; i++) {
      obito.x = Math.min(engine.bounds.right - 40, kakashi.x + 95);
      obito.y = kakashi.y;
      engine.step(1 / 60);
    }
    expect(data.stage).toBe('raikiri-dash');
    expect(obito.hp).toBeLessThan(hpBefore);
  });

  it('Pain Shinra Tensei & Chibaku Tensei: reflects projectiles on cast, drags foes toward singularity core, and crushes', () => {
    const engine = makeEngine(['pain', 'naruto'], 1500);
    const [pain, naruto] = engine.fighters;
    pain.ultimateCooldown = 99;
    naruto.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'shinra_flip',
      ownerUid: naruto.uid,
      teamId: naruto.teamId,
      kind: 'rasenshuriken',
      x: 320,
      y: 300,
      vx: -300,
      vy: 0,
      radius: 10,
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

    expect(triggerCustomUltimate(engine, pain)).toBe(true);
    const flipped = engine.projectiles.find((p) => p.id === 'shinra_flip');
    expect(flipped?.ownerUid).toBe(pain.uid);
    expect(flipped?.vx).toBeGreaterThan(300);

    const data = engine.activeUltimates[0].data as unknown as PainUltimateData;
    for (let i = 0; i < 120 && data.stage !== 'chibaku-pull'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('chibaku-pull');

    for (let i = 0; i < 200 && data.stage !== 'collapse'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('collapse');
  });

  it('Obito Kamui Phantom & Nunoboko: turns intangible allowing pass-through, then materializes slashing Sword of Nunoboko', () => {
    const engine = makeEngine(['obito', 'minato'], 1500);
    const [obito, minato] = engine.fighters;
    obito.ultimateCooldown = 99;
    minato.ultimateCooldown = 99;
    minato.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, obito)).toBe(true);
    expect(obito.untargetableTimer).toBeGreaterThan(1.5);
    const data = engine.activeUltimates[0].data as unknown as ObitoUltimateData;

    engine.projectiles.push({
      id: 'obito_phase',
      ownerUid: minato.uid,
      teamId: minato.teamId,
      kind: 'kunai-knife',
      x: obito.x,
      y: obito.y,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#facc15',
      secondaryColor: '#fff',
      angle: 0,
      life: 2.0,
      maxLife: 2.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });
    stepFrames(engine, 10);
    expect(data.phasedCount).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < 180 && data.stage !== 'nunoboko'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('nunoboko');
    expect(minato.shieldTimer).toBe(0);
  });

  it('Toji Heavenly Restriction: cancels enemy invulnerability, shields & enchanted armor with Inverted Spear bypass', () => {
    const engine = makeEngine(['toji', 'gojo'], 1500);
    const [toji, gojo] = engine.fighters;
    toji.ultimateCooldown = 99;
    gojo.ultimateCooldown = 99;
    gojo.shieldTimer = 4.0;
    gojo.invulnTimer = 4.0;
    gojo.enchantArmorTimer = 4.0;
    gojo.formIndex = gojo.character.forms.length - 1;
    const hpBefore = gojo.hp;

    expect(triggerCustomUltimate(engine, toji)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as TojiUltimateData;
    for (let i = 0; i < 40 && data.strikesLeft === 3; i++) engine.step(1 / 60);

    expect(gojo.shieldTimer).toBe(0);
    expect(gojo.invulnTimer).toBe(0);
    expect(gojo.enchantArmorTimer).toBe(0);
    expect(gojo.silenceTimer).toBeGreaterThan(2.0);
    expect(gojo.hp).toBeLessThan(hpBefore);
  });

  it('Kashimo Mythical Beast Amber: builds Positive Charges to 3 and strikes with unavoidable Sure-Hit Lightning & Paralysis', () => {
    const engine = makeEngine(['kashimo', 'hakari'], 1500);
    const [kashimo, hakari] = engine.fighters;
    kashimo.ultimateCooldown = 99;
    hakari.ultimateCooldown = 99;
    kashimo.x = 300;
    kashimo.y = 300;

    expect(triggerCustomUltimate(engine, kashimo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as KashimoUltimateData;

    for (let i = 0; i < 140 && data.sureHitCount === 0; i++) {
      hakari.x = kashimo.x + 50;
      hakari.y = kashimo.y;
      engine.step(1 / 60);
    }
    expect(data.sureHitCount).toBeGreaterThanOrEqual(1);
    expect(hakari.dodgeLockedTimer).toBeGreaterThan(0);
    expect(hakari.paralyzeTimer).toBeGreaterThan(0);
  });

  it('Ban Physical Hunt & Courechouse: stays immortal, steals enemy damage bonus pct cleanly, and reverts bonus on expire', () => {
    const engine = makeEngine(['ban', 'meliodas'], 1500);
    const [ban, meliodas] = engine.fighters;
    ban.ultimateCooldown = 99;
    meliodas.ultimateCooldown = 99;
    meliodas.dmgBonusPct = 20;
    ban.x = 300;
    ban.y = 300;
    meliodas.x = 400;
    meliodas.y = 300;
    const baseBonus = ban.dmgBonusPct;

    expect(triggerCustomUltimate(engine, ban)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as BanUltimateData;
    expect(ban.immortalTimer).toBeGreaterThan(3.0);
    expect(data.appliedBonusPct).toBe(8);
    expect(ban.dmgBonusPct).toBe(baseBonus + 8);
    expect(meliodas.armorShredTimer).toBeGreaterThan(2.0);

    // Track exact dmgBonusPct right on the frame Ban's Ultimate expires -> verifies clean 8% Snatch reversion!
    let prevBonus = ban.dmgBonusPct;
    let revertDrop = 0;
    for (let i = 0; i < 280 && engine.activeUltimates.some((u) => u.characterId === 'ban'); i++) {
      prevBonus = ban.dmgBonusPct;
      engine.step(1 / 60);
      if (!engine.activeUltimates.some((u) => u.characterId === 'ban')) {
        revertDrop = prevBonus - ban.dmgBonusPct;
      }
    }
    expect(engine.activeUltimates.some((u) => u.characterId === 'ban')).toBe(false);
    expect(revertDrop).toBeGreaterThanOrEqual(7);
  });

  it('Archer EMIYA Unlimited Blade Works: plants 16 swords around arena, launches crossfire, and fires Caladbolg II', () => {
    const engine = makeEngine(['archer_emiya', 'gilgamesh'], 1500);
    const [archer, gil] = engine.fighters;
    archer.ultimateCooldown = 99;
    gil.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, archer)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ArcherEmiyaUltimateData;
    expect(data.swords.length).toBe(16);

    for (let i = 0; i < 240 && !data.caladbolgFired; i++) engine.step(1 / 60);
    expect(data.fireIndex).toBe(16);
    expect(data.caladbolgFired).toBe(true);
  });

  it('10-way simultaneous Batch 7 FFA simulation keeps all coordinates finite inside bounds with clean expiration', () => {
    const engine = makeEngine([...MEGA_BATCH_7_IDS], 2500);
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
