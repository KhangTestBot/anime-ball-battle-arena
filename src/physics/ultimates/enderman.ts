import type { UltimateHandler } from './types';

export interface EndermanUltimateData {
  blinksDone: number;
  blinkCd: number;
  blocksStolen: number;
  lastX: number;
  lastY: number;
  flash: number;
}

export const endermanUltimateHandler: UltimateHandler = {
  characterId: 'enderman',
  title: 'ENDER TELEPORT AMBUSH & BLOCK THEFT',
  subtitle:
    'Phases past all projectiles, steals enemy obstacles off the stage, and chains 4 rapid Ender Blink backstabs shredding shields!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.8);
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.55);

    // Steal enemy obstacles directly off the arena!
    let stolen = 0;
    for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
      if (ctx.obstacles[i].ownerUid !== owner.uid) {
        ctx.spawnParticles(
          ctx.obstacles[i].x,
          ctx.obstacles[i].y,
          10,
          '#a855f7',
          50,
          180,
          3,
          6,
          'pixel',
        );
        ctx.obstacles.splice(i, 1);
        stolen += 1;
      }
    }

    const data: EndermanUltimateData = {
      blinksDone: 0,
      blinkCd: 0.28,
      blocksStolen: stolen,
      lastX: owner.x,
      lastY: owner.y,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'ENDER STARE!',
      '#c084fc',
      'powerup',
    );
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EndermanUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Authentic Minecraft Enderman projectile dodge: teleports past approaching projectiles!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 60
      ) {
        ctx.spawnParticles(p.x, p.y, 6, '#c084fc', 40, 120, 2.5, 5, 'pixel');
        ctx.projectiles.splice(i, 1);
      }
    }

    if (data.blinksDone < 4) {
      data.blinkCd -= dt;
      if (data.blinkCd <= 0) {
        data.blinkCd = 0.52;
        data.blinksDone += 1;
        data.flash = 0.45;
        data.lastX = owner.x;
        data.lastY = owner.y;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.x = Math.max(
            ctx.bounds.left + owner.radius,
            Math.min(ctx.bounds.right - owner.radius, target.x + Math.cos(ang) * 52),
          );
          owner.y = Math.max(
            ctx.bounds.top + owner.radius,
            Math.min(ctx.bounds.bottom - owner.radius, target.y + Math.sin(ang) * 52),
          );
          if (data.blinksDone === 4) {
            target.shieldTimer = 0;
          }
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, data.blinksDone === 4 ? 16.5 : 8.5),
            0,
            0,
            {
              isCrit: data.blinksDone === 4,
              bypassInvuln: data.blinksDone === 4,
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(target.x, target.y, 14, '#c084fc', 60, 200, 2.5, 5.5, 'pixel');
          ctx.emitSfx({ type: 'dodge', intensity: 1.15 });
        }
      }
    }
  },
};
