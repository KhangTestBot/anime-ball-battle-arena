import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../characters/roster';
import type { MatchConfig } from '../../types/game';
import { BattleEngine } from '../engine';

function runToCompletion(engine: BattleEngine, maxSeconds = 120): void {
  const dt = 1 / 60;
  const maxSteps = Math.ceil(maxSeconds / dt);
  for (let i = 0; i < maxSteps && !engine.finished; i++) {
    engine.step(dt);
  }
}

describe('BattleEngine', () => {
  it('completes a 1v1 duel cleanly with finite physics, DMG scaling, and form evolution', () => {
    const config: MatchConfig = {
      mode: '1v1',
      slots: [
        { slotId: 'a', characterId: 'luffy', teamId: null },
        { slotId: 'b', characterId: 'goku', teamId: null },
      ],
      baseHp: 200,
      simSpeed: 1,
      arenaSize: 'medium',
      suddenDeath: true,
      verticalMode: false,
    };

    const engine = new BattleEngine(config);
    runToCompletion(engine, 110);

    expect(engine.finished).toBe(true);
    expect(engine.matchResult).not.toBeNull();
    expect(engine.matchResult!.fighters.length).toBe(2);

    const living = engine.fighters.filter((f) => f.alive);
    expect(living.length).toBeLessThanOrEqual(1);

    for (const f of engine.fighters) {
      expect(Number.isFinite(f.x)).toBe(true);
      expect(Number.isFinite(f.y)).toBe(true);
      expect(Number.isFinite(f.vx)).toBe(true);
      expect(Number.isFinite(f.vy)).toBe(true);
      expect(f.dmgBonusPct).toBeGreaterThan(0);
    }
    // At least one fighter should evolve during a 200 HP battle
    expect(engine.fighters.some((f) => f.formIndex >= 1)).toBe(true);
  });

  it('prevents friendly fire in Team Battle and supports duplicate picks (4 Luffy vs 4 Goku)', () => {
    const config: MatchConfig = {
      mode: 'team',
      slots: [
        { slotId: 'b1', characterId: 'luffy', teamId: 0 },
        { slotId: 'b2', characterId: 'luffy', teamId: 0 },
        { slotId: 'b3', characterId: 'luffy', teamId: 0 },
        { slotId: 'b4', characterId: 'luffy', teamId: 0 },
        { slotId: 'r1', characterId: 'goku', teamId: 1 },
        { slotId: 'r2', characterId: 'goku', teamId: 1 },
        { slotId: 'r3', characterId: 'goku', teamId: 1 },
        { slotId: 'r4', characterId: 'goku', teamId: 1 },
      ],
      baseHp: 100,
      simSpeed: 1,
      arenaSize: 'medium',
      suddenDeath: true,
      verticalMode: false,
    };

    const engine = new BattleEngine(config);
    // Direct friendly-fire check
    const allyA = engine.fighters[0];
    const allyB = engine.fighters[1];
    const dealt = engine.applyDamage(allyA, allyB, 40, 0, 0);
    expect(dealt).toBe(0);
    expect(allyB.hp).toBe(100);

    // Duplicate display naming
    expect(allyA.displayName).toBe('Luffy #1');
    expect(allyB.displayName).toBe('Luffy #2');

    runToCompletion(engine, 110);
    expect(engine.finished).toBe(true);
    expect(engine.matchResult!.winnerTeamId === 0 || engine.matchResult!.winnerTeamId === 1).toBe(
      true,
    );
  });

  it('shrinks arena walls when Sudden Death triggers', () => {
    const config: MatchConfig = {
      mode: '1v1',
      slots: [
        { slotId: 'a', characterId: 'saitama', teamId: null },
        { slotId: 'b', characterId: 'gojo', teamId: null },
      ],
      baseHp: 500,
      simSpeed: 1,
      arenaSize: 'small',
      suddenDeath: true,
      verticalMode: false,
    };

    const engine = new BattleEngine(config);
    const initialRight = engine.bounds.right;
    // Fast-forward elapsed past Sudden Death threshold
    engine.elapsed = engine.suddenDeathStartSec + 0.1;
    for (let i = 0; i < 120 && !engine.finished; i++) {
      engine.step(1 / 60);
    }

    expect(engine.suddenDeathActive).toBe(true);
    expect(engine.bounds.left).toBeGreaterThan(0);
    expect(engine.bounds.right).toBeLessThan(initialRight);
  });

  it('simulates all 336 anime & game characters cleanly across FFA batches without NaNs', () => {
    const batchSize = 16;
    for (let start = 0; start < CHARACTER_ROSTER.length; start += batchSize) {
      const slice = CHARACTER_ROSTER.slice(start, start + batchSize);
      const config: MatchConfig = {
        mode: 'ffa',
        slots: slice.map((c, idx) => ({
          slotId: `ffa_${c.id}_${idx}`,
          characterId: c.id,
          teamId: null,
        })),
        baseHp: 80,
        simSpeed: 1,
        arenaSize: 'large',
        suddenDeath: true,
        verticalMode: false,
      };

      const engine = new BattleEngine(config);
      runToCompletion(engine, 75);

      expect(engine.finished).toBe(true);
      expect(engine.matchResult).not.toBeNull();
      expect(engine.matchResult!.fighters.length).toBe(slice.length);
      for (const f of engine.fighters) {
        expect(Number.isNaN(f.x)).toBe(false);
        expect(Number.isNaN(f.y)).toBe(false);
      }
    }
  });

  it('supports up to 5000 Base HP and lets Steve summon the Ender Dragon against Minecraft bosses', () => {
    const config: MatchConfig = {
      mode: 'ffa',
      slots: [
        { slotId: 'm1', characterId: 'steve', teamId: null },
        { slotId: 'm2', characterId: 'herobrine', teamId: null },
        { slotId: 'm3', characterId: 'entity303', teamId: null },
        { slotId: 'm4', characterId: 'warden', teamId: null },
        { slotId: 'm5', characterId: 'wither', teamId: null },
      ],
      baseHp: 5000,
      simSpeed: 1,
      arenaSize: 'medium',
      suddenDeath: true,
      verticalMode: false,
    };

    const engine = new BattleEngine(config);
    expect(engine.config.baseHp).toBe(5000);
    expect(engine.fighters[0].maxHp).toBe(5000);
    expect(engine.fighters[0].hp).toBe(5000);

    // Trigger Steve Ultimate -> must summon an allied Ender Dragon + TNT!
    const steve = engine.fighters[0];
    steve.ultimateCharge = 100;
    steve.ultimateCooldown = 0;
    engine.step(1 / 60);
    expect(engine.activeCutIn?.characterId).toBe('steve');

    // Finish cut-in and let the Ender Dragon fly & breathe acid
    for (let i = 0; i < 120; i++) {
      engine.step(1 / 60);
    }
    const dragon = engine.minions.find(
      (m) => m.ownerUid === steve.uid && m.kind === 'ender-dragon',
    );
    expect(dragon).toBeDefined();
    expect(dragon!.hp).toBeGreaterThan(0);

    // Run battle further to ensure Herobrine skyPillars, Entity 303 scythes, Warden sonic-boom & Wither skulls stay finite
    for (let i = 0; i < 600 && !engine.finished; i++) {
      engine.step(1 / 60);
    }
    for (const f of engine.fighters) {
      expect(Number.isFinite(f.x)).toBe(true);
      expect(Number.isFinite(f.y)).toBe(true);
      expect(Number.isFinite(f.hp)).toBe(true);
    }
  });

  it('runs an Anime vs Game 4v4 Team Battle (Minecraft, LoL, Undertale vs Anime)', () => {
    const config: MatchConfig = {
      mode: 'team',
      slots: [
        { slotId: 'a1', characterId: 'luffy', teamId: 0 },
        { slotId: 'a2', characterId: 'goku', teamId: 0 },
        { slotId: 'a3', characterId: 'sasuke', teamId: 0 },
        { slotId: 'a4', characterId: 'frieren', teamId: 0 },
        { slotId: 'g1', characterId: 'steve', teamId: 1 },
        { slotId: 'g2', characterId: 'yasuo', teamId: 1 },
        { slotId: 'g3', characterId: 'sans', teamId: 1 },
        { slotId: 'g4', characterId: 'kratos', teamId: 1 },
      ],
      baseHp: 100,
      simSpeed: 1,
      arenaSize: 'medium',
      suddenDeath: true,
      verticalMode: false,
    };

    const engine = new BattleEngine(config);
    runToCompletion(engine, 110);
    expect(engine.finished).toBe(true);
    expect(engine.matchResult!.winnerTeamId === 0 || engine.matchResult!.winnerTeamId === 1).toBe(
      true,
    );
  });

  it('heals HP upon evolving to a new form and triggers Center-Screen Ultimate Cut-In with voice payload', () => {
    const events: Array<{ type: string; voiceLine?: string }> = [];
    const config: MatchConfig = {
      mode: '1v1',
      slots: [
        { slotId: 'a', characterId: 'luffy', teamId: null },
        { slotId: 'b', characterId: 'goku', teamId: null },
      ],
      baseHp: 200,
      simSpeed: 1,
      arenaSize: 'medium',
      suddenDeath: false,
      verticalMode: false,
    };

    const engine = new BattleEngine(config, (ev) => {
      events.push({ type: ev.type, voiceLine: ev.voiceLine });
    });

    const luffy = engine.fighters[0];
    // Drop Luffy below Gear 2 HP threshold (84% -> 150 HP)
    luffy.hp = 150;
    engine.step(1 / 60);
    // Luffy evolved to Gear 2 and healed a portion of HP!
    expect(luffy.formIndex).toBeGreaterThanOrEqual(1);
    expect(luffy.hp).toBeGreaterThan(150);
    expect(luffy.hp).toBeLessThanOrEqual(200);

    // Fill Luffy's ultimate gauge to 100% -> should trigger Cut-In with voice line!
    luffy.ultimateCharge = 100;
    luffy.ultimateCooldown = 0;
    engine.step(1 / 60);

    expect(engine.activeCutIn).not.toBeNull();
    expect(engine.activeCutIn!.characterId).toBe('luffy');
    expect(luffy.ultimatesUsed).toBe(1);
    const cutInEvent = events.find((e) => e.type === 'ultimate-cutin');
    expect(cutInEvent).toBeDefined();
    expect(cutInEvent!.voiceLine).toBe(luffy.character.ultimate.voiceLine);

    // Step past cut-in duration (1.28s) -> cut-in ends and ultimate fires!
    for (let i = 0; i < 90; i++) {
      engine.step(1 / 60);
    }
    expect(engine.activeCutIn).toBeNull();
  });
});
