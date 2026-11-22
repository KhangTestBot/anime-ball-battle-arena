import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ShunsuiUltimateData } from '../shunsui';
import type { TsunadeUltimateData } from '../tsunade';
import type { YoruichiUltimateData } from '../yoruichi';

const BATCH_24_IDS = [
  'tobirama',
  'tsunade',
  'orochimaru',
  'deidara',
  'kisame',
  'killerbee',
  'renji',
  'grimmjow',
  'starrk',
  'yoruichi',
  'shunsui',
  'mayuri',
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

describe('Batch 24 — Big Three Completion: Naruto (18/18) + Bleach (16/16) 100%!', () => {
  it('completes 100% of Naruto & Bleach with distinct handlers & renderers (total >= 256)', () => {
    const naruto = CHARACTER_ROSTER.filter((c) => c.series === 'Naruto');
    const bleach = CHARACTER_ROSTER.filter((c) => c.series === 'Bleach');
    expect(naruto.length).toBe(18);
    expect(bleach.length).toBe(16);

    const all = [...naruto, ...bleach];
    const handlers = new Set();
    const renderers = new Set();
    for (const ch of all) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(34);
    expect(renderers.size).toBe(34);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(256);
  });

  it('Tsunade Byakugo Seal survives fatal KO & Shunsui Bankai executes all 4 Acts', () => {
    const engine = makeEngine(['tsunade', 'shunsui'], 3000);
    const [tsunade, shunsui] = engine.fighters;
    expect(triggerCustomUltimate(engine, tsunade)).toBe(true);
    expect(triggerCustomUltimate(engine, shunsui)).toBe(true);
    expect(tsunade.totemActive).toBe(true);

    const tData = engine.activeUltimates[0].data as unknown as TsunadeUltimateData;
    const sData = engine.activeUltimates[1].data as unknown as ShunsuiUltimateData;

    // Tsunade's Byakugo Seal intercepts fatal KO!
    engine.applyDamage(shunsui, tsunade, 99999, 0, 0, { bypassInvuln: true });
    expect(tsunade.alive).toBe(true);
    expect(tsunade.totemActive).toBe(false);

    tsunade.ultimateCharge = 0;
    tsunade.ultimateCooldown = 99;
    shunsui.ultimateCharge = 0;
    shunsui.ultimateCooldown = 99;
    tsunade.hp = tsunade.maxHp;

    for (let i = 0; i < 200 && (!tData.footFired || !sData.act4Fired); i++) {
      engine.step(1 / 60);
    }
    expect(tData.punchesDone).toBe(3);
    expect(tData.footFired).toBe(true);
    expect(sData.actsDone).toBe(3);
    expect(sData.act4Fired).toBe(true);
  });

  it('Yoruichi Shunko chains 5 Flash Step blinks cleanly', () => {
    const engine = makeEngine(['yoruichi', 'tobirama'], 3000);
    const [yoruichi, tobirama] = engine.fighters;
    yoruichi.ultimateCooldown = 99;
    tobirama.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, yoruichi)).toBe(true);
    expect(triggerCustomUltimate(engine, tobirama)).toBe(true);

    const yData = engine.activeUltimates[0].data as unknown as YoruichiUltimateData;
    for (let i = 0; i < 200 && !yData.shunkoFired; i++) {
      engine.step(1 / 60);
    }
    expect(yData.blinksDone).toBe(5);
    expect(yData.shunkoFired).toBe(true);
  });

  it('12-way Naruto vs Bleach Crossover FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_24_IDS, 4500);
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
