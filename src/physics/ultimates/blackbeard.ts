import type { UltimateHandler } from './types';

export interface BlackbeardUltimateData {
  stage: 'black-hole' | 'gura-crush';
  vortexRadius: number;
  swallowedCount: number;
  tickCd: number;
  quakeCrushed: boolean;
  quakeFlash: number;
}

export const blackbeardUltimateHandler: UltimateHandler = {
  characterId: 'blackbeard',
  title: 'ZEHAHAHA! YAMI-YAMI BLACK HOLE & GURA-GURA QUAKE!',
  subtitle:
    'Yami Black Hole devours projectiles & pulls all enemies to the center while NULLIFYING shields/dodge/skills (Silence + Dodge Lock) → Slams a space-cracking Gura-Gura quake shattering obstacles!',
  bannerColor: '#7e22ce',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.7);
    const enemies = ctx.getEnemies(owner);

    // Yami Yami Nullification strips active defenses on cast!
    for (const e of enemies) {
      e.shieldTimer = 0;
      e.evadeTimer = 0;
      e.silenceTimer = Math.max(e.silenceTimer, 1.8);
      e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.0);
    }

    const data: BlackbeardUltimateData = {
      stage: 'black-hole',
      vortexRadius: 245,
      swallowedCount: 0,
      tickCd: 0.35,
      quakeCrushed: false,
      quakeFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7e22ce', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      210,
      '#581c87',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'ZEHAHAHA! BLACK HOLE!!',
      '#d8b4fe',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#09090b', 75, 250, 3, 6.5, 'circle');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BlackbeardUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.quakeFlash > 0) data.quakeFlash = Math.max(0, data.quakeFlash - dt);

    // 1. Yami Yami Black Hole swallows projectiles & drags foes into range!
    if (data.stage === 'black-hole') {
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 210) {
          data.swallowedCount++;
          ctx.spawnParticles(p.x, p.y, 6, '#9333ea', 40, 120, 2.5, 4.5, 'circle');
          ctx.projectiles.splice(i, 1);
        }
      }

      data.tickCd -= dt;
      const shouldTick = data.tickCd <= 0;
      if (shouldTick) data.tickCd = 0.42;

      for (const e of enemies) {
        const dx = owner.x - e.x;
        const dy = owner.y - e.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1 && dist <= data.vortexRadius + e.radius) {
          const d = Math.max(1, dist);
          e.vx += (dx / d) * 320 * dt;
          e.vy += (dy / d) * 320 * dt;
          if (shouldTick) {
            e.shieldTimer = 0;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.6), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
      }

      // Climax (1.95s): GURA-GURA NO MI SEAQUAKE PUNCH!!
      if (!data.quakeCrushed && state.elapsed >= 1.95) {
        data.quakeCrushed = true;
        data.stage = 'gura-crush';
        data.quakeFlash = 1.2;

        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 250) {
            ctx.obstacles.splice(i, 1);
          }
        }

        ctx.addHitstop(0.085);
        ctx.addScreenShake(24);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          265,
          '#f8fafc',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 24,
          'GURA GURA SEAQUAKE!!',
          '#f8fafc',
          'powerup',
        );
        ctx.spawnParticles(owner.x, owner.y, 32, '#e2e8f0', 100, 360, 3.5, 7, 'shard');
        ctx.emitSfx({ type: 'wall', intensity: 1.5 });

        const quakeDmg = 14.5 + Math.min(6.0, data.swallowedCount * 1.1);
        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 265 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, quakeDmg),
              (dx / d) * 580,
              (dy / d) * 580,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
          }
        }
      }
    }
  },
};
