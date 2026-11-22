import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { BerserkerHercUltimateData } from '../berserker_herc';
import type { JeanneUltimateData } from '../jeanne';
import type { LancerCuUltimateData } from '../lancer_cu';
import type { ShirouUltimateData } from '../shirou';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_31_IDS = [
  'shirou',
  'rin_tohsaka',
  'lancer_cu',
  'rider_medusa',
  'berserker_herc',
  'karna',
  'arjuna',
  'iskandar',
  'scathach',
  'jeanne',
  'jalter',
  'enkidu',
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

describe('Batch 31 — Fate Complete 15/15 & 100% Full Roster Bespoke Ultimates (337/337)', () => {
  it('completes 100% of Fate (15/15) AND 100% of the entire 337-character roster with distinct handlers & renderers', () => {
    const fate = CHARACTER_ROSTER.filter((c) => c.series === 'Fate');
    expect(fate.length).toBe(15);

    const missing: string[] = [];
    const handlers = new Set();
    const renderers = new Set();
    for (const ch of CHARACTER_ROSTER) {
      if (!hasCustomUltimate(ch.id) || !ULTIMATE_HANDLERS[ch.id] || !ULTIMATE_RENDERERS[ch.id]) {
        missing.push(ch.id);
      } else {
        handlers.add(ULTIMATE_HANDLERS[ch.id]);
        renderers.add(ULTIMATE_RENDERERS[ch.id]);
      }
    }
    expect(missing).toEqual([]);
    expect(CHARACTER_ROSTER.length).toBeGreaterThanOrEqual(337);
    expect(handlers.size).toBe(CHARACTER_ROSTER.length);
    expect(renderers.size).toBe(CHARACTER_ROSTER.length);
  });

  it('Heracles God Hand & Lancer Battle Continuation Totems intercept fatal KO and fire finishers', () => {
    const engine = makeEngine(['berserker_herc', 'lancer_cu'], 3000);
    const [herc, cu] = engine.fighters;
    expect(triggerCustomUltimate(engine, herc)).toBe(true);
    expect(triggerCustomUltimate(engine, cu)).toBe(true);
    expect(herc.totemActive).toBe(true);
    expect(cu.totemActive).toBe(true);

    const hData = engine.activeUltimates[0].data as unknown as BerserkerHercUltimateData;
    const cData = engine.activeUltimates[1].data as unknown as LancerCuUltimateData;

    // Heracles's God Hand intercepts fatal KO!
    engine.applyDamage(cu, herc, 99999, 0, 0, { bypassInvuln: true });
    expect(herc.alive).toBe(true);
    expect(herc.totemActive).toBe(false);

    herc.ultimateCharge = 0;
    herc.ultimateCooldown = 99;
    cu.ultimateCharge = 0;
    cu.ultimateCooldown = 99;
    herc.hp = herc.maxHp;

    for (let i = 0; i < 200 && (!hData.nineLivesFired || !cData.gaeBolgFired); i++) {
      engine.step(1 / 60);
    }
    expect(hData.smashesDone).toBe(3);
    expect(hData.nineLivesFired).toBe(true);
    expect(cData.spearsDone).toBe(3);
    expect(cData.gaeBolgFired).toBe(true);
  });

  it("Jeanne d'Arc Luminosite Eternelle nullifies projectiles & Shirou chains 5 Nine Lives strikes", () => {
    const engine = makeEngine(['jeanne', 'shirou'], 3000);
    const [jeanne, shirou] = engine.fighters;
    jeanne.ultimateCooldown = 99;
    shirou.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'test_fate_proj',
      ownerUid: shirou.uid,
      ownerCharId: shirou.character.id,
      ownerSeries: shirou.character.series,
      teamId: shirou.teamId,
      kind: 'sword-wave',
      x: jeanne.x + 80,
      y: jeanne.y,
      vx: -200,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#f97316',
      secondaryColor: '#38bdf8',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, jeanne)).toBe(true);
    expect(triggerCustomUltimate(engine, shirou)).toBe(true);

    const jData = engine.activeUltimates[0].data as unknown as JeanneUltimateData;
    const sData = engine.activeUltimates[1].data as unknown as ShirouUltimateData;

    for (let i = 0; i < 200 && (!jData.sanctuaryFired || !sData.finalCutFired); i++) {
      engine.step(1 / 60);
    }
    expect(jData.blockedProjectiles).toBeGreaterThanOrEqual(1);
    expect(jData.sanctuaryFired).toBe(true);
    expect(sData.strikesDone).toBe(5);
    expect(sData.finalCutFired).toBe(true);
  });

  it('12-way Fate Holy Grail War FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_31_IDS, 5200);
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
