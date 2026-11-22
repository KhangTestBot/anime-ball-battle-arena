import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { ArminUltimateData } from '../armin';
import type { ErwinUltimateData } from '../erwin';
import type { MikasaUltimateData } from '../mikasa';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ZekeUltimateData } from '../zeke';

const AOT_BATCH_19_IDS = [
  'mikasa',
  'armin',
  'reiner',
  'annie',
  'zeke',
  'erwin',
  'hange',
  'jean',
  'sasha',
  'connie',
  'porco',
  'lara',
] as const;

function makeEngine(ids: readonly string[], baseHp = 2500): BattleEngine {
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

describe('Batch 19 — Attack on Titan Complete 14/14 Bespoke Ultimates', () => {
  it('completes 100% of Attack on Titan characters (14/14) with distinct handlers & renderers (total >= 194)', () => {
    const aotRoster = CHARACTER_ROSTER.filter((c) => c.series === 'Attack on Titan');
    expect(aotRoster.length).toBe(14);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of aotRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(14);
    expect(renderers.size).toBe(14);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(194);
  });

  it('Erwin Shinzou wo Sasageyo survives fatal KO & Zeke executes 4 Perfect Game pitches', () => {
    const engine = makeEngine(['erwin', 'zeke'], 3000);
    const [erwin, zeke] = engine.fighters;
    expect(triggerCustomUltimate(engine, erwin)).toBe(true);
    expect(triggerCustomUltimate(engine, zeke)).toBe(true);
    expect(erwin.totemActive).toBe(true);

    const eData = engine.activeUltimates[0].data as unknown as ErwinUltimateData;
    const zData = engine.activeUltimates[1].data as unknown as ZekeUltimateData;

    // Erwin's undying resolve intercepts fatal KO!
    engine.applyDamage(zeke, erwin, 99999, 0, 0, { bypassInvuln: true });
    expect(erwin.alive).toBe(true);
    expect(erwin.totemActive).toBe(false);

    erwin.ultimateCharge = 0;
    erwin.ultimateCooldown = 99;
    zeke.ultimateCharge = 0;
    zeke.ultimateCooldown = 99;
    erwin.hp = erwin.maxHp;

    for (let i = 0; i < 200 && (!eData.chargeFired || !zData.perfectGameFired); i++) {
      engine.step(1 / 60);
    }
    expect(eData.flaresFired).toBe(3);
    expect(eData.chargeFired).toBe(true);
    expect(zData.pitchesDone).toBe(4);
    expect(zData.perfectGameFired).toBe(true);
  });

  it('Mikasa ODM blitz & Armin Colossal Nuke trigger cleanly', () => {
    const engine = makeEngine(['mikasa', 'armin'], 3000);
    const [mikasa, armin] = engine.fighters;
    mikasa.ultimateCooldown = 99;
    armin.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, mikasa)).toBe(true);
    expect(triggerCustomUltimate(engine, armin)).toBe(true);

    const mData = engine.activeUltimates[0].data as unknown as MikasaUltimateData;
    const aData = engine.activeUltimates[1].data as unknown as ArminUltimateData;

    for (let i = 0; i < 200 && (!mData.spearFired || !aData.nukeFired); i++) {
      engine.step(1 / 60);
    }
    expect(mData.zipsDone).toBe(4);
    expect(mData.spearFired).toBe(true);
    expect(aData.steamPulses).toBe(3);
    expect(aData.nukeFired).toBe(true);
  });

  it('12-way Attack on Titan Survey Corps vs Nine Titans FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(AOT_BATCH_19_IDS, 4500);
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
