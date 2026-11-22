import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { BrunoUltimateData } from '../bruno';
import type { KarsUltimateData } from '../kars';
import type { KiraUltimateData } from '../kira';
import type { PolnareffUltimateData } from '../polnareff';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_29_IDS = [
  'josuke',
  'joseph',
  'jonathan',
  'jolyne',
  'kira',
  'diavolo',
  'pucci',
  'kars',
  'polnareff',
  'kakyoin',
  'bruno',
  'rohan',
] as const;

function makeEngine(ids: readonly string[], baseHp = 2600): BattleEngine {
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

describe("Batch 29 — JoJo's Bizarre Adventure Complete 15/15 Bespoke Ultimates (312+ total)", () => {
  it("completes 100% of JoJo's Bizarre Adventure (15/15) with distinct handlers & renderers (total >= 312)", () => {
    const jojo = CHARACTER_ROSTER.filter((c) => c.series === "JoJo's Bizarre Adventure");
    expect(jojo.length).toBe(15);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of jojo) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(15);
    expect(renderers.size).toBe(15);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(312);
  });

  it('Kira Bites the Dust & Ultimate Kars Totem both intercept fatal KO and fire finishers', () => {
    const engine = makeEngine(['kira', 'kars'], 3000);
    const [kira, kars] = engine.fighters;
    expect(triggerCustomUltimate(engine, kira)).toBe(true);
    expect(triggerCustomUltimate(engine, kars)).toBe(true);
    expect(kira.totemActive).toBe(true);
    expect(kars.totemActive).toBe(true);

    const kiraData = engine.activeUltimates[0].data as unknown as KiraUltimateData;
    const karsData = engine.activeUltimates[1].data as unknown as KarsUltimateData;

    // Kira's Bites the Dust intercepts fatal KO!
    engine.applyDamage(kars, kira, 99999, 0, 0, { bypassInvuln: true });
    expect(kira.alive).toBe(true);
    expect(kira.totemActive).toBe(false);

    kira.ultimateCharge = 0;
    kira.ultimateCooldown = 99;
    kars.ultimateCharge = 0;
    kars.ultimateCooldown = 99;
    kira.hp = kira.maxHp;

    for (let i = 0; i < 200 && (!kiraData.btdFired || !karsData.solarFired); i++) {
      engine.step(1 / 60);
    }
    expect(kiraData.bombsDone).toBe(3);
    expect(kiraData.btdFired).toBe(true);
    expect(karsData.bladesDone).toBe(3);
    expect(karsData.solarFired).toBe(true);
  });

  it('Bruno Sticky Fingers unzips enemy projectiles & Polnareff Armor Off chains 5 rapier thrusts', () => {
    const engine = makeEngine(['bruno', 'polnareff'], 3000);
    const [bruno, polnareff] = engine.fighters;
    bruno.ultimateCooldown = 99;
    polnareff.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'test_jojo_proj',
      ownerUid: polnareff.uid,
      ownerCharId: polnareff.character.id,
      ownerSeries: polnareff.character.series,
      teamId: polnareff.teamId,
      kind: 'sword-wave',
      x: bruno.x + 80,
      y: bruno.y,
      vx: -200,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#cbd5e1',
      secondaryColor: '#38bdf8',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, bruno)).toBe(true);
    expect(triggerCustomUltimate(engine, polnareff)).toBe(true);

    const bData = engine.activeUltimates[0].data as unknown as BrunoUltimateData;
    const pData = engine.activeUltimates[1].data as unknown as PolnareffUltimateData;

    for (let i = 0; i < 200 && (!bData.arrivederciFired || !pData.millionFired); i++) {
      engine.step(1 / 60);
    }
    expect(bData.unzippedProjectiles).toBeGreaterThanOrEqual(1);
    expect(bData.zipsDone).toBe(4);
    expect(bData.arrivederciFired).toBe(true);
    expect(pData.thrustsDone).toBe(5);
    expect(pData.millionFired).toBe(true);
  });

  it("12-way JoJo's Bizarre Adventure Stand Battle FFA stays finite, in-bounds, and expires cleanly", () => {
    const engine = makeEngine(BATCH_29_IDS, 5200);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(12);

    for (let i = 0; i < 560; i++) {
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
