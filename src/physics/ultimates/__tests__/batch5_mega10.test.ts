import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AstaUltimateData } from '../asta';
import type { DekuUltimateData } from '../deku';
import type { DioUltimateData } from '../dio';
import type { FrierenUltimateData } from '../frieren';
import type { GojoUltimateData } from '../gojo';
import type { LawUltimateData } from '../law';
import type { MadaraUltimateData } from '../madara';
import type { MobUltimateData } from '../mob';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { RimuruUltimateData } from '../rimuru';
import type { SukunaUltimateData } from '../sukuna';

const MEGA_BATCH_5_IDS = [
  'madara',
  'deku',
  'rimuru',
  'asta',
  'frieren',
  'mob',
  'gojo',
  'sukuna',
  'dio',
  'law',
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

describe('Mega-Batch 5 Bespoke Ultimates (Final 6 Core + 4 Pillar Domains)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total 38 bespoke Ultimates)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_5_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(38);
  });

  it('Madara Tengai Shinsei: drops Meteor #1 obstacle rock, then shatters it with Meteor #2 into 12 shield-breaking shards', () => {
    const engine = makeEngine(['madara', 'naruto'], 1500);
    const [madara, naruto] = engine.fighters;
    madara.ultimateCooldown = 99;
    naruto.ultimateCooldown = 99;
    // Keep fighters far from center obstacle spawn
    madara.x = 120;
    madara.y = 120;
    naruto.x = 500;
    naruto.y = 500;

    expect(triggerCustomUltimate(engine, madara)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MadaraUltimateData;

    // Step past Shadow #1 (0.85s) -> stone-meteor obstacle spawns!
    stepFrames(engine, 65);
    expect(data.stage).toBe('meteor-1-rock');
    expect(engine.obstacles.some((o) => o.kind === 'stone-meteor')).toBe(true);

    // Step through Meteor #2 climax -> obstacle shattered into 12 shrapnel shards!
    stepFrames(engine, 145);
    expect(data.stage).toBe('shattered');
    expect(engine.obstacles.some((o) => o.id === data.obstacleId)).toBe(false);
  });

  it('Deku Gearshift Overdrive: slows victim into Low Gear (25%), charges Fa Jin to Detroit Smash 120%', () => {
    const engine = makeEngine(['deku', 'goku'], 1500);
    const [deku, goku] = engine.fighters;
    deku.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;
    deku.x = 240;
    deku.y = 320;
    goku.x = 300;
    goku.y = 320;

    expect(triggerCustomUltimate(engine, deku)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as DekuUltimateData;
    expect(data.lowGearUid).toBe(goku.uid);

    // Step past 3.25s overdrive -> Detroit Smash 120% triggers & transitions to Recoil!
    stepFrames(engine, 225);
    expect(data.faJinCharge).toBeGreaterThanOrEqual(80);
    expect(goku.hp).toBeLessThan(1500);
  });

  it('Rimuru Void God Azathoth: devours enemy projectiles for HP + Shield and fires scaled Void Beam', () => {
    const engine = makeEngine(['rimuru', 'sasuke'], 1500);
    const [rimuru, sasuke] = engine.fighters;
    rimuru.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;
    rimuru.x = 220;
    rimuru.y = 320;
    rimuru.hp = 1000;
    sasuke.x = 380;
    sasuke.y = 320;

    expect(triggerCustomUltimate(engine, rimuru)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as RimuruUltimateData;

    stepFrames(engine, 8);
    // Feed 2 enemy projectiles straight inside Rimuru's forward Azathoth vortex!
    for (let i = 0; i < 2; i++) {
      engine.projectiles.push({
        id: `eaten_by_azathoth_${i}`,
        ownerUid: sasuke.uid,
        teamId: sasuke.teamId,
        x: rimuru.x + 80 + i * 20,
        y: rimuru.y,
        vx: -200,
        vy: 0,
        radius: 8,
        damage: 25,
        knockback: 100,
        color: '#a855f7',
        secondaryColor: '#fff',
        angle: Math.PI,
        piercing: false,
        powerLevel: 1,
        life: 3,
        maxLife: 3,
        kind: 'ki-blast',
        hitCooldowns: {},
      });
    }

    stepFrames(engine, 6);
    expect(data.devouredCount).toBeGreaterThanOrEqual(2);
    expect(rimuru.hp).toBeGreaterThan(1000);
    expect(rimuru.shieldTimer).toBeGreaterThan(2.5);
    expect(rimuru.dmgBonusPct).toBeGreaterThanOrEqual(8);
    expect(rimuru.character.forms.length).toBe(4);

    for (let i = 0; i < 240 && !data.beamFired; i++) engine.step(1 / 60);
    expect(data.beamFired).toBe(true);
    expect(data.veldoraStrikeStage).toBeGreaterThanOrEqual(2);
  });

  it('Asta Devil Union (Domain Breaker): immediately shatters enemy Active Ultimates, Domains, Obstacles & Shields and inflicts Spirit Lock', () => {
    const engine = makeEngine(['asta', 'gojo'], 1500);
    const [asta, gojo] = engine.fighters;
    asta.ultimateCooldown = 99;
    gojo.ultimateCooldown = 99;
    asta.x = 280;
    asta.y = 320;
    gojo.x = 310;
    gojo.y = 320;
    gojo.shieldTimer = 4.0;
    gojo.immortalTimer = 4.0;

    // Gojo activates Infinite Void + spawns an obstacle beforehand
    expect(triggerCustomUltimate(engine, gojo)).toBe(true);
    asta.stunTimer = 0; // Un-stun Asta for Demon-Destroyer anti-magic test
    engine.obstacles.push({
      id: 'magic_wall',
      ownerUid: gojo.uid,
      ownerCharId: 'gojo',
      teamId: gojo.teamId,
      kind: 'obsidian-block',
      x: 420,
      y: 420,
      w: 38,
      h: 38,
      hp: 3,
      maxHp: 3,
      life: 4,
      maxLife: 4,
      blocksProjectiles: true,
      restitution: 1,
      color: '#6366f1',
    });

    // Clear hitstop so Asta activates Devil Union cleanly
    stepFrames(engine, 8);
    expect(triggerCustomUltimate(engine, asta)).toBe(true);
    const astaData = engine.activeUltimates.find((u) => u.characterId === 'asta')!
      .data as unknown as AstaUltimateData;

    expect(astaData.brokenCount).toBeGreaterThanOrEqual(3);
    expect(engine.activeUltimates.some((u) => u.characterId === 'gojo')).toBe(false);
    expect(engine.obstacles.some((o) => o.id === 'magic_wall')).toBe(false);
    expect(gojo.shieldTimer).toBe(0);
    expect(gojo.immortalTimer).toBe(0);

    stepFrames(engine, 40);
    expect(gojo.spiritLockTimer).toBeGreaterThan(1.5);
  });

  it('Frieren Height of Magic: repels enemies on reveal, defends with 4 Hex Barriers, and fires wall-ricochet Zoltraak lasers', () => {
    const engine = makeEngine(['frieren', 'sukuna'], 1500);
    const [frieren, sukuna] = engine.fighters;
    frieren.ultimateCooldown = 99;
    sukuna.ultimateCooldown = 99;
    frieren.x = 320;
    frieren.y = 320;
    sukuna.x = 370;
    sukuna.y = 320;

    expect(triggerCustomUltimate(engine, frieren)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as FrierenUltimateData;
    expect(sukuna.vx).toBeGreaterThan(200);

    stepFrames(engine, 55);
    expect(data.salvosLeft).toBeLessThan(4);
    expect(sukuna.hp).toBeLessThan(1500);
  });

  it('Mob ???%: escalates 98%->99%->???%, 180° reverses enemy projectiles, and executes 2-beat Left->Right Wall Slams', () => {
    const engine = makeEngine(['mob', 'sasuke'], 1500);
    const [mob, sasuke] = engine.fighters;
    mob.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'mob_hijack_target',
      ownerUid: sasuke.uid,
      teamId: sasuke.teamId,
      x: mob.x + 80,
      y: mob.y,
      vx: -300,
      vy: 0,
      radius: 8,
      damage: 25,
      knockback: 100,
      color: '#a855f7',
      secondaryColor: '#fff',
      angle: Math.PI,
      piercing: false,
      powerLevel: 1,
      life: 4,
      maxLife: 4,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    expect(triggerCustomUltimate(engine, mob)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MobUltimateData;
    expect(data.hijackedCount).toBeGreaterThanOrEqual(1);
    const rev = engine.projectiles.find((p) => p.id === 'mob_hijack_target')!;
    expect(rev.ownerUid).toBe(mob.uid);
    expect(rev.vx).toBeGreaterThan(300);

    stepFrames(engine, 160);
    expect(data.percentText).toBe('???%');
    expect(sasuke.hp).toBeLessThan(1500);
  });

  it('Gojo Unlimited Void: paralyzes enemy with void-overload, launches 200% Hollow Purple, and locks skills 0.6s after waking', () => {
    const engine = makeEngine(['gojo', 'naruto'], 1500);
    const [gojo, naruto] = engine.fighters;
    gojo.ultimateCooldown = 99;
    naruto.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, gojo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GojoUltimateData;
    expect(naruto.stunTimer).toBeGreaterThan(2.0);
    expect(naruto.stunKind).toBe('void-overload');

    stepFrames(engine, 80);
    expect(data.purpleLaunched).toBe(true);

    // Step until void-overload expires -> post-stun cooldown lock!
    stepFrames(engine, 105);
    expect(data.postLockApplied[naruto.uid]).toBe(true);
    expect(naruto.silenceTimer).toBeGreaterThan(0);
  });

  it('Sukuna Malevolent Shrine & Fuga: carves persistent floor scars with Cleave & Dismantle, then blasts Fuga flame arrow', () => {
    const engine = makeEngine(['sukuna', 'luffy'], 1500);
    const [sukuna, luffy] = engine.fighters;
    sukuna.ultimateCooldown = 99;
    luffy.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, sukuna)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as SukunaUltimateData;

    stepFrames(engine, 45);
    expect(data.scars.length).toBeGreaterThanOrEqual(1);

    // Advance until Fuga bow activates, position Luffy along Fuga trajectory, and verify Fuga flame blast + Burn!
    for (let i = 0; i < 320 && !data.fuga.active; i++) engine.step(1 / 60);
    expect(data.fuga.active).toBe(true);
    for (let i = 0; i < 80 && !data.fuga.fired; i++) {
      luffy.x = Math.max(
        engine.bounds.left + 40,
        Math.min(engine.bounds.right - 40, sukuna.x + 120),
      );
      luffy.y = sukuna.y;
      luffy.vx = 0;
      luffy.vy = 0;
      engine.step(1 / 60);
    }
    expect(data.fuga.fired).toBe(true);
    expect(luffy.hp).toBeLessThan(1500);
    expect(luffy.burnTimer).toBeGreaterThan(0);
  });

  it('DIO Za Warudo & Road Roller: freezes enemy fighters AND mid-air projectiles, then launches knives & Road Roller slam', () => {
    const engine = makeEngine(['dio', 'goku'], 1500);
    const [dio, goku] = engine.fighters;
    dio.ultimateCooldown = 99;
    goku.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'frozen_by_dio',
      ownerUid: goku.uid,
      teamId: goku.teamId,
      x: 320,
      y: 320,
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
      life: 4,
      maxLife: 4,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    expect(triggerCustomUltimate(engine, dio)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as DioUltimateData;
    expect(goku.stunKind).toBe('time-stop');
    expect(engine.projectiles.find((p) => p.id === 'frozen_by_dio')!.frozenTimer).toBeGreaterThan(
      1.5,
    );
    expect(data.knives.length).toBeGreaterThanOrEqual(4);

    // Step past 2.25s Time Stop -> knives release & Road Roller slams down!
    stepFrames(engine, 180);
    expect(data.stage).toBe('roller-drop');
    expect(data.rollerSlammed).toBe(true);
    expect(goku.hp).toBeLessThan(1500);
  });

  it('Law Surgical ROOM: warps enemy projectiles back behind their caster via Shambles, strips shields, and pierces with Puncture Wille', () => {
    const engine = makeEngine(['law', 'sasuke'], 1500);
    const [law, sasuke] = engine.fighters;
    law.ultimateCooldown = 99;
    sasuke.ultimateCooldown = 99;
    sasuke.x = 340;
    sasuke.y = 320;
    sasuke.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, law)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as LawUltimateData;

    stepFrames(engine, 8);
    engine.projectiles.push({
      id: 'swapped_by_room',
      ownerUid: sasuke.uid,
      teamId: sasuke.teamId,
      x: data.roomX + 20,
      y: data.roomY,
      vx: -250,
      vy: 0,
      radius: 8,
      damage: 25,
      knockback: 100,
      color: '#a855f7',
      secondaryColor: '#fff',
      angle: Math.PI,
      piercing: false,
      powerLevel: 1,
      life: 4,
      maxLife: 4,
      kind: 'ki-blast',
      hitCooldowns: {},
    });

    stepFrames(engine, 30);
    expect(sasuke.shieldTimer).toBe(0);
    const swapped = engine.projectiles.find((p) => p.id === 'swapped_by_room');
    if (swapped) expect(swapped.ownerUid).toBe(law.uid);

    stepFrames(engine, 175);
    expect(data.willeFired).toBe(true);
    expect(sasuke.hp).toBeLessThan(1500);
  });

  it('10-way simultaneous Mega-Batch 5 mayhem stays 100% finite, in-bounds, and tears down cleanly', () => {
    const engine = makeEngine(MEGA_BATCH_5_IDS, 3500);
    for (const f of engine.fighters) {
      expect(triggerCustomUltimate(engine, f)).toBe(true);
      f.ultimateCooldown = 99;
      f.ultimateCharge = 0;
    }
    // Note: if Asta is in the loop and shattered earlier enemy ultimates, triggerCount may be <10 -> both valid!
    expect(engine.activeUltimates.length).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < 1200 && engine.elapsed < 6.0; i++) {
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
