import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { BingChillingUltimateData } from '../bing_chilling';
import type { PopCatUltimateData } from '../pop_cat';
import type { RicardoMilosUltimateData } from '../ricardo_milos';
import type { StonksManUltimateData } from '../stonks_man';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const MEME_VIRAL_IDS = ['stonks_man', 'pop_cat', 'ricardo_milos', 'bing_chilling'] as const;

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

describe('Batch 32 — Meme Viral Pack (4/4 Meme Legends & 341/341 100% Roster)', () => {
  it('registers all 4 Meme Legends with meme category, skills, and 100% roster coverage (341/341)', () => {
    const memes = CHARACTER_ROSTER.filter((c) => c.category === 'meme');
    expect(memes.length).toBe(4);
    for (const m of memes) {
      expect(m.series).toBe('Meme Legends');
      expect(m.skills.length).toBeGreaterThanOrEqual(4);
      expect(hasCustomUltimate(m.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[m.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[m.id]).toBeDefined();
    }
    expect(CHARACTER_ROSTER.length).toBe(341);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBe(341);
    expect(Object.keys(ULTIMATE_RENDERERS).length).toBe(341);
  });

  it('Stonks Man heals via HELTH & Pop Cat chains 5 rapid POP! waves', () => {
    const engine = makeEngine(['stonks_man', 'pop_cat'], 3000);
    const [stonks, pop] = engine.fighters;
    stonks.hp = 1500;
    stonks.ultimateCooldown = 99;
    pop.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, stonks)).toBe(true);
    expect(triggerCustomUltimate(engine, pop)).toBe(true);
    expect(stonks.hp).toBeGreaterThan(1500);

    const sData = engine.activeUltimates[0].data as unknown as StonksManUltimateData;
    const pData = engine.activeUltimates[1].data as unknown as PopCatUltimateData;

    for (let i = 0; i < 200 && (!sData.crashFired || !pData.omegaPopFired); i++) {
      engine.step(1 / 60);
    }
    expect(sData.candlesDone).toBe(3);
    expect(sData.crashFired).toBe(true);
    expect(pData.popsDone).toBe(5);
    expect(pData.omegaPopFired).toBe(true);
  });

  it('Ricardo Milos charms foes & Bing Chilling turns invisible and freezes rivals', () => {
    const engine = makeEngine(['ricardo_milos', 'bing_chilling'], 3000);
    const [ricardo, bing] = engine.fighters;
    ricardo.ultimateCooldown = 99;
    bing.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, ricardo)).toBe(true);
    expect(triggerCustomUltimate(engine, bing)).toBe(true);
    expect(bing.invulnTimer).toBeGreaterThan(0);
    expect(ricardo.stunTimer).toBeGreaterThan(0);

    const rData = engine.activeUltimates[0].data as unknown as RicardoMilosUltimateData;
    const bData = engine.activeUltimates[1].data as unknown as BingChillingUltimateData;

    for (let i = 0; i < 200 && (!rData.uGotThatFired || !bData.creditFired); i++) {
      engine.step(1 / 60);
    }
    expect(rData.flexesDone).toBe(3);
    expect(rData.uGotThatFired).toBe(true);
    expect(bData.conesDone).toBe(3);
    expect(bData.creditFired).toBe(true);
  });

  it('4-way Meme Viral FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(MEME_VIRAL_IDS, 4000);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(4);

    for (let i = 0; i < 500; i++) {
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
