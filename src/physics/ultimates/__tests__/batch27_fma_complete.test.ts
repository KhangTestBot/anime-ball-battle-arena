import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { FatherFmaUltimateData } from '../father_fma';
import type { GluttonyFmaUltimateData } from '../gluttony_fma';
import type { HohenheimUltimateData } from '../hohenheim';
import type { KingBradleyUltimateData } from '../kingbradley';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_27_IDS = [
  'edward',
  'alphonse',
  'scar_fma',
  'kingbradley',
  'greedling',
  'envy_fma',
  'lust_fma',
  'gluttony_fma',
  'pride_fma',
  'sloth_fma',
  'father_fma',
  'armstrong',
  'olivier',
  'hohenheim',
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

describe('Batch 27 — Fullmetal Alchemist Complete 15/15 Bespoke Ultimates (292+ total)', () => {
  it('completes 100% of Fullmetal Alchemist (15/15) with distinct handlers & renderers (total >= 292)', () => {
    const fma = CHARACTER_ROSTER.filter((c) => c.series === 'Fullmetal Alchemist');
    expect(fma.length).toBe(15);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of fma) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(15);
    expect(renderers.size).toBe(15);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(292);
  });

  it('Father vs Hohenheim: Philosopher Stone Totem survives fatal KO & both fire finishers', () => {
    const engine = makeEngine(['father_fma', 'hohenheim'], 3000);
    const [father, hohenheim] = engine.fighters;
    expect(triggerCustomUltimate(engine, father)).toBe(true);
    expect(triggerCustomUltimate(engine, hohenheim)).toBe(true);
    expect(father.totemActive).toBe(true);
    expect(hohenheim.totemActive).toBe(true);

    const fData = engine.activeUltimates[0].data as unknown as FatherFmaUltimateData;
    const hData = engine.activeUltimates[1].data as unknown as HohenheimUltimateData;

    // Hohenheim's 536,329 souls intercept fatal KO!
    engine.applyDamage(father, hohenheim, 99999, 0, 0, { bypassInvuln: true });
    expect(hohenheim.alive).toBe(true);
    expect(hohenheim.totemActive).toBe(false);

    father.ultimateCharge = 0;
    father.ultimateCooldown = 99;
    hohenheim.ultimateCharge = 0;
    hohenheim.ultimateCooldown = 99;
    hohenheim.hp = hohenheim.maxHp;

    for (let i = 0; i < 200 && (!fData.sunFired || !hData.xerxesFired); i++) {
      engine.step(1 / 60);
    }
    expect(fData.wavesDone).toBe(3);
    expect(fData.sunFired).toBe(true);
    expect(hData.circlesDone).toBe(3);
    expect(hData.xerxesFired).toBe(true);
  });

  it('Gluttony False Gate devours enemy projectiles & King Bradley chains 5 Ultimate Eye blinks', () => {
    const engine = makeEngine(['gluttony_fma', 'kingbradley'], 3000);
    const [gluttony, bradley] = engine.fighters;
    gluttony.ultimateCooldown = 99;
    bradley.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'test_fma_proj',
      ownerUid: bradley.uid,
      ownerCharId: bradley.character.id,
      ownerSeries: bradley.character.series,
      teamId: bradley.teamId,
      kind: 'sword-wave',
      x: gluttony.x + 80,
      y: gluttony.y,
      vx: -200,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#ef4444',
      secondaryColor: '#fff',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, gluttony)).toBe(true);
    expect(triggerCustomUltimate(engine, bradley)).toBe(true);

    const gData = engine.activeUltimates[0].data as unknown as GluttonyFmaUltimateData;
    const bData = engine.activeUltimates[1].data as unknown as KingBradleyUltimateData;

    for (let i = 0; i < 200 && (!gData.erasureFired || !bData.finalCutFired); i++) {
      engine.step(1 / 60);
    }
    expect(gData.devouredProjectiles).toBeGreaterThanOrEqual(1);
    expect(gData.erasureFired).toBe(true);
    expect(bData.blinksDone).toBe(5);
    expect(bData.finalCutFired).toBe(true);
  });

  it('14-way Fullmetal Alchemist Promised Day FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_27_IDS, 5000);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(14);

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
