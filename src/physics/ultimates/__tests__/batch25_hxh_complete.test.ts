import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { FeitanUltimateData } from '../feitan';
import type { KurapikaUltimateData } from '../kurapika';
import type { PitouUltimateData } from '../pitou';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_25_IDS = [
  'kurapika',
  'leorio',
  'chrollo',
  'feitan',
  'illumi',
  'pitou',
  'youpi',
  'pouf',
  'kite',
  'bisky',
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

describe('Batch 25 — Hunter x Hunter Complete 15/15 Bespoke Ultimates (266+ total)', () => {
  it('completes 100% of Hunter x Hunter (15/15) with distinct handlers & renderers (total >= 266)', () => {
    const hxh = CHARACTER_ROSTER.filter((c) => c.series === 'Hunter x Hunter');
    expect(hxh.length).toBe(15);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of hxh) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(15);
    expect(renderers.size).toBe(15);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(266);
  });

  it('Pitou Post-Mortem Nen survives fatal KO & Feitan Pain Packer scales with missing HP', () => {
    const engine = makeEngine(['pitou', 'feitan'], 3000);
    const [pitou, feitan] = engine.fighters;
    feitan.hp = Math.round(feitan.maxHp * 0.2); // 80% missing HP -> high Pain Packer!
    expect(triggerCustomUltimate(engine, pitou)).toBe(true);
    expect(triggerCustomUltimate(engine, feitan)).toBe(true);
    expect(pitou.totemActive).toBe(true);

    const pData = engine.activeUltimates[0].data as unknown as PitouUltimateData;
    const fData = engine.activeUltimates[1].data as unknown as FeitanUltimateData;
    expect(fData.painBonusPct).toBeGreaterThanOrEqual(30);

    // Pitou's Post-Mortem Terpsichora intercepts fatal KO!
    engine.applyDamage(feitan, pitou, 99999, 0, 0, { bypassInvuln: true });
    expect(pitou.alive).toBe(true);
    expect(pitou.totemActive).toBe(false);

    pitou.ultimateCharge = 0;
    pitou.ultimateCooldown = 99;
    feitan.ultimateCharge = 0;
    feitan.ultimateCooldown = 99;
    pitou.hp = pitou.maxHp;
    feitan.hp = feitan.maxHp;

    for (let i = 0; i < 200 && (!pData.rendFired || !fData.risingSunFired); i++) {
      engine.step(1 / 60);
    }
    expect(pData.pouncesDone).toBe(4);
    expect(pData.rendFired).toBe(true);
    expect(fData.heatwavesDone).toBe(3);
    expect(fData.risingSunFired).toBe(true);
  });

  it('Kurapika Emperor Time chains & silences enemy then fires Judgment Chain', () => {
    const engine = makeEngine(['kurapika', 'chrollo'], 3000);
    const [kurapika, chrollo] = engine.fighters;
    kurapika.ultimateCooldown = 99;
    chrollo.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, kurapika)).toBe(true);
    expect(chrollo.silenceTimer).toBeGreaterThan(0);

    const kData = engine.activeUltimates[0].data as unknown as KurapikaUltimateData;
    for (let i = 0; i < 200 && !kData.judgmentFired; i++) {
      engine.step(1 / 60);
    }
    expect(kData.chainsDone).toBe(3);
    expect(kData.judgmentFired).toBe(true);
  });

  it('10-way Hunter x Hunter Chimera Ant & Phantom Troupe FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_25_IDS, 4500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(10);

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
