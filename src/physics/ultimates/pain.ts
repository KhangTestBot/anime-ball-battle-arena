import type { UltimateHandler } from './types';

export interface ChibakuRock {
  angle: number;
  dist: number;
}

export interface PainUltimateData {
  stage: 'shinra-tensei' | 'chibaku-pull' | 'collapse';
  coreX: number;
  coreY: number;
  coreRadius: number;
  rocks: ChibakuRock[];
  pullTick: number;
}

export const painUltimateHandler: UltimateHandler = {
  characterId: 'pain',
  title: 'ALMIGHTY PUSH & PLANETARY DEVASTATION',
  subtitle:
    'Shinra Tensei blasts away all enemies & reflects projectiles → Launches a Chibaku Tensei black core pulling foes inward before crushing them with meteors!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    // 1. ALMIGHTY PUSH (SHINRA TENSEI!): Blast all enemies & flip projectiles outward!
    for (const e of enemies) {
      const dx = e.x - owner.x;
      const dy = e.y - owner.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      ctx.applyDamage(
        owner,
        e,
        ctx.getEffectiveDamage(owner, 6.5),
        (dx / d) * 650,
        (dy / d) * 650,
        {
          sourceKind: 'ability',
        },
      );
    }
    for (const p of ctx.projectiles) {
      if (p.ownerUid !== owner.uid) {
        p.ownerUid = owner.uid;
        p.teamId = owner.teamId;
        p.vx = -p.vx * 1.3;
        p.vy = -p.vy * 1.3;
        p.color = '#c084fc';
      }
    }

    const rocks: ChibakuRock[] = [];
    for (let i = 0; i < 10; i++) {
      rocks.push({ angle: (i * Math.PI * 2) / 10, dist: 165 });
    }

    const coreX = Math.max(left + 70, Math.min(right - 70, (left + right) / 2));
    const coreY = Math.max(top + 70, Math.min(bottom - 70, (top + bottom) / 2));

    const data: PainUltimateData = {
      stage: 'shinra-tensei',
      coreX,
      coreY,
      coreRadius: 14,
      rocks,
      pullTick: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      290,
      '#c084fc',
      7.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'SHINRA TENSEI!!',
      '#d8b4fe',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#a855f7', 90, 320, 3, 6.5, 'ring');
    ctx.addScreenShake(16);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'wall', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PainUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.stage === 'shinra-tensei') {
      if (state.elapsed >= 1.0) {
        data.stage = 'chibaku-pull';
        ctx.spawnFloatingText(
          data.coreX,
          data.coreY - 26,
          'CHIBAKU TENSEI!!',
          '#c084fc',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-charge', intensity: 1.3 });
      }
      return;
    }

    if (data.stage === 'chibaku-pull') {
      // Planetoid rubble spirals inward onto Chibaku Core; strong gravity drags all enemies toward core!
      data.coreRadius = Math.min(48, data.coreRadius + dt * 16);
      for (const rock of data.rocks) {
        rock.angle += dt * 3.8;
        rock.dist = Math.max(data.coreRadius + 4, rock.dist - dt * 62);
      }

      for (const e of enemies) {
        if (e.unstoppableTimer > 0) continue;
        const dx = data.coreX - e.x;
        const dy = data.coreY - e.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        if (dist <= 360) {
          e.vx += (dx / dist) * 480 * dt;
          e.vy += (dy / dist) * 480 * dt;
        }
      }

      data.pullTick += dt;
      if (data.pullTick >= 0.45) {
        data.pullTick -= 0.45;
        for (const e of enemies) {
          if (Math.hypot(e.x - data.coreX, e.y - data.coreY) <= data.coreRadius + e.radius + 32) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.4), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
      }

      if (state.elapsed >= 3.25) {
        data.stage = 'collapse';
        ctx.addHitstop(0.08);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          data.coreX,
          data.coreY,
          240,
          '#a855f7',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(data.coreX, data.coreY - 26, 'PLANETARY CRUSH!!', '#e9d5ff', 'crit');
        ctx.spawnParticles(data.coreX, data.coreY, 32, '#c084fc', 110, 360, 3.5, 7, 'shard');
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });

        for (const e of enemies) {
          const dx = e.x - data.coreX;
          const dy = e.y - data.coreY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 200 + e.radius) {
            const d = Math.max(1, dist);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 16.5),
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
