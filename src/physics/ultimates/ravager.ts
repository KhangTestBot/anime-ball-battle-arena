import type { UltimateHandler } from './types';

export interface RavagerUltimateData {
  chargesDone: number;
  chargeCd: number;
  roarFired: boolean;
  flash: number;
}

export const ravagerUltimateHandler: UltimateHandler = {
  characterId: 'ravager',
  title: 'ILLAGER RAID: UNSTOPPABLE BEAST CHARGE & ROAR',
  subtitle:
    'Grows into a giant unstoppable Ravager bulldozing every obstacle on the arena, finishing with a massive knockback Ravager Roar!',
  bannerColor: '#64748b',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.4);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.2);

    const data: RavagerUltimateData = {
      chargesDone: 0,
      chargeCd: 0.35,
      roarFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#64748b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ILLAGER RAID!!',
      '#cbd5e1',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RavagerUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Bulldoze obstacles near the Ravager!
    for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
      if (
        Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <=
        owner.radius + 75
      ) {
        ctx.spawnParticles(
          ctx.obstacles[i].x,
          ctx.obstacles[i].y,
          10,
          '#94a3b8',
          60,
          200,
          3,
          6,
          'pixel',
        );
        ctx.obstacles.splice(i, 1);
      }
    }

    if (!data.roarFired && data.chargesDone < 2) {
      data.chargeCd -= dt;
      if (data.chargeCd <= 0) {
        data.chargeCd = 0.72;
        data.chargesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 580;
          owner.vy = Math.sin(ang) * 580;
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.2 });
      }
    }

    if (!data.roarFired && state.elapsed >= 1.95) {
      data.roarFired = true;
      data.flash = 1.25;
      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        ctx.obstacles.splice(i, 1);
      }
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#cbd5e1',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'RAVAGER ROAR!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
