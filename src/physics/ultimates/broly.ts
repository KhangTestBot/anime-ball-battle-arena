import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface BrolyUltimateData {
  stage: 'rage-slam' | 'omega-blaster' | 'detonated';
  slamHit: boolean;
  omegaX: number;
  omegaY: number;
  omegaVx: number;
  omegaVy: number;
  omegaRadius: number;
  absorbedCount: number;
  roarFlash: number;
}

export const brolyUltimateHandler: UltimateHandler = {
  characterId: 'broly',
  title: 'LEGENDARY SUPER SAIYAN: GIGANTIC ROAR & OMEGA BLASTER',
  subtitle:
    'Berserk Retaliation (lower HP deals higher damage!) · Charges & drags enemies into walls smashing obstacles → Launches green Omega Blaster Ki Sphere that absorbs projectiles to grow before detonating!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.2);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.1);

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: BrolyUltimateData = {
      stage: 'rage-slam',
      slamHit: false,
      omegaX: owner.x,
      omegaY: owner.y,
      omegaVx: Math.cos(ang) * 430,
      omegaVy: Math.sin(ang) * 430,
      omegaRadius: 24,
      absorbedCount: 0,
      roarFlash: 0.5,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#22c55e', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#4ade80',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'LEGENDARY BERSERK RAGE!!',
      '#86efac',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#22c55e', 90, 300, 3, 6.5, 'star');
    ctx.addScreenShake(11);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BrolyUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.roarFlash > 0) data.roarFlash = Math.max(0, data.roarFlash - dt);

    const missingRatio = Math.max(
      0,
      Math.min(1, (owner.maxHp - owner.hp) / Math.max(1, owner.maxHp)),
    );
    const rageMult = 1 + missingRatio * 0.85;

    // 1. Berserk Rampage Surge + Wall Slam Smash (0.0s - 1.5s)
    if (data.stage === 'rage-slam') {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / dist;
        const uy = dy / dist;

        owner.vx = ux * 680;
        owner.vy = uy * 680;

        // Destroy obstructing blocks right through his rage path
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (
            Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <=
            owner.radius + 58
          ) {
            ctx.obstacles.splice(i, 1);
          }
        }

        if (!data.slamHit && dist <= owner.radius + target.radius + 42) {
          data.slamHit = true;
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.5);
          applyFighterStun(ctx, owner, target, 0.55, 'airborne', 'GIGANTIC SLAM!');
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 10.5 * rageMult),
            ux * 660,
            uy * 660,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            150,
            '#4ade80',
            5.5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.3 });
        }
      }

      if (state.elapsed >= 1.45) {
        data.stage = 'omega-blaster';
        const focus = ctx.getNearestEnemy(owner);
        const ang = focus ? Math.atan2(focus.y - owner.y, focus.x - owner.x) : owner.facingAngle;
        data.omegaX = Math.max(
          left + 32,
          Math.min(right - 32, owner.x + Math.cos(ang) * (owner.radius + 16)),
        );
        data.omegaY = Math.max(
          top + 32,
          Math.min(bottom - 32, owner.y + Math.sin(ang) * (owner.radius + 16)),
        );
        data.omegaVx = Math.cos(ang) * 410;
        data.omegaVy = Math.sin(ang) * 410;
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          'OMEGA BLASTER!!',
          '#4ade80',
          'powerup',
        );
      }
      return;
    }

    // 2. Omega Blaster Sphere moves, absorbs bullets, and grows!
    if (data.stage === 'omega-blaster') {
      data.omegaX += data.omegaVx * dt;
      data.omegaY += data.omegaVy * dt;

      // Absorb ALL enemy projectiles near the Omega Blaster orb to grow larger!
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (Math.hypot(p.x - data.omegaX, p.y - data.omegaY) <= data.omegaRadius + 24 + p.radius) {
          data.absorbedCount++;
          data.omegaRadius = Math.min(72, data.omegaRadius + 4.5);
          ctx.spawnParticles(p.x, p.y, 6, '#86efac', 45, 130, 2.5, 4.5, 'star');
          ctx.projectiles.splice(i, 1);
        }
      }

      const hitWall =
        data.omegaX <= left + data.omegaRadius ||
        data.omegaX >= right - data.omegaRadius ||
        data.omegaY <= top + data.omegaRadius ||
        data.omegaY >= bottom - data.omegaRadius;
      const hitEnemy = enemies.some(
        (e) => Math.hypot(e.x - data.omegaX, e.y - data.omegaY) <= e.radius + data.omegaRadius + 10,
      );

      if (hitWall || hitEnemy || state.elapsed >= 2.95) {
        data.stage = 'detonated';
        data.roarFlash = 1.1;
        data.omegaX = Math.max(left + 36, Math.min(right - 36, data.omegaX));
        data.omegaY = Math.max(top + 36, Math.min(bottom - 36, data.omegaY));

        const blastDmg = (13.5 + data.absorbedCount * 2.1) * rageMult;
        ctx.addHitstop(0.08);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          data.omegaX,
          data.omegaY,
          240,
          '#22c55e',
          8.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.omegaX,
          data.omegaY - 26,
          'GIGANTIC ROAR!!',
          '#bbf7d0',
          'powerup',
        );
        ctx.spawnParticles(data.omegaX, data.omegaY, 34, '#4ade80', 110, 380, 3.5, 7.5, 'star');
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });

        for (const e of enemies) {
          const dx = e.x - data.omegaX;
          const dy = e.y - data.omegaY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 195 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, blastDmg),
              (dx / d) * 560,
              (dy / d) * 560,
              { isCrit: true, sourceKind: 'ability' },
            );
          }
        }
      }
    }
  },
};
