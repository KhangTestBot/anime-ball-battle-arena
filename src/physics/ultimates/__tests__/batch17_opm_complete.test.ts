import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { BangUltimateData } from '../bang';
import type { BorosUltimateData } from '../boros';
import type { GarouUltimateData } from '../garou';
import type { KingOpmUltimateData } from '../king_opm';
import type { MetalBatUltimateData } from '../metalbat';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ZombiemanUltimateData } from '../zombieman';

const OPM_BATCH_17_IDS = [
  'genos',
  'garou',
  'tatsumaki',
  'boros',
  'bang',
  'flashyflash',
  'atomic',
  'king_opm',
  'sonic_opm',
  'fubuki',
  'metalbat',
  'zombieman',
  'watchdog',
  'orochi_opm',
] as const;

function makeEngine(ids: readonly string[], baseHp = 2200): BattleEngine {
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

describe('Batch 17 — One Punch Man Complete 15/15 Bespoke Ultimates', () => {
  it('completes 100% of One Punch Man characters (15/15) with distinct handlers & renderers (total >= 169)', () => {
    const opmRoster = CHARACTER_ROSTER.filter((c) => c.series === 'One Punch Man');
    expect(opmRoster.length).toBe(15);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of opmRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(15);
    expect(renderers.size).toBe(15);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(169);
  });

  it('Garou Cosmic Fear & Boros Meteoric Burst execute full blink/kick combos & finishers', () => {
    const engine = makeEngine(['garou', 'boros'], 3000);
    const [garou, boros] = engine.fighters;
    garou.ultimateCooldown = 99;
    boros.ultimateCooldown = 99;
    expect(triggerCustomUltimate(engine, garou)).toBe(true);
    expect(triggerCustomUltimate(engine, boros)).toBe(true);

    const gData = engine.activeUltimates[0].data as unknown as GarouUltimateData;
    const bData = engine.activeUltimates[1].data as unknown as BorosUltimateData;

    for (let i = 0; i < 180 && (!gData.grbFired || !bData.cannonFired); i++) {
      engine.step(1 / 60);
    }
    expect(gData.blinksDone).toBe(3);
    expect(gData.grbFired).toBe(true);
    expect(bData.kicksDone).toBe(3);
    expect(bData.cannonFired).toBe(true);
  });

  it('King Engine terrifies foes & Zombieman Immortal Body survives fatal KO + fires 4 volleys', () => {
    const engine = makeEngine(['king_opm', 'zombieman'], 2500);
    const [king, zombieman] = engine.fighters;
    expect(triggerCustomUltimate(engine, king)).toBe(true);
    expect(triggerCustomUltimate(engine, zombieman)).toBe(true);
    expect(zombieman.totemActive).toBe(true);

    const kData = engine.activeUltimates[0].data as unknown as KingOpmUltimateData;
    const zData = engine.activeUltimates[1].data as unknown as ZombiemanUltimateData;

    // Fatal hit is intercepted by Zombieman's Immortal Regeneration!
    engine.applyDamage(king, zombieman, 99999, 0, 0, { bypassInvuln: true });
    expect(zombieman.alive).toBe(true);
    expect(zombieman.totemActive).toBe(false);

    // Prevent the 99,999 test hit from triggering a second cut-in
    king.ultimateCharge = 0;
    king.ultimateCooldown = 99;
    zombieman.ultimateCharge = 0;
    zombieman.ultimateCooldown = 99;
    zombieman.hp = zombieman.maxHp;

    for (let i = 0; i < 200 && (!kData.wavemotionFired || !zData.execFired); i++) {
      engine.step(1 / 60);
    }
    expect(kData.thumpsDone).toBe(3);
    expect(kData.wavemotionFired).toBe(true);
    expect(zData.volleysFired).toBe(4);
    expect(zData.execFired).toBe(true);
  });

  it('Metal Bat Fighting Spirit scales with missing HP; Silver Fang deflects enemy projectiles', () => {
    const engine = makeEngine(['metalbat', 'bang'], 2500);
    const [bat, bang] = engine.fighters;
    bat.hp = Math.round(bat.maxHp * 0.2); // 80% missing HP -> high Fighting Spirit!
    bat.ultimateCooldown = 99;
    bang.ultimateCooldown = 99;

    // Spawn an enemy projectile right beside Silver Fang to verify Water Stream deflection
    engine.projectiles.push({
      id: 'test_proj',
      ownerUid: bat.uid,
      ownerCharId: bat.character.id,
      ownerSeries: bat.character.series,
      teamId: bat.teamId,
      kind: 'zoltraak-orb',
      x: bang.x + 65,
      y: bang.y,
      vx: -300,
      vy: 0,
      radius: 8,
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

    expect(triggerCustomUltimate(engine, bat)).toBe(true);
    expect(triggerCustomUltimate(engine, bang)).toBe(true);

    const batData = engine.activeUltimates[0].data as unknown as MetalBatUltimateData;
    const bangData = engine.activeUltimates[1].data as unknown as BangUltimateData;
    expect(batData.spiritBonusPct).toBeGreaterThanOrEqual(30);

    for (let i = 0; i < 180 && (!batData.homeRunFired || !bangData.finisherFired); i++) {
      engine.step(1 / 60);
    }
    expect(bangData.deflectedCount).toBeGreaterThanOrEqual(1);
    expect(batData.homeRunFired).toBe(true);
    expect(bangData.finisherFired).toBe(true);
  });

  it('14-way One Punch Man Hero & Monster Association FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(OPM_BATCH_17_IDS, 4000);
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
