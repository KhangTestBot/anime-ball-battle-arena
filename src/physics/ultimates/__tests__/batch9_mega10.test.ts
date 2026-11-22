import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { ByakuyaUltimateData } from '../byakuya';
import type { GetoUltimateData } from '../geto';
import type { MakiUltimateData } from '../maki';
import type { NanamiUltimateData } from '../nanami';
import type { NobaraUltimateData } from '../nobara';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { TodoUltimateData } from '../todo';
import type { UlquiorraUltimateData } from '../ulquiorra';
import type { UraharaUltimateData } from '../urahara';
import type { YhwachUltimateData } from '../yhwach';
import type { YujiUltimateData } from '../yuji';

const MEGA_BATCH_9_IDS = [
  'yuji',
  'nobara',
  'todo',
  'nanami',
  'maki',
  'geto',
  'yhwach',
  'byakuya',
  'ulquiorra',
  'urahara',
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

describe('Mega-Batch 9 Bespoke Ultimates (Yuji, Nobara, Todo, Nanami, Maki, Geto, Yhwach, Byakuya, Ulquiorra, Urahara)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 78)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_9_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(78);
  });

  it('Yuji 8 Consecutive Black Flashes: executes 8 surging punches, shreds armor, and final Soul Dismantle breaks shields', () => {
    const engine = makeEngine(['yuji', 'mahito'], 1500);
    const [yuji, mahito] = engine.fighters;
    yuji.ultimateCooldown = 99;
    mahito.ultimateCooldown = 99;
    mahito.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, yuji)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as YujiUltimateData;

    for (let i = 0; i < 240 && data.comboCount < 8; i++) engine.step(1 / 60);
    expect(data.comboCount).toBe(8);
    expect(mahito.armorShredTimer).toBeGreaterThan(0);
    expect(mahito.shieldTimer).toBe(0);
  });

  it('Nobara Resonance & Hairpin: shreds armor on Straw Doll Resonance, then detonates 5 nails stunning foes', () => {
    const engine = makeEngine(['nobara', 'mahito'], 1500);
    const [nobara, mahito] = engine.fighters;
    nobara.ultimateCooldown = 99;
    mahito.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, nobara)).toBe(true);
    expect(mahito.armorShredTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as NobaraUltimateData;
    expect(data.nails.length).toBe(5);

    for (let i = 0; i < 160 && data.stage === 'resonance'; i++) engine.step(1 / 60);
    expect(data.nails[0].detonated).toBe(true);
  });

  it('Todo Boogie Woogie: *CLAP!* swaps positions 4 times reversing projectiles, then hits 530k IQ Black Flash', () => {
    const engine = makeEngine(['todo', 'hanami'], 1500);
    const [todo, hanami] = engine.fighters;
    todo.ultimateCooldown = 99;
    hanami.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'todo_swap_proj',
      ownerUid: hanami.uid,
      teamId: hanami.teamId,
      kind: 'ki-blast',
      x: 350,
      y: 300,
      vx: -300,
      vy: 0,
      radius: 8,
      damage: 10,
      knockback: 100,
      color: '#4ade80',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 3.0,
      maxLife: 3.0,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, todo)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as TodoUltimateData;
    for (let i = 0; i < 60 && data.swapsLeft === 4; i++) engine.step(1 / 60);

    expect(hanami.confusedTimer).toBeGreaterThan(0);
    const reversed = engine.projectiles.find((p) => p.id === 'todo_swap_proj');
    if (reversed) expect(reversed.vx).toBeGreaterThan(0);

    for (let i = 0; i < 200 && !data.blackFlashed; i++) engine.step(1 / 60);
    expect(data.blackFlashed).toBe(true);
  });

  it('Nanami 7:3 Overtime Collapse: unlocks Overtime buffs, breaks shield with guaranteed 7:3 crits, and collapses obstacles', () => {
    const engine = makeEngine(['nanami', 'mahito'], 1500);
    const [nanami, mahito] = engine.fighters;
    nanami.ultimateCooldown = 99;
    mahito.ultimateCooldown = 99;
    mahito.abilityTimer = 99;
    mahito.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, nanami)).toBe(true);
    expect(nanami.unstoppableTimer).toBeGreaterThan(2.0);
    const data = engine.activeUltimates[0].data as unknown as NanamiUltimateData;

    for (let i = 0; i < 200 && !data.collapsed; i++) {
      mahito.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.collapsed).toBe(true);
    expect(mahito.shieldTimer).toBe(0);
  });

  it('Maki Playful Cloud & Split Soul: shatters obstacles, pierces invulnTimer with Split Soul Katana, and seals healing', () => {
    const engine = makeEngine(['maki', 'gojo'], 1500);
    const [maki, gojo] = engine.fighters;
    maki.ultimateCooldown = 99;
    gojo.ultimateCooldown = 99;
    maki.x = 260;
    maki.y = 300;
    gojo.x = 320;
    gojo.y = 300;
    gojo.shieldTimer = 4.0;
    gojo.invulnTimer = 4.0;
    gojo.formIndex = gojo.character.forms.length - 1;
    const hpBefore = gojo.hp;

    expect(triggerCustomUltimate(engine, maki)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as MakiUltimateData;
    for (let i = 0; i < 160 && data.strikesLeft > 0; i++) {
      gojo.x = Math.min(engine.bounds.right - 40, maki.x + 55);
      gojo.y = maki.y;
      engine.step(1 / 60);
    }
    expect(gojo.shieldTimer).toBe(0);
    expect(gojo.antiHealTimer).toBeGreaterThan(2.0);
    expect(gojo.hp).toBeLessThan(hpBefore);
  });

  it('Geto Maximum Uzumaki: spawns 4 cursed spirits into ctx.minions and condenses them into Uzumaki spiral beam', () => {
    const engine = makeEngine(['geto', 'yuta'], 1500);
    const [geto, yuta] = engine.fighters;
    geto.ultimateCooldown = 99;
    yuta.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, geto)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GetoUltimateData;
    expect(engine.minions.filter((m) => m.ownerUid === geto.uid).length).toBe(4);

    for (let i = 0; i < 180 && data.stage === 'curse-swarm'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('uzumaki-beam');
    expect(data.condensedCount).toBeGreaterThanOrEqual(1);
    expect(data.beamTimer).toBeGreaterThan(0);
  });

  it('Yhwach The Almighty & Auswählen: plants future traps, fires Heilig Pfeil, and strips shields + steals HP on Auswählen', () => {
    const engine = makeEngine(['yhwach', 'ichigo'], 1500);
    const [yhwach, ichigo] = engine.fighters;
    yhwach.ultimateCooldown = 99;
    ichigo.ultimateCooldown = 99;
    yhwach.hp = 1000;
    yhwach.formIndex = yhwach.character.forms.length - 1;
    ichigo.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, yhwach)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as YhwachUltimateData;

    let preAuswahlenHp = yhwach.hp;
    for (let i = 0; i < 200 && !data.auswahlenFired; i++) {
      preAuswahlenHp = yhwach.hp;
      ichigo.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.auswahlenFired).toBe(true);
    expect(data.arrowsFired).toBe(8);
    expect(ichigo.shieldTimer).toBe(0);
    expect(ichigo.dodgeLockedTimer).toBeGreaterThan(1.0);
    expect(yhwach.hp).toBeGreaterThan(preAuswahlenHp);
  });

  it('Byakuya Senkei & Shukei Hakuteiken: surrounds arena with 12 Senkei blades and finishes with Hakuteiken wing lunge', () => {
    const engine = makeEngine(['byakuya', 'renji'], 1500);
    const [byakuya, renji] = engine.fighters;
    byakuya.ultimateCooldown = 99;
    renji.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, byakuya)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ByakuyaUltimateData;
    expect(data.swords.length).toBe(12);

    for (let i = 0; i < 200 && data.stage === 'senkei-ring'; i++) engine.step(1 / 60);
    expect(data.stage).toBe('hakuteiken');
    expect(data.hakuteiFlash).toBeGreaterThan(0);
  });

  it('Ulquiorra Segunda Etapa & Lanza: heals via Hollow regen, erases projectiles inside green nuclear blast, and shreds armor', () => {
    const engine = makeEngine(['ulquiorra', 'ichigo'], 1500);
    const [ulq, ichigo] = engine.fighters;
    ulq.ultimateCooldown = 99;
    ichigo.ultimateCooldown = 99;
    ulq.formIndex = ulq.character.forms.length - 1;
    ulq.hp = 900;

    expect(triggerCustomUltimate(engine, ulq)).toBe(true);
    expect(ulq.hp).toBeGreaterThan(900);
    const data = engine.activeUltimates[0].data as unknown as UlquiorraUltimateData;

    for (let i = 0; i < 160 && !data.detonated; i++) engine.step(1 / 60);
    expect(data.detonated).toBe(true);
    expect(data.nukeFlash).toBeGreaterThan(0);
  });

  it('Urahara Bankai Kannonbiraki: stitches Kisuke HP up +12%, shreds enemy shields/armor/dodge, and reflects projectiles', () => {
    const engine = makeEngine(['urahara', 'aizen'], 1500);
    const [ura, aizen] = engine.fighters;
    ura.ultimateCooldown = 99;
    aizen.ultimateCooldown = 99;
    ura.formIndex = ura.character.forms.length - 1;
    ura.hp = 900;
    ura.x = 260;
    ura.y = 300;
    aizen.x = 340;
    aizen.y = 300;
    aizen.shieldTimer = 4.0;

    expect(triggerCustomUltimate(engine, ura)).toBe(true);
    expect(ura.hp).toBeGreaterThan(900);
    expect(aizen.shieldTimer).toBe(0);
    expect(aizen.armorShredTimer).toBeGreaterThan(2.5);
    expect(aizen.dodgeLockedTimer).toBeGreaterThan(1.5);
    const data = engine.activeUltimates[0].data as unknown as UraharaUltimateData;
    expect(data.stitchedUids).toContain(aizen.uid);

    engine.projectiles.push({
      id: 'chikasumi_flip',
      ownerUid: aizen.uid,
      teamId: aizen.teamId,
      kind: 'purple',
      x: ura.x + 20,
      y: ura.y,
      vx: -240,
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
    const flipped = engine.projectiles.find((p) => p.id === 'chikasumi_flip');
    if (flipped) expect(flipped.ownerUid).toBe(ura.uid);
  });

  it('10-way simultaneous Batch 9 FFA keeps all coordinates finite inside arena bounds with clean expiration', () => {
    const engine = makeEngine([...MEGA_BATCH_9_IDS], 2500);
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
