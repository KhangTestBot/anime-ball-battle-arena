import type { UltimateHandler } from './types';

export interface RukiaUltimateData {
  zeroX: number;
  zeroY: number;
  zeroRadius: number;
  frozenBullets: number;
  shattered: boolean;
  snowFlash: number;
}

export const rukiaUltimateHandler: UltimateHandler = {
  characterId: 'rukia',
  title: 'BANKAI: HAKKA NO TOGAME (-273.15°C ABSOLUTE ZERO)',
  subtitle:
    'Drops temperature to Absolute Zero -273.15°C (brief Immortality + FREEZES all mid-air projectiles & shatters them!) · Blocks healing, breaks shields & flash-freezes the arena!',
  bannerColor: '#7dd3fc',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 0.9);
    const frozenRadius = 265;

    let frozenCount = 0;
    for (const p of ctx.projectiles) {
      if (p.ownerUid !== owner.uid && Math.hypot(p.x - owner.x, p.y - owner.y) <= frozenRadius) {
        p.frozenTimer = Math.max(p.frozenTimer ?? 0, 1.8);
        frozenCount++;
      }
    }

    const data: RukiaUltimateData = {
      zeroX: owner.x,
      zeroY: owner.y,
      zeroRadius: frozenRadius,
      frozenBullets: frozenCount,
      shattered: false,
      snowFlash: 0.9,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7dd3fc', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      frozenRadius,
      '#f8fafc',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'HAKKA NO TOGAME (-273.15°C)!',
      '#f8fafc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 32, '#e0f2fe', 50, 190, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RukiaUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.snowFlash > 0) data.snowFlash = Math.max(0, data.snowFlash - dt);

    // Keep Absolute Zero mist freezing approaching bullets until Shatter!
    if (!data.shattered) {
      for (const p of ctx.projectiles) {
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - data.zeroX, p.y - data.zeroY) <= data.zeroRadius
        ) {
          if (!p.frozenTimer || p.frozenTimer <= 0) {
            data.frozenBullets++;
          }
          p.frozenTimer = Math.max(p.frozenTimer ?? 0, 0.25);
        }
      }
    }

    // Climax (1.75s): Absolute Zero Shatter!! Dissolves all frozen bullets & shatters chilled foes!
    if (!data.shattered && state.elapsed >= 1.75) {
      data.shattered = true;
      data.snowFlash = 1.25;

      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        if (
          ctx.projectiles[i].ownerUid !== owner.uid &&
          Math.hypot(ctx.projectiles[i].x - data.zeroX, ctx.projectiles[i].y - data.zeroY) <=
            data.zeroRadius + 40
        ) {
          ctx.spawnParticles(
            ctx.projectiles[i].x,
            ctx.projectiles[i].y,
            6,
            '#e0f2fe',
            45,
            130,
            2.5,
            5,
            'shard',
          );
          ctx.projectiles.splice(i, 1);
        }
      }

      for (const e of enemies) {
        if (Math.hypot(e.x - data.zeroX, e.y - data.zeroY) <= data.zeroRadius + e.radius) {
          e.shieldTimer = 0;
          e.frostTimer = Math.max(e.frostTimer, 3.2);
          e.antiHealTimer = Math.max(e.antiHealTimer, 2.8);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 14.5 + Math.min(5.5, data.frozenBullets * 0.9)),
            0,
            0,
            {
              bypassInvuln: true,
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'ABSOLUTE ZERO!', '#f8fafc', 'crit');
        }
      }

      ctx.spawnShockwave(
        data.zeroX,
        data.zeroY,
        275,
        '#e0f2fe',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(18);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
