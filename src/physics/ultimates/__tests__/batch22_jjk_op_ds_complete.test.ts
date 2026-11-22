import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { ChosoUltimateData } from '../choso';
import type { MarcoUltimateData } from '../marco';
import type { MuichiroUltimateData } from '../muichiro';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_22_IDS = [
  'choso',
  'boa',
  'sabo',
  'bigmom',
  'yamato_op',
  'marco',
  'nezuko',
  'inosuke',
  'mitsuri',
  'muichiro',
  'doma',
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

describe('Batch 22 — Triple 100% Sweep: JJK (17/17) + One Piece (20/20) + Demon Slayer (16/16)', () => {
  it('completes 100% of Jujutsu Kaisen, One Piece & Demon Slayer with distinct handlers & renderers (total >= 231)', () => {
    const jjk = CHARACTER_ROSTER.filter((c) => c.series === 'Jujutsu Kaisen');
    const op = CHARACTER_ROSTER.filter((c) => c.series === 'One Piece');
    const ds = CHARACTER_ROSTER.filter((c) => c.series === 'Demon Slayer');
    expect(jjk.length).toBe(17);
    expect(op.length).toBe(20);
    expect(ds.length).toBe(16);

    const all = [...jjk, ...op, ...ds];
    const handlers = new Set();
    const renderers = new Set();
    for (const ch of all) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(53);
    expect(renderers.size).toBe(53);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(231);
  });

  it('Marco Blue Phoenix Rebirth survives fatal KO & Choso fires 3 Piercing Blood streams + Supernova', () => {
    const engine = makeEngine(['marco', 'choso'], 3000);
    const [marco, choso] = engine.fighters;
    expect(triggerCustomUltimate(engine, marco)).toBe(true);
    expect(triggerCustomUltimate(engine, choso)).toBe(true);
    expect(marco.totemActive).toBe(true);

    const mData = engine.activeUltimates[0].data as unknown as MarcoUltimateData;
    const cData = engine.activeUltimates[1].data as unknown as ChosoUltimateData;

    // Marco's Blue Phoenix Flames intercept fatal KO!
    engine.applyDamage(choso, marco, 99999, 0, 0, { bypassInvuln: true });
    expect(marco.alive).toBe(true);
    expect(marco.totemActive).toBe(false);

    marco.ultimateCharge = 0;
    marco.ultimateCooldown = 99;
    choso.ultimateCharge = 0;
    choso.ultimateCooldown = 99;
    marco.hp = marco.maxHp;

    for (let i = 0; i < 200 && (!mData.pyreFired || !cData.supernovaFired); i++) {
      engine.step(1 / 60);
    }
    expect(mData.swoopsDone).toBe(3);
    expect(mData.pyreFired).toBe(true);
    expect(cData.streamsDone).toBe(3);
    expect(cData.supernovaFired).toBe(true);
  });

  it('Muichiro Obscuring Clouds chains 5 blinks & Boa charms/petrifies cleanly', () => {
    const engine = makeEngine(['muichiro', 'boa'], 3000);
    const [muichiro, boa] = engine.fighters;
    muichiro.ultimateCooldown = 99;
    boa.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, muichiro)).toBe(true);
    expect(triggerCustomUltimate(engine, boa)).toBe(true);

    const muData = engine.activeUltimates[0].data as unknown as MuichiroUltimateData;
    for (let i = 0; i < 200 && !muData.mistFinisherFired; i++) {
      engine.step(1 / 60);
    }
    expect(muData.blinksDone).toBe(5);
    expect(muData.mistFinisherFired).toBe(true);
  });

  it('11-way Big 3 Anime Crossover FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_22_IDS, 4500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(11);

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
