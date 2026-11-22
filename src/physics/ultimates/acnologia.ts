import type { UltimateHandler } from './types';

export interface AcnologiaUltimateData {
  magicDevoured: number;
  flaresDropped: number;
  flareCd: number;
  flarePts: Array<{ x: number; y: number }>;
  roarFired: boolean;
  flash: number;
}

export const acnologiaUltimateHandler: UltimateHandler = {
  characterId: 'acnologia',
  title: 'DRAGON KING: ETERNAL FLARE & MAGIC DEVOUR',
  subtitle:
    'Devours all enemy projectiles for +DMG Arcane immunity, rains cerulean Eternal Flare starlight across the arena, and shatters shields!',
  bannerColor: '#0284c7',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.4);

    let devoured = 0;
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      if (ctx.projectiles[i].ownerUid !== owner.uid) {
        ctx.projectiles.splice(i, 1);
        devoured += 1;
        owner.dmgBonusPct += 6;
      }
    }

    const data: AcnologiaUltimateData = {
      magicDevoured: devoured,
      flaresDropped: 0,
      flareCd: 0.35,
      flarePts: [],
      roarFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#0284c7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'KING OF DRAGONS!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AcnologiaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Continuously devour incoming enemy projectiles
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      if (ctx.projectiles[i].ownerUid !== owner.uid) {
        ctx.projectiles.splice(i, 1);
        data.magicDevoured += 1;
        owner.dmgBonusPct += 5;
      }
    }

    // Rain 4 cerulean Eternal Flare starlight blasts!
    if (data.flaresDropped < 4) {
      data.flareCd -= dt;
      if (data.flareCd <= 0) {
        data.flareCd = 0.45;
        data.flaresDropped += 1;
        const enemies = ctx.getEnemies(owner);
        const focus =
          enemies[data.flaresDropped % Math.max(1, enemies.length)] ?? ctx.getNearestEnemy(owner);
        if (focus) {
          data.flarePts.push({ x: focus.x, y: focus.y });
          ctx.applyDamage(owner, focus, ctx.getEffectiveDamage(owner, 9.2), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnShockwave(
            focus.x,
            focus.y,
            155,
            '#38bdf8',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'crit', intensity: 1.1 });
        }
      }
    }

    // Climax (2.3s): DRAGON KING'S ROAR!
    if (!data.roarFired && state.elapsed >= 2.3) {
      data.roarFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.evadeTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.0), 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#0284c7',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'ETERNAL FLARE!!',
        '#7dd3fc',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
