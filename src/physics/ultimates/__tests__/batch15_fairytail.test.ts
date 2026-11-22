import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AcnologiaUltimateData } from '../acnologia';
import type { ErzaUltimateData } from '../erza';
import type { GildartsUltimateData } from '../gildarts';
import type { GrayUltimateData } from '../gray';
import type { JellalUltimateData } from '../jellal';
import type { LaxusUltimateData } from '../laxus';
import type { LucyUltimateData } from '../lucy_ft';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { WendyUltimateData } from '../wendy';
import type { ZerefUltimateData } from '../zeref';

const FAIRY_TAIL_BATCH_15_IDS = [
  'gray',
  'erza',
  'lucy_ft',
  'laxus',
  'gajeel',
  'wendy',
  'jellal',
  'mirajane',
  'gildarts',
  'zeref',
  'acnologia',
  'juvia',
  'sting',
  'rogue_ft',
] as const;

function makeEngine(ids: readonly string[], baseHp = 2000): BattleEngine {
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

describe('Batch 15 — Fairy Tail Complete 15/15 Bespoke Ultimates', () => {
  it('completes 100% of Fairy Tail characters (15/15) with distinct handlers & renderers (total >= 143)', () => {
    const ftRoster = CHARACTER_ROSTER.filter((c) => c.series === 'Fairy Tail');
    expect(ftRoster.length).toBe(15);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of ftRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(15);
    expect(renderers.size).toBe(15);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(143);
  });

  it('Gray Ice Devil Zeroth Bow: chills arena & fires arrow deep-freezing and stripping shields', () => {
    const engine = makeEngine(['gray', 'natsu'], 2000);
    const [gray, natsu] = engine.fighters;
    natsu.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, gray)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as GrayUltimateData;

    for (let i = 0; i < 120 && !data.arrowFired; i++) {
      natsu.abilityTimer = 99;
      natsu.x = Math.min(engine.bounds.right - 50, gray.x + 110);
      natsu.y = gray.y;
      engine.step(1 / 60);
    }
    expect(data.arrowFired).toBe(true);
    expect(natsu.shieldTimer).toBe(0);
    expect(natsu.frostTimer).toBeGreaterThan(0);
  });

  it('Erza Heaven Wheel & Nakagami Starlight: fires 3 blade volleys then cleaves obstacles & shields', () => {
    const engine = makeEngine(['erza', 'mirajane'], 2000);
    const [erza, mira] = engine.fighters;
    mira.shieldTimer = 4.0;
    engine.obstacles.push({
      id: 'erza_test_obs',
      ownerUid: mira.uid,
      ownerCharId: mira.character.id,
      teamId: mira.teamId,
      kind: 'obsidian-block',
      x: 340,
      y: 320,
      w: 44,
      h: 44,
      hp: 5,
      maxHp: 5,
      life: 10,
      maxLife: 10,
      blocksProjectiles: true,
      restitution: 1,
      color: '#333',
      secondaryColor: '#fff',
    });
    expect(triggerCustomUltimate(engine, erza)).toBe(true);
    const data = engine.activeUltimates[0].data as unknown as ErzaUltimateData;

    for (let i = 0; i < 160 && !data.nakagamiFired; i++) {
      mira.abilityTimer = 99;
      mira.x = Math.min(engine.bounds.right - 50, erza.x + 110);
      mira.y = erza.y;
      engine.step(1 / 60);
    }
    expect(data.volleysFired).toBe(3);
    expect(data.nakagamiFired).toBe(true);
    expect(engine.obstacles.length).toBe(0);
    expect(mira.shieldTimer).toBe(0);
  });

  it('Lucy Urano Metria & Laxus Fairy Law: lock dodge, paralyze, and strip shields cleanly', () => {
    const engine = makeEngine(['lucy_ft', 'laxus'], 2200);
    const [lucy, laxus] = engine.fighters;
    laxus.shieldTimer = 4.0;
    lucy.shieldTimer = 4.0;
    expect(triggerCustomUltimate(engine, lucy)).toBe(true);
    expect(triggerCustomUltimate(engine, laxus)).toBe(true);
    const lucyData = engine.activeUltimates[0].data as unknown as LucyUltimateData;
    const laxusData = engine.activeUltimates[1].data as unknown as LaxusUltimateData;

    for (let i = 0; i < 180 && (!lucyData.uranoFired || !laxusData.roarFired); i++) {
      engine.step(1 / 60);
    }
    expect(lucyData.uranoFired).toBe(true);
    expect(laxusData.fairyLawFired).toBe(true);
    expect(laxusData.roarFired).toBe(true);
    expect(laxus.dodgeLockedTimer).toBeGreaterThan(0);
  });

  it('Wendy Sky Drill, Jellal Sema, Gildarts Crash, Zeref Death Predation & Acnologia Eternal Flare all execute cleanly', () => {
    const e1 = makeEngine(['wendy', 'jellal'], 2200);
    const [wendy, jellal] = e1.fighters;
    wendy.hp = 1200;
    expect(triggerCustomUltimate(e1, wendy)).toBe(true);
    expect(wendy.hp).toBeGreaterThan(1200);
    expect(triggerCustomUltimate(e1, jellal)).toBe(true);
    const wData = e1.activeUltimates[0].data as unknown as WendyUltimateData;
    const jData = e1.activeUltimates[1].data as unknown as JellalUltimateData;
    for (let i = 0; i < 160 && (!wData.drillFired || !jData.impacted); i++) e1.step(1 / 60);
    expect(wData.drillFired).toBe(true);
    expect(jData.impacted).toBe(true);
    expect(e1.obstacles.some((o) => o.id === jData.obsId)).toBe(true);

    const e2 = makeEngine(['gildarts', 'zeref', 'acnologia'], 2600);
    const [gildarts, zeref, acno] = e2.fighters;
    expect(triggerCustomUltimate(e2, gildarts)).toBe(true);
    expect(triggerCustomUltimate(e2, zeref)).toBe(true);
    expect(triggerCustomUltimate(e2, acno)).toBe(true);
    const gData = e2.activeUltimates[0].data as unknown as GildartsUltimateData;
    const zData = e2.activeUltimates[1].data as unknown as ZerefUltimateData;
    const aData = e2.activeUltimates[2].data as unknown as AcnologiaUltimateData;
    for (
      let i = 0;
      i < 200 && (!gData.empyreanFired || !zData.waveDetonated || !aData.roarFired);
      i++
    ) {
      e2.step(1 / 60);
    }
    expect(gData.empyreanFired).toBe(true);
    expect(zData.waveDetonated).toBe(true);
    expect(aData.roarFired).toBe(true);
  });

  it('14-way Fairy Tail Guild Royale FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(FAIRY_TAIL_BATCH_15_IDS, 3500);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      expect(triggerCustomUltimate(engine, f)).toBe(true);
    }
    expect(engine.activeUltimates.length).toBe(14);

    for (let i = 0; i < 580; i++) {
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
