import type { UltimateHandler } from './types';

export interface MahoragaUltimateData {
  slamsDone: number;
  slamCd: number;
  obliterationFired: boolean;
  pillarX: number;
  pillarY: number;
  pillarFlash: number;
}

export const mahoragaUltimateHandler: UltimateHandler = {
  characterId: 'mahoraga',
  title: 'SWORD OF EXTERMINATION: DIVINE GENERAL RAMPAGE!!',
  subtitle:
    'Ascends into a Towering Titan (Giant + Unstoppable), executes 3 Sword of Extermination leap-slams, and drives a Positive Energy Cross-Pillar shattering shields & obstacles!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 18;

    const data: MahoragaUltimateData = {
      slamsDone: 0,
      slamCd: 0.34,
      obliterationFired: false,
      pillarX: owner.x,
      pillarY: owner.y,
      pillarFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      230,
      '#fef08a',
      8,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#facc15', 80, 260, 3, 6.5, 'star');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.06);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MahoragaUltimateData;
    const enemies = ctx.getEnemies(owner);
    if (data.pillarFlash > 0) data.pillarFlash = Math.max(0, data.pillarFlash - dt);

    // 1. Three Sword of Extermination Titan Leap-Slams!
    if (!data.obliterationFired && data.slamsDone < 3) {
      data.slamCd -= dt;
      if (data.slamCd <= 0) {
        data.slamCd = 0.5;
        data.slamsDone += 1;

        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.facingAngle = ang;

          const slamDmg = 10.5 + owner.mahoragaAdaptStacks * 1.1;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, slamDmg),
            Math.cos(ang) * 380,
            Math.sin(ang) * 380,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            135,
            '#facc15',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(target.x, target.y, 14, '#fef08a', 70, 230, 2.5, 5.5, 'star');
          ctx.addScreenShake(9);
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    // 2. Climax (2.1s): SWORD OF EXTERMINATION — POSITIVE ENERGY CROSS-PILLAR OBLITERATION!
    if (!data.obliterationFired && state.elapsed >= 2.1) {
      data.obliterationFired = true;
      data.pillarFlash = 1.45;
      data.pillarX = owner.x;
      data.pillarY = owner.y;

      // Shatter all enemy obstacles & projectiles in the cross-pillar blast!
      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        const obs = ctx.obstacles[i];
        if (
          obs.kind === 'iron-ore' ||
          obs.kind === 'diamond-ore' ||
          obs.kind === 'ancient-debris'
        ) {
          continue;
        }
        if (obs.ownerUid !== owner.uid) {
          ctx.obstacles.splice(i, 1);
        }
      }
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        if (ctx.projectiles[i].ownerUid !== owner.uid) {
          ctx.projectiles.splice(i, 1);
        }
      }

      const climaxDmg = 22.0 + owner.mahoragaAdaptStacks * 2.0;
      for (const e of enemies) {
        e.shieldTimer = 0;
        e.evadeTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, climaxDmg),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { bypassInvuln: true, isCrit: true, sourceKind: 'ability' },
        );
      }

      ctx.addHitstop(0.09);
      ctx.addScreenShake(22);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#fef08a',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnParticles(owner.x, owner.y, 34, '#facc15', 100, 340, 3, 7, 'star');
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
