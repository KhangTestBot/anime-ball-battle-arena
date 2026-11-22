import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { CloudUltimateData } from '../cloud';
import type { KirbyUltimateData } from '../kirby';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ScorpionUltimateData } from '../scorpion';
import type { UndyneUltimateData } from '../undyne';

const BATCH_20_IDS = [
  'papyrus',
  'undyne',
  'chara',
  'jevil',
  'raiden',
  'zhongli',
  'hutao',
  'scorpion',
  'subzero',
  'mario',
  'link',
  'kirby',
  'cloud',
] as const;

const COMPLETED_7_SERIES = [
  'Undertale',
  'Genshin Impact',
  'Mortal Kombat',
  'Super Mario',
  'The Legend of Zelda',
  'Kirby',
  'Final Fantasy VII',
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

describe('Batch 20 — Game Legends 7-Series 100% Sweep (207+ Ultimates)', () => {
  it('completes 100% of all 7 small game series with distinct handlers & renderers (total >= 207)', () => {
    const targetRoster = CHARACTER_ROSTER.filter((c) =>
      (COMPLETED_7_SERIES as readonly string[]).includes(c.series),
    );
    expect(targetRoster.length).toBe(14); // 5 Undertale + 3 Genshin + 2 MK + 4 Nintendo/FF7

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of targetRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(14);
    expect(renderers.size).toBe(14);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(207);
  });

  it('Undyne the Undying survives fatal KO & Scorpion yanks enemy with GET OVER HERE', () => {
    const engine = makeEngine(['undyne', 'scorpion'], 3000);
    const [undyne, scorpion] = engine.fighters;
    expect(triggerCustomUltimate(engine, undyne)).toBe(true);
    expect(triggerCustomUltimate(engine, scorpion)).toBe(true);
    expect(undyne.totemActive).toBe(true);

    const uData = engine.activeUltimates[0].data as unknown as UndyneUltimateData;
    const sData = engine.activeUltimates[1].data as unknown as ScorpionUltimateData;
    expect(sData.yankedCount).toBe(1);

    // Undyne's Determination intercepts fatal KO!
    engine.applyDamage(scorpion, undyne, 99999, 0, 0, { bypassInvuln: true });
    expect(undyne.alive).toBe(true);
    expect(undyne.totemActive).toBe(false);

    undyne.ultimateCharge = 0;
    undyne.ultimateCooldown = 99;
    scorpion.ultimateCharge = 0;
    scorpion.ultimateCooldown = 99;
    undyne.hp = undyne.maxHp;

    for (let i = 0; i < 200 && (!uData.justiceFired || !sData.toastyFired); i++) {
      engine.step(1 / 60);
    }
    expect(uData.volleysDone).toBe(4);
    expect(uData.justiceFired).toBe(true);
    expect(sData.hellfiresDone).toBe(3);
    expect(sData.toastyFired).toBe(true);
  });

  it('Kirby Hypernova devours enemy projectiles & Cloud executes 5 Omnislash blinks', () => {
    const engine = makeEngine(['kirby', 'cloud'], 3000);
    const [kirby, cloud] = engine.fighters;
    kirby.ultimateCooldown = 99;
    cloud.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'cloud_proj',
      ownerUid: cloud.uid,
      ownerCharId: cloud.character.id,
      ownerSeries: cloud.character.series,
      teamId: cloud.teamId,
      kind: 'sword-wave',
      x: kirby.x + 80,
      y: kirby.y,
      vx: -200,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, kirby)).toBe(true);
    expect(triggerCustomUltimate(engine, cloud)).toBe(true);
    const kData = engine.activeUltimates[0].data as unknown as KirbyUltimateData;
    const cData = engine.activeUltimates[1].data as unknown as CloudUltimateData;

    for (let i = 0; i < 200 && (!kData.starRodFired || !cData.finisherFired); i++) {
      engine.step(1 / 60);
    }
    expect(kData.devouredProjectiles).toBeGreaterThanOrEqual(1);
    expect(kData.starRodFired).toBe(true);
    expect(cData.slashesDone).toBe(5);
    expect(cData.finisherFired).toBe(true);
  });

  it('13-way Game Legends All-Star FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_20_IDS, 4500);
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
