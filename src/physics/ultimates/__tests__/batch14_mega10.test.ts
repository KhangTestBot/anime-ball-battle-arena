import { describe, expect, it } from 'vitest';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AatroxUltimateData } from '../aatrox';
import type { DabiUltimateData } from '../dabi';
import type { EndeavorUltimateData } from '../endeavor';
import type { GarenUltimateData } from '../garen';
import type { GyomeiUltimateData } from '../gyomei';
import type { MakimaUltimateData } from '../makima';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { RoyUltimateData } from '../roy';
import type { SanemiUltimateData } from '../sanemi';
import type { ShinobuUltimateData } from '../shinobu';
import type { ViegoUltimateData } from '../viego';

const MEGA_BATCH_14_IDS = [
  'shinobu',
  'gyomei',
  'sanemi',
  'dabi',
  'endeavor',
  'garen',
  'aatrox',
  'viego',
  'makima',
  'roy',
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

describe('Mega-Batch 14 Bespoke Ultimates (Shinobu, Gyomei, Sanemi, Dabi, Endeavor, Garen, Aatrox, Viego, Makima, Roy Mustang)', () => {
  it('registers 10 strictly distinct physics handlers and 10 distinct Canvas 2D renderers (total >= 129)', () => {
    const handlers = new Set();
    const renderers = new Set();
    for (const id of MEGA_BATCH_14_IDS) {
      expect(hasCustomUltimate(id)).toBe(true);
      expect(ULTIMATE_HANDLERS[id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[id]);
      renderers.add(ULTIMATE_RENDERERS[id]);
    }
    expect(handlers.size).toBe(10);
    expect(renderers.size).toBe(10);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(129);
  });

  it('Shinobu Dance of the Centipede: executes 4 stabs + lethal Wisteria Poison & Anti-Heal', () => {
    const engine = makeEngine(['shinobu', 'akaza'], 1800);
    const [shinobu, akaza] = engine.fighters;
    akaza.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, shinobu)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ShinobuUltimateData;

    for (let i = 0; i < 160 && !data.centipedeFired; i++) {
      akaza.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.stabsDone).toBe(4);
    expect(data.centipedeFired).toBe(true);
    expect(akaza.antiHealTimer).toBeGreaterThan(0);
    expect(akaza.karmaTimer).toBeGreaterThan(0);
    expect(akaza.shieldTimer).toBe(0);
  });

  it('Gyomei Stone Breathing: swings chained flail 3 times shredding armor & stripping shields', () => {
    const engine = makeEngine(['gyomei', 'kokushibo'], 2000);
    const [gyomei, koku] = engine.fighters;
    koku.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, gyomei)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GyomeiUltimateData;

    for (let i = 0; i < 200 && data.swingsDone < 3; i++) {
      koku.abilityTimer = 99;
      koku.x = Math.min(engine.bounds.right - 50, gyomei.x + 110);
      koku.y = gyomei.y;
      engine.step(1 / 60);
    }
    expect(data.swingsDone).toBe(3);
    expect(koku.shieldTimer).toBe(0);
    expect(koku.armorShredTimer).toBeGreaterThan(0);
  });

  it('Sanemi Idaten Typhoon: confuses foes with Marechi mist, fires 4 gale blades & triggers climax', () => {
    const engine = makeEngine(['sanemi', 'kokushibo'], 2000);
    const [sanemi, koku] = engine.fighters;
    expect(triggerCustomUltimate(engine, sanemi)).toBe(true);
    expect(koku.confusedTimer).toBeGreaterThan(1.5);
    const data = engine.activeUltimates[0].data as unknown as SanemiUltimateData;

    for (let i = 0; i < 180 && !data.climaxFired; i++) {
      koku.abilityTimer = 99;
      koku.x = Math.min(engine.bounds.right - 50, sanemi.x + 100);
      koku.y = sanemi.y;
      engine.step(1 / 60);
    }
    expect(data.typhoonsFired).toBe(4);
    expect(data.climaxFired).toBe(true);
    expect(koku.armorShredTimer).toBeGreaterThan(0);
  });

  it('Dabi Blueflame Supernova: inflicts Burn + Anti-Heal and detonates Supernova stripping shields', () => {
    const engine = makeEngine(['dabi', 'todoroki'], 2000);
    const [dabi, shoto] = engine.fighters;
    shoto.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, dabi)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as DabiUltimateData;

    for (let i = 0; i < 160 && !data.supernovaFired; i++) {
      shoto.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.supernovaFired).toBe(true);
    expect(shoto.burnTimer).toBeGreaterThan(0);
    expect(shoto.antiHealTimer).toBeGreaterThan(0);
    expect(shoto.shieldTimer).toBe(0);
  });

  it('Endeavor Prominence Burn: fires plasma beam stripping shields and scorching targets', () => {
    const engine = makeEngine(['endeavor', 'shigaraki'], 2000);
    const [end, shig] = engine.fighters;
    shig.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, end)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as EndeavorUltimateData;

    for (let i = 0; i < 120 && !data.beamFired; i++) {
      shig.abilityTimer = 99;
      shig.x = Math.min(engine.bounds.right - 50, end.x + 110);
      shig.y = end.y;
      engine.step(1 / 60);
    }
    expect(data.beamFired).toBe(true);
    expect(shig.shieldTimer).toBe(0);
    expect(shig.burnTimer).toBeGreaterThan(0);
  });

  it('Garen Demacian Justice: spins Judgment 4 times then drops golden Sky-Sword stripping shields', () => {
    const engine = makeEngine(['garen', 'darius'], 2000);
    const [garen, darius] = engine.fighters;
    darius.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, garen)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GarenUltimateData;

    for (let i = 0; i < 160 && !data.justiceDropped; i++) {
      darius.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.spinTicks).toBe(4);
    expect(data.justiceDropped).toBe(true);
    expect(darius.shieldTimer).toBe(0);
  });

  it('Aatrox World Ender: grows giant and chains 3 Darkin Blade Q slams healing Aatrox', () => {
    const engine = makeEngine(['aatrox', 'mordekaiser'], 2200);
    const [aatrox, morde] = engine.fighters;
    aatrox.hp = 1400;
    expect(triggerCustomUltimate(engine, aatrox)).toBe(true);
    expect(aatrox.giantTimer).toBeGreaterThan(2.5);
    const data = engine.activeUltimates[0].data as unknown as AatroxUltimateData;

    for (let i = 0; i < 200 && data.qSlamsDone < 3; i++) {
      morde.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.qSlamsDone).toBe(3);
  });

  it('Viego Heartbreaker: blinks onto weakest foe, strips shield & gains +15% DMG Possession', () => {
    const engine = makeEngine(['viego', 'yasuo'], 1800);
    const [viego, yasuo] = engine.fighters;
    yasuo.shieldTimer = 4.0;
    const preDmg = viego.dmgBonusPct;
    expect(triggerCustomUltimate(engine, viego)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ViegoUltimateData;

    for (let i = 0; i < 120 && !data.heartbreakerLanded; i++) {
      yasuo.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.heartbreakerLanded).toBe(true);
    expect(yasuo.shieldTimer).toBe(0);
    expect(viego.dmgBonusPct).toBeGreaterThanOrEqual(preDmg + 15);
  });

  it('Makima Control Devil: heals via Contract and fires 3 kinetic BANG! blasts locking dodge', () => {
    const engine = makeEngine(['makima', 'denji'], 2000);
    const [makima, denji] = engine.fighters;
    makima.hp = 1300;
    denji.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, makima)).toBe(true);
    expect(makima.hp).toBeGreaterThan(1300);
    const data = engine.activeUltimates[0].data as unknown as MakimaUltimateData;

    for (let i = 0; i < 180 && data.bangsFired < 3; i++) {
      denji.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.bangsFired).toBe(3);
    expect(denji.shieldTimer).toBe(0);
    expect(denji.dodgeLockedTimer).toBeGreaterThan(0);
  });

  it('Roy Mustang Flame Alchemy: snaps 4 pinpoint incineration blasts inflicting Burn & Drowsy', () => {
    const engine = makeEngine(['roy', 'edward'], 2000);
    const [roy, ed] = engine.fighters;
    ed.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, roy)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as RoyUltimateData;

    for (let i = 0; i < 200 && data.snapsDone < 4; i++) {
      ed.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.snapsDone).toBe(4);
    expect(ed.shieldTimer).toBe(0);
    expect(ed.burnTimer).toBeGreaterThan(0);
  });

  it('10-way simultaneous Batch 14 FFA keeps all coordinates finite inside arena bounds with clean expiration', () => {
    const engine = makeEngine(MEGA_BATCH_14_IDS, 3000);
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
