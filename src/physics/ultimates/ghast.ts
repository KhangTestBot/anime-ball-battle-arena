import type { UltimateHandler } from './types';

export interface GhastUltimateData {
  fireballsDropped: number;
  dropCd: number;
  lastX: number;
  lastY: number;
  flash: number;
}

export const ghastUltimateHandler: UltimateHandler = {
  characterId: 'ghast',
  title: 'NETHER TEARS · MEGA GHAST FIREBALL CARPET',
  subtitle:
    'Floats untargetable above the lava, raining 4 colossal explosive Ghast Fireballs that shatter obstacles, strip shields & scorch foes!',
  bannerColor: '#f8fafc',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.75);
    const data: GhastUltimateData = {
      fireballsDropped: 0,
      dropCd: 0.35,
      lastX: owner.x,
      lastY: owner.y,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#f8fafc', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'GHAST SCREECH!!',
      '#fca5a5',
      'powerup',
    );
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GhastUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (data.fireballsDropped < 4) {
      data.dropCd -= dt;
      if (data.dropCd <= 0) {
        data.dropCd = 0.65;
        data.fireballsDropped += 1;
        data.flash = 0.55;
        const enemies = ctx.getEnemies(owner);
        const target =
          enemies[data.fireballsDropped % Math.max(1, enemies.length)] ??
          ctx.getNearestEnemy(owner);
        if (target) {
          data.lastX = target.x;
          data.lastY = target.y;

          for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
            if (Math.hypot(ctx.obstacles[i].x - target.x, ctx.obstacles[i].y - target.y) <= 170) {
              ctx.obstacles.splice(i, 1);
            }
          }

          for (const e of ctx.getEnemies(owner)) {
            if (Math.hypot(e.x - target.x, e.y - target.y) <= 175 + e.radius) {
              e.burnTimer = Math.max(e.burnTimer, 3.8);
              e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 4.5));
              e.burnOwnerUid = owner.uid;
              if (data.fireballsDropped === 4) e.shieldTimer = 0;
              ctx.applyDamage(
                owner,
                e,
                ctx.getEffectiveDamage(owner, data.fireballsDropped === 4 ? 17.0 : 9.8),
                0,
                0,
                {
                  isCrit: data.fireballsDropped === 4,
                  bypassInvuln: data.fireballsDropped === 4,
                  sourceKind: 'ability',
                },
              );
            }
          }
          ctx.spawnShockwave(
            target.x,
            target.y,
            185,
            '#f97316',
            7,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(target.x, target.y, 22, '#f97316', 80, 260, 3, 6.5, 'pixel');
          ctx.addScreenShake(13);
          ctx.emitSfx({ type: 'ko', intensity: 1.15 });
        }
      }
    }
  },
};
