import { describe, expect, it } from 'vitest';
import type { MatchConfig } from '../../../types/game';
import { executeSkillDef, executeUltimateSkill } from '../../abilities';
import { BattleEngine } from '../../engine';
import type { Entity303UltimateData } from '../entity303';
import type { HerobrineUltimateData } from '../herobrine';
import type { SteveUltimateData } from '../steve';
import type { WardenUltimateData } from '../warden';

function makeMatch(ids: string[], baseHp = 1000): BattleEngine {
  const config: MatchConfig = {
    mode: ids.length === 2 ? '1v1' : 'ffa',
    slots: ids.map((id, i) => ({ slotId: `s_${i}`, characterId: id, teamId: null })),
    baseHp,
    simSpeed: 1,
    arenaSize: 'medium',
    suddenDeath: false,
    verticalMode: false,
  };
  return new BattleEngine(config);
}

describe('Batch 1 Custom Ultimates (Steve, Herobrine, Entity 303, Warden)', () => {
  it('Steve builds Obsidian/Bedrock obstacles, summons Ender Dragon, drops Anvils, and revives once via Totem of Undying', () => {
    const engine = makeMatch(['steve', 'goku'], 1000);
    const [steve, goku] = engine.fighters;

    executeUltimateSkill(engine, steve);
    expect(engine.activeUltimates.length).toBe(1);
    expect(engine.activeUltimates[0].characterId).toBe('steve');
    expect(steve.totemActive).toBe(true);
    expect(steve.enchantArmorTimer).toBeGreaterThan(4.0);
    expect(engine.minions.some((m) => m.ownerUid === steve.uid && m.kind === 'ender-dragon')).toBe(
      true,
    );

    // Step past cast phase -> physical Obsidian/Bedrock blocks & falling anvil spawn!
    for (let i = 0; i < 45; i++) engine.step(1 / 60);
    expect(engine.obstacles.filter((o) => o.ownerUid === steve.uid).length).toBeGreaterThan(0);
    const sData = engine.activeUltimates[0].data as unknown as SteveUltimateData;
    expect(sData.anvilsDropped).toBeGreaterThanOrEqual(1);

    // Fatal damage hits Steve -> Totem of Undying MUST intercept death and revive at 25% Max HP!
    engine.applyDamage(goku, steve, 99999, 0, 0, { bypassInvuln: true });
    expect(steve.alive).toBe(true);
    expect(steve.hp).toBe(250);
    expect(steve.totemActive).toBe(false);
    expect(steve.totemPopTimer).toBeGreaterThan(0.5);
  });

  it('Herobrine spawns 2 Phantom Decoys that counter-shock on contact & marks Redstone Cross lightning strikes', () => {
    const engine = makeMatch(['herobrine', 'luffy'], 1000);
    const [herobrine, luffy] = engine.fighters;

    executeUltimateSkill(engine, herobrine);
    const hData = engine.activeUltimates[0].data as unknown as HerobrineUltimateData;
    expect(hData.decoys.length).toBe(2);

    // Clear cast hitstop (0.05s), then move enemy directly onto decoy 0 -> must trigger counter white lightning!
    for (let i = 0; i < 6; i++) engine.step(1 / 60);
    const d0 = hData.decoys[0];
    luffy.x = d0.x;
    luffy.y = d0.y;
    const hpBefore = luffy.hp;
    engine.step(1 / 60);

    expect(d0.alive).toBe(false);
    expect(luffy.hp).toBeLessThan(hpBefore);
    expect(engine.lightningBolts.length).toBeGreaterThan(0);

    // Step forward -> Redstone Cross strikes spawn
    for (let i = 0; i < 45; i++) engine.step(1 / 60);
    expect(hData.strikes.length).toBeGreaterThan(0);
  });

  it('Entity 303 spawns 3 Corrupted Chunks that Glitch-Teleport + reverse velocity + inflict Anti-Heal (blocking heals)', () => {
    const engine = makeMatch(['entity303', 'luffy'], 1000);
    const [e303, luffy] = engine.fighters;

    executeUltimateSkill(engine, e303);
    expect(engine.cameraGlitchTimer).toBeGreaterThan(0.3);
    const eData = engine.activeUltimates[0].data as unknown as Entity303UltimateData;
    expect(eData.chunks.length).toBe(3);

    // Clear cast hitstop (0.055s), move e303 away from chunk 0 to avoid collision/hitstop flake, then place Luffy inside chunk 0
    e303.x = 40;
    e303.y = 40;
    for (let i = 0; i < 8; i++) engine.step(1 / 60);
    const c0 = eData.chunks[0];
    const c1 = eData.chunks[1];
    luffy.x = c0.x;
    luffy.y = c0.y;
    luffy.vx = 300;
    luffy.vy = 0;
    luffy.glitchTeleportCd = 0;
    engine.step(1 / 60);

    // Luffy was Glitch Teleported near chunk 1, velocity reversed, cooldown set, and Anti-Heal applied!
    expect(Math.hypot(luffy.x - c1.x, luffy.y - c1.y)).toBeLessThan(35);
    expect(luffy.vx).toBeLessThan(0);
    expect(luffy.glitchTeleportCd).toBeGreaterThan(0.5);
    expect(luffy.antiHealTimer).toBeGreaterThan(3.0);

    // Verify Anti-Heal blocks Luffy's Meat heal skill!
    luffy.hp = 400;
    const healSkill = luffy.character.skills.find((s) => s.effect === 'heal-item')!;
    executeSkillDef(engine, luffy, healSkill, e303, engine.getForm(luffy));
    expect(luffy.hp).toBe(400);
  });

  it('Warden places 3 Sculk Sensors that ignore slow sneaking enemies but fire piercing Sonic Boom at fast vibrations', () => {
    const engine = makeMatch(['warden', 'goku'], 1000);
    const [warden, goku] = engine.fighters;

    executeUltimateSkill(engine, warden);
    const wData = engine.activeUltimates[0].data as unknown as WardenUltimateData;
    expect(wData.sensors.length).toBe(3);

    // Let sensor init cooldown clear while Goku sneaks slowly
    goku.vx = 60;
    goku.vy = 0;
    for (let i = 0; i < 20; i++) {
      goku.vx = 60;
      goku.vy = 0;
      engine.step(1 / 60);
    }
    expect(wData.vibrations.length).toBe(0);

    // Now Goku moves fast (>315 px/s) -> triggers vibration wave -> fires cyan Sonic Boom!
    goku.vx = 480;
    goku.vy = 0;
    engine.step(1 / 60);
    expect(wData.vibrations.length).toBeGreaterThan(0);

    // Advance until vibration wave reaches Sculk Sensor & fires Sonic Boom
    for (let i = 0; i < 26; i++) engine.step(1 / 60);
    expect(
      engine.projectiles.some((p) => p.kind === 'sonic-boom' && p.ownerUid === warden.uid),
    ).toBe(true);
  });

  it('handles all 4 Batch 1 Ultimates overlapping simultaneously cleanly without NaNs or out-of-bounds fighters', () => {
    const engine = makeMatch(['steve', 'herobrine', 'entity303', 'warden'], 2000);
    for (const f of engine.fighters) {
      f.ultimateCooldown = 99;
      executeUltimateSkill(engine, f);
    }
    expect(engine.activeUltimates.length).toBe(4);

    // Simulate >6s of overlapping 4-way Ultimate chaos + clean teardown!
    for (let i = 0; i < 420 && !engine.finished; i++) {
      engine.step(1 / 60);
      for (const f of engine.fighters) {
        if (!f.alive) continue;
        expect(Number.isFinite(f.x)).toBe(true);
        expect(Number.isFinite(f.y)).toBe(true);
        expect(f.x).toBeGreaterThanOrEqual(engine.bounds.left - 1);
        expect(f.x).toBeLessThanOrEqual(engine.bounds.right + 1);
        expect(f.y).toBeGreaterThanOrEqual(engine.bounds.top - 1);
        expect(f.y).toBeLessThanOrEqual(engine.bounds.bottom + 1);
      }
    }

    // After >5.0s simulation elapsed, all Batch 1 ultimates have torn down cleanly!
    expect(engine.activeUltimates.length).toBe(0);
  });
});
