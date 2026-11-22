import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { DarknessDevilUltimateData } from '../darkness_devil';
import type { QuanxiUltimateData } from '../quanxi';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { SantaCsmUltimateData } from '../santa_csm';

const BATCH_26_IDS = [
  'power',
  'aki',
  'reze',
  'quanxi',
  'kishibe',
  'kobeni',
  'angel_csm',
  'beam_csm',
  'katana_man',
  'santa_csm',
  'yoru',
  'darkness_devil',
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

describe('Batch 26 — Chainsaw Man Complete 14/14 Bespoke Ultimates (278+ total)', () => {
  it('completes 100% of Chainsaw Man (14/14) with distinct handlers & renderers (total >= 278)', () => {
    const csm = CHARACTER_ROSTER.filter((c) => c.series === 'Chainsaw Man');
    expect(csm.length).toBe(14);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of csm) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(14);
    expect(renderers.size).toBe(14);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(278);
  });

  it('Santa Claus Doll Transfer survives fatal KO & Darkness Devil silences/fears foes then tolls Bell', () => {
    const engine = makeEngine(['santa_csm', 'darkness_devil'], 3000);
    const [santa, darkness] = engine.fighters;
    expect(triggerCustomUltimate(engine, santa)).toBe(true);
    expect(triggerCustomUltimate(engine, darkness)).toBe(true);
    expect(santa.totemActive).toBe(true);
    expect(santa.silenceTimer).toBeGreaterThan(0);

    const sData = engine.activeUltimates[0].data as unknown as SantaCsmUltimateData;
    const dData = engine.activeUltimates[1].data as unknown as DarknessDevilUltimateData;

    // Santa's Doll Transfer intercepts fatal KO!
    engine.applyDamage(darkness, santa, 99999, 0, 0, { bypassInvuln: true });
    expect(santa.alive).toBe(true);
    expect(santa.totemActive).toBe(false);

    santa.ultimateCharge = 0;
    santa.ultimateCooldown = 99;
    darkness.ultimateCharge = 0;
    darkness.ultimateCooldown = 99;
    santa.hp = santa.maxHp;

    for (let i = 0; i < 200 && (!sData.collapseFired || !dData.bellFired); i++) {
      engine.step(1 / 60);
    }
    expect(sData.dollsDone).toBe(3);
    expect(sData.collapseFired).toBe(true);
    expect(dData.cutsDone).toBe(3);
    expect(dData.bellFired).toBe(true);
  });

  it('Quanxi Hybrid chains 5 Decapitation Dashes cleanly', () => {
    const engine = makeEngine(['quanxi', 'reze'], 3000);
    const [quanxi, reze] = engine.fighters;
    quanxi.ultimateCooldown = 99;
    reze.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, quanxi)).toBe(true);
    expect(triggerCustomUltimate(engine, reze)).toBe(true);

    const qData = engine.activeUltimates[0].data as unknown as QuanxiUltimateData;
    for (let i = 0; i < 200 && !qData.barrageFired; i++) {
      engine.step(1 / 60);
    }
    expect(qData.dashesDone).toBe(5);
    expect(qData.barrageFired).toBe(true);
  });

  it('12-way Chainsaw Man Public Safety vs Devils FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_26_IDS, 4500);
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
