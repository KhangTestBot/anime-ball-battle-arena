import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { Android17UltimateData } from '../android17';
import type { BuuUltimateData } from '../buu';
import type { HitUltimateData } from '../hit';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ZeldrisUltimateData } from '../zeldris';

const BATCH_23_IDS = [
  'buu',
  'trunks',
  'piccolo',
  'hit',
  'bardock',
  'android17',
  'android18',
  'king_sds',
  'diane',
  'merlin_sds',
  'gowther',
  'estarossa',
  'zeldris',
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

describe('Batch 23 — Double 100% Sweep: Dragon Ball (18/18) + The Seven Deadly Sins (9/9)', () => {
  it('completes 100% of Dragon Ball & The Seven Deadly Sins with distinct handlers & renderers (total >= 244)', () => {
    const db = CHARACTER_ROSTER.filter((c) => c.series === 'Dragon Ball');
    const sds = CHARACTER_ROSTER.filter((c) => c.series === 'The Seven Deadly Sins');
    expect(db.length).toBe(18);
    expect(sds.length).toBe(9);

    const all = [...db, ...sds];
    const handlers = new Set();
    const renderers = new Set();
    for (const ch of all) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(27);
    expect(renderers.size).toBe(27);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(244);
  });

  it('Majin Buu Regeneration survives fatal KO & Hit executes 4 Time-Skip blinks + Molotov', () => {
    const engine = makeEngine(['buu', 'hit'], 3000);
    const [buu, hit] = engine.fighters;
    expect(triggerCustomUltimate(engine, buu)).toBe(true);
    expect(triggerCustomUltimate(engine, hit)).toBe(true);
    expect(buu.totemActive).toBe(true);

    const bData = engine.activeUltimates[0].data as unknown as BuuUltimateData;
    const hData = engine.activeUltimates[1].data as unknown as HitUltimateData;

    // Majin Buu's regeneration intercepts fatal KO!
    engine.applyDamage(hit, buu, 99999, 0, 0, { bypassInvuln: true });
    expect(buu.alive).toBe(true);
    expect(buu.totemActive).toBe(false);

    buu.ultimateCharge = 0;
    buu.ultimateCooldown = 99;
    hit.ultimateCharge = 0;
    hit.ultimateCooldown = 99;
    buu.hp = buu.maxHp;

    for (let i = 0; i < 200 && (!bData.planetBurstFired || !hData.molotovFired); i++) {
      engine.step(1 / 60);
    }
    expect(bData.blastsDone).toBe(3);
    expect(bData.planetBurstFired).toBe(true);
    expect(hData.skipsDone).toBe(4);
    expect(hData.molotovFired).toBe(true);
  });

  it('Android 17 Barrier erases enemy projectiles & Zeldris Ominous Nebula completes cleanly', () => {
    const engine = makeEngine(['android17', 'zeldris'], 3000);
    const [a17, zeldris] = engine.fighters;
    a17.ultimateCooldown = 99;
    zeldris.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'zeldris_orb',
      ownerUid: zeldris.uid,
      ownerCharId: zeldris.character.id,
      ownerSeries: zeldris.character.series,
      teamId: zeldris.teamId,
      kind: 'zoltraak-orb',
      x: a17.x + 70,
      y: a17.y,
      vx: -200,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#dc2626',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, a17)).toBe(true);
    expect(triggerCustomUltimate(engine, zeldris)).toBe(true);

    const aData = engine.activeUltimates[0].data as unknown as Android17UltimateData;
    const zData = engine.activeUltimates[1].data as unknown as ZeldrisUltimateData;

    for (let i = 0; i < 200 && (!aData.strikeFired || !zData.cleaveFired); i++) {
      engine.step(1 / 60);
    }
    expect(aData.blockedProjectiles).toBeGreaterThanOrEqual(1);
    expect(aData.strikeFired).toBe(true);
    expect(zData.nebulaTicks).toBe(4);
    expect(zData.cleaveFired).toBe(true);
  });

  it('13-way Dragon Ball & Seven Deadly Sins FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_23_IDS, 4500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(13);

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
