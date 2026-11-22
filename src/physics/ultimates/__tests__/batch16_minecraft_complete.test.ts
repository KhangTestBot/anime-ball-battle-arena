import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../../characters/roster';
import { ULTIMATE_RENDERERS } from '../../../renderer/ultimates/registry';
import type { MatchConfig } from '../../../types/game';
import { BattleEngine } from '../../engine';
import type { AlexUltimateData } from '../alex';
import type { EndermanUltimateData } from '../enderman';
import type { EvokerUltimateData } from '../evoker';
import type { RavagerUltimateData } from '../ravager';
import { hasCustomUltimate, triggerCustomUltimate, ULTIMATE_HANDLERS } from '../registry';
import type { ShulkerUltimateData } from '../shulker';
import type { TechnobladeUltimateData } from '../technoblade';

const MINECRAFT_BATCH_16_IDS = [
  'alex',
  'enderman',
  'blaze',
  'irongolem',
  'skeleton',
  'zombie',
  'piglin',
  'ghast',
  'shulker',
  'technoblade',
  'evoker',
  'ravager',
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

describe('Batch 16 — Minecraft Complete 18/18 Bespoke Ultimates', () => {
  it('completes 100% of Minecraft characters (18/18) with distinct handlers & renderers (total >= 155)', () => {
    const mcRoster = CHARACTER_ROSTER.filter((c) => c.series === 'Minecraft');
    expect(mcRoster.length).toBe(18);

    const handlers = new Set();
    const renderers = new Set();
    for (const ch of mcRoster) {
      expect(hasCustomUltimate(ch.id)).toBe(true);
      expect(ULTIMATE_HANDLERS[ch.id]).toBeDefined();
      expect(ULTIMATE_RENDERERS[ch.id]).toBeDefined();
      handlers.add(ULTIMATE_HANDLERS[ch.id]);
      renderers.add(ULTIMATE_RENDERERS[ch.id]);
    }
    expect(handlers.size).toBe(18);
    expect(renderers.size).toBe(18);
    expect(Object.keys(ULTIMATE_HANDLERS).length).toBeGreaterThanOrEqual(155);
  });

  it('Technoblade Blood God: arms Totem of Undying, boosts +20% DMG, fires 3 Wither Skulls & survives fatal KO', () => {
    const engine = makeEngine(['technoblade', 'steve'], 2000);
    const [techno, steve] = engine.fighters;
    const preDmg = techno.dmgBonusPct;
    expect(triggerCustomUltimate(engine, techno)).toBe(true);
    expect(techno.totemActive).toBe(true);
    expect(techno.dmgBonusPct).toBeGreaterThanOrEqual(preDmg + 20);
    const data = engine.activeUltimates[0].data as unknown as TechnobladeUltimateData;

    // Fatal hit is intercepted by Technoblade's Totem of Undying!
    engine.applyDamage(steve, techno, 99999, 0, 0, { bypassInvuln: true });
    expect(techno.alive).toBe(true);
    expect(techno.totemActive).toBe(false);

    // Prevent the 99,999-damage test hit from charging either fighter's next Ultimate cut-in
    steve.ultimateCharge = 0;
    steve.ultimateCooldown = 99;
    techno.ultimateCharge = 0;
    techno.ultimateCooldown = 99;
    techno.hp = techno.maxHp;

    for (let i = 0; i < 200 && !data.climaxFired; i++) {
      steve.abilityTimer = 99;
      engine.step(1 / 60);
    }
    expect(data.comboStrikes).toBe(3);
    expect(data.climaxFired).toBe(true);
  });

  it('Enderman steals enemy obstacles & chains 4 Ender Blinks; Alex fires 3 firework volleys & TNT Cannon', () => {
    const engine = makeEngine(['enderman', 'alex'], 2000);
    const [ender, alex] = engine.fighters;
    engine.obstacles.push({
      id: 'alex_block',
      ownerUid: alex.uid,
      ownerCharId: alex.character.id,
      teamId: alex.teamId,
      kind: 'obsidian-block',
      x: 320,
      y: 320,
      w: 40,
      h: 40,
      hp: 4,
      maxHp: 4,
      life: 10,
      maxLife: 10,
      blocksProjectiles: true,
      restitution: 1,
      color: '#333',
      secondaryColor: '#fff',
    });
    expect(triggerCustomUltimate(engine, ender)).toBe(true);
    expect(engine.obstacles.length).toBe(0);
    expect(triggerCustomUltimate(engine, alex)).toBe(true);

    const eData = engine.activeUltimates[0].data as unknown as EndermanUltimateData;
    const aData = engine.activeUltimates[1].data as unknown as AlexUltimateData;
    expect(eData.blocksStolen).toBe(1);

    for (let i = 0; i < 180 && (eData.blinksDone < 4 || !aData.cannonFired); i++) {
      engine.step(1 / 60);
    }
    expect(eData.blinksDone).toBe(4);
    expect(aData.cannonFired).toBe(true);
  });

  it('Shulker Levitation, Evoker Fangs & Ravager Roar all trigger cleanly', () => {
    const engine = makeEngine(['shulker', 'evoker', 'ravager'], 2500);
    const [shulker, evoker, ravager] = engine.fighters;
    expect(triggerCustomUltimate(engine, shulker)).toBe(true);
    expect(triggerCustomUltimate(engine, evoker)).toBe(true);
    expect(triggerCustomUltimate(engine, ravager)).toBe(true);
    const sData = engine.activeUltimates[0].data as unknown as ShulkerUltimateData;
    const eData = engine.activeUltimates[1].data as unknown as EvokerUltimateData;
    const rData = engine.activeUltimates[2].data as unknown as RavagerUltimateData;

    for (
      let i = 0;
      i < 180 && (!sData.levitationBurst || !eData.fangsLineFired || !rData.roarFired);
      i++
    ) {
      engine.step(1 / 60);
    }
    expect(sData.levitationBurst).toBe(true);
    expect(eData.fangsLineFired).toBe(true);
    expect(rData.roarFired).toBe(true);
  });

  it('12-way Minecraft Mob Royale FFA stays finite, in-bounds, and expires cleanly', () => {
    const engine = makeEngine(MINECRAFT_BATCH_16_IDS, 3500);
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
