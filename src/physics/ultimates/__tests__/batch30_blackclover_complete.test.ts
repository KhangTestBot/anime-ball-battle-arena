import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { JuliusUltimateData } from '../julius';
import type { LuciusUltimateData } from '../lucius';
import type { LuckUltimateData } from '../luck';
import type { YamiUltimateData } from '../yami';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';

const BATCH_30_IDS = [
  'yuno',
  'yami',
  'noelle',
  'julius',
  'mereoleona',
  'luck',
  'magna',
  'nacht',
  'licht',
  'zenon',
  'dante_bc',
  'vanica',
  'lucius',
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

describe('Batch 30 — Black Clover Complete 14/14 Bespoke Ultimates (325+ total)', () => {
  it('completes 100% of Black Clover (14/14) with distinct handlers & renderers (total >= 325)', () => {
    const bc = CHARACTER_ROSTER.filter((c) => c.series === 'Black Clover');
    expect(bc.length).toBe(14);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of bc) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(14);
    expect(renderers.size).toBe(14);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(325);
  });

  it('Julius vs Lucius: Time Magic Totem survives fatal KO & both fire finishers', () => {
    const engine = makeEngine(['julius', 'lucius'], 3000);
    const [julius, lucius] = engine.fighters;
    expect(triggerCustomUltimate(engine, julius)).toBe(true);
    expect(triggerCustomUltimate(engine, lucius)).toBe(true);
    expect(julius.totemActive).toBe(true);
    expect(lucius.totemActive).toBe(true);

    const jData = engine.activeUltimates[0].data as unknown as JuliusUltimateData;
    const lData = engine.activeUltimates[1].data as unknown as LuciusUltimateData;

    // Julius's Swallowtail Time Rewind intercepts fatal KO!
    engine.applyDamage(lucius, julius, 99999, 0, 0, { bypassInvuln: true });
    expect(julius.alive).toBe(true);
    expect(julius.totemActive).toBe(false);

    julius.ultimateCharge = 0;
    julius.ultimateCooldown = 99;
    lucius.ultimateCharge = 0;
    lucius.ultimateCooldown = 99;
    julius.hp = julius.maxHp;

    for (let i = 0; i < 200 && (!jData.anastasisFired || !lData.paladinFired); i++) {
      engine.step(1 / 60);
    }
    expect(jData.orbsDone).toBe(3);
    expect(jData.anastasisFired).toBe(true);
    expect(lData.judgmentsDone).toBe(3);
    expect(lData.paladinFired).toBe(true);
  });

  it('Yami Black Moon devours enemy projectiles & Luck Cerunnos chains 5 lightning dashes', () => {
    const engine = makeEngine(['yami', 'luck'], 3000);
    const [yami, luck] = engine.fighters;
    yami.ultimateCooldown = 99;
    luck.ultimateCooldown = 99;

    engine.projectiles.push({
      id: 'test_bc_proj',
      ownerUid: luck.uid,
      ownerCharId: luck.character.id,
      ownerSeries: luck.character.series,
      teamId: luck.teamId,
      kind: 'zoltraak-orb',
      x: yami.x + 80,
      y: yami.y,
      vx: -200,
      vy: 0,
      radius: 10,
      damage: 10,
      knockback: 100,
      color: '#38bdf8',
      secondaryColor: '#facc15',
      angle: Math.PI,
      life: 2,
      maxLife: 2,
      piercing: false,
      hitCooldowns: {},
      powerLevel: 1,
    });

    expect(triggerCustomUltimate(engine, yami)).toBe(true);
    expect(triggerCustomUltimate(engine, luck)).toBe(true);

    const yData = engine.activeUltimates[0].data as unknown as YamiUltimateData;
    const lkData = engine.activeUltimates[1].data as unknown as LuckUltimateData;

    for (let i = 0; i < 200 && (!yData.equinoxFired || !lkData.cerunnosFired); i++) {
      engine.step(1 / 60);
    }
    expect(yData.devouredProjectiles).toBeGreaterThanOrEqual(1);
    expect(yData.slashesDone).toBe(3);
    expect(yData.equinoxFired).toBe(true);
    expect(lkData.boltsDone).toBe(5);
    expect(lkData.cerunnosFired).toBe(true);
  });

  it('13-way Black Clover Spade Kingdom Raid FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(BATCH_30_IDS, 5200);
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
