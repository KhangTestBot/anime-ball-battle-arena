import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AllForOneUltimateData } from '../allforone';
import type { MirioUltimateData } from '../mirio';
import type { UrarakaUltimateData } from '../uraraka';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_28_IDS = [
  'allforone',
  'toga',
  'hawks',
  'mirio',
  'uraraka',
  'iida',
  'kirishima',
  'tokoyami',
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

describe('Batch 28 — My Hero Academia Complete 15/15 Bespoke Ultimates (300+ total)', () => {
  it('completes 100% of My Hero Academia (15/15) with distinct handlers & renderers (total >= 300)', () => {
    const mha = CHARACTER_ROSTER.filter((c) => c.series === 'My Hero Academia');
    expect(mha.length).toBe(15);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of mha) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(15);
    expect(renderers.size).toBe(15);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(300);
  });

  it('All For One Rewind Totem intercepts fatal KO, silences foes, and fires Ultimate Quirk Combination', () => {
    const engine = makeEngine(['allforone', 'hawks'], 3000);
    const [afo, hawks] = engine.fighters;
    expect(triggerCustomUltimate(engine, afo)).toBe(true);
    expect(afo.totemActive).toBe(true);
    expect(hawks.silenceTimer).toBeGreaterThan(0);

    const afoData = engine.activeUltimates[0].data as unknown as AllForOneUltimateData;

    // Demon Lord Rewind intercepts fatal KO!
    engine.applyDamage(hawks, afo, 99999, 0, 0, { bypassInvuln: true });
    expect(afo.alive).toBe(true);
    expect(afo.totemActive).toBe(false);

    afo.ultimateCharge = 0;
    afo.ultimateCooldown = 99;
    hawks.ultimateCharge = 0;
    hawks.ultimateCooldown = 99;
    afo.hp = afo.maxHp;

    for (let i = 0; i < 200 && !afoData.comboFired; i++) {
      engine.step(1 / 60);
    }
    expect(afoData.cannonsDone).toBe(3);
    expect(afoData.comboFired).toBe(true);
  });

  it('Mirio Permeation chains 4 Phantom Menace warps & Uraraka Zero Gravity suspends foes before Meteor Shower', () => {
    const engine = makeEngine(['mirio', 'uraraka'], 3000);
    const [mirio, uraraka] = engine.fighters;
    mirio.ultimateCooldown = 99;
    uraraka.ultimateCooldown = 99;

    expect(triggerCustomUltimate(engine, mirio)).toBe(true);
    expect(triggerCustomUltimate(engine, uraraka)).toBe(true);
    expect(mirio.invulnTimer).toBeGreaterThan(0);
    expect(mirio.airborneTimer).toBeGreaterThan(0);

    const mData = engine.activeUltimates[0].data as unknown as MirioUltimateData;
    const uData = engine.activeUltimates[1].data as unknown as UrarakaUltimateData;

    for (let i = 0; i < 200 && (!mData.powerFired || !uData.releaseFired); i++) {
      engine.step(1 / 60);
    }
    expect(mData.warpsDone).toBe(4);
    expect(mData.powerFired).toBe(true);
    expect(uData.meteorsDone).toBe(3);
    expect(uData.releaseFired).toBe(true);
  });

  it('8-way My Hero Academia Heroes vs Villains FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_28_IDS, 4800);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(8);

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
