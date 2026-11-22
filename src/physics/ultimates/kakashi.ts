import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface KamuiVortex {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  hitUids: Record<string, boolean>;
}

export interface KakashiUltimateData {
  stage: 'kamui-shuriken' | 'raikiri-dash' | 'aftermath';
  vortices: KamuiVortex[];
  raikiriX1: number;
  raikiriY1: number;
  raikiriX2: number;
  raikiriY2: number;
  raikiriFlash: number;
}

export const kakashiUltimateHandler: UltimateHandler = {
  characterId: 'kakashi',
  title: 'DOUBLE MANGEKYO: KAMUI RAIKIRI',
  subtitle:
    'Hurls 3 Kamui Shuriken absorbing enemy projectiles & warping space around foes → Dashes straight through with Kamui Lightning Blade piercing all invulnerability!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const baseAng = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    const vortices: KamuiVortex[] = [];

    for (let i = -1; i <= 1; i++) {
      const a = baseAng + i * 0.34;
      vortices.push({
        x: owner.x + Math.cos(a) * (owner.radius + 14),
        y: owner.y + Math.sin(a) * (owner.radius + 14),
        vx: Math.cos(a) * 360,
        vy: Math.sin(a) * 360,
        radius: 34,
        life: 1.85,
        hitUids: {},
      });
    }

    const data: KakashiUltimateData = {
      stage: 'kamui-shuriken',
      vortices,
      raikiriX1: owner.x,
      raikiriY1: owner.y,
      raikiriX2: owner.x,
      raikiriY2: owner.y,
      raikiriFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, baseAng, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#0ea5e9',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'DOUBLE MANGEKYO · KAMUI!',
      '#7dd3fc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#38bdf8', 75, 250, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KakashiUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.raikiriFlash > 0) {
      data.raikiriFlash = Math.max(0, data.raikiriFlash - dt);
    }

    // Update 3 swirling Kamui Shuriken dimensionality vortices (banishing projectiles & trapping foes!)
    for (let i = data.vortices.length - 1; i >= 0; i--) {
      const v = data.vortices[i];
      v.life -= dt;
      v.x = Math.max(left + v.radius, Math.min(right - v.radius, v.x + v.vx * dt));
      v.y = Math.max(top + v.radius, Math.min(bottom - v.radius, v.y + v.vy * dt));

      // Warp away enemy projectiles intersecting Kamui vortex!
      for (let pIdx = ctx.projectiles.length - 1; pIdx >= 0; pIdx--) {
        const p = ctx.projectiles[pIdx];
        if (p.ownerUid !== owner.uid && Math.hypot(p.x - v.x, p.y - v.y) <= v.radius + p.radius) {
          ctx.spawnParticles(p.x, p.y, 7, '#a855f7', 50, 150, 2, 4.5, 'star');
          ctx.projectiles.splice(pIdx, 1);
        }
      }

      for (const e of enemies) {
        if (!v.hitUids[e.uid] && Math.hypot(e.x - v.x, e.y - v.y) <= v.radius + e.radius) {
          v.hitUids[e.uid] = true;
          applyFighterStun(ctx, owner, e, 0.55, 'void-overload', 'KAMUI WARP!');
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }

      if (v.life <= 0) data.vortices.splice(i, 1);
    }

    // Stage 2 (1.85s): KAMUI RAIKIRI! Dimensional-phase dash bypassing invulnerability!
    if (data.stage === 'kamui-shuriken' && state.elapsed >= 1.85) {
      data.stage = 'raikiri-dash';
      data.raikiriFlash = 1.05;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.raikiriX1 = owner.x;
      data.raikiriY1 = owner.y;

      const endX = target
        ? Math.max(
            left + owner.radius + 10,
            Math.min(right - owner.radius - 10, target.x + Math.cos(ang) * 48),
          )
        : Math.max(
            left + owner.radius + 10,
            Math.min(right - owner.radius - 10, owner.x + Math.cos(ang) * 210),
          );
      const endY = target
        ? Math.max(
            top + owner.radius + 10,
            Math.min(bottom - owner.radius - 10, target.y + Math.sin(ang) * 48),
          )
        : Math.max(
            top + owner.radius + 10,
            Math.min(bottom - owner.radius - 10, owner.y + Math.sin(ang) * 210),
          );

      owner.afterimages.push({
        x: owner.x,
        y: owner.y,
        alpha: 0.9,
        color: '#38bdf8',
        formIndex: owner.formIndex,
      });
      owner.x = endX;
      owner.y = endY;
      owner.invulnTimer = Math.max(owner.invulnTimer, 0.45);
      data.raikiriX2 = endX;
      data.raikiriY2 = endY;

      ctx.addHitstop(0.075);
      ctx.addScreenShake(19);
      ctx.spawnShockwave(endX, endY, 195, '#38bdf8', 7, owner.character.id, owner.character.series);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'KAMUI RAIKIRI!!',
        '#bae6fd',
        'powerup',
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });

      const segDx = data.raikiriX2 - data.raikiriX1;
      const segDy = data.raikiriY2 - data.raikiriY1;
      const segLen = Math.max(1, Math.hypot(segDx, segDy));
      const ux = segDx / segLen;
      const uy = segDy / segLen;

      for (const e of enemies) {
        const rx = e.x - data.raikiriX1;
        const ry = e.y - data.raikiriY1;
        const along = rx * ux + ry * uy;
        const perp = Math.abs(-rx * uy + ry * ux);
        if (along >= -e.radius && along <= segLen + e.radius + 20 && perp <= e.radius + 44) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.5), ux * 480, uy * 480, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 18, '#38bdf8', 90, 310, 3, 6.5, 'star');
        }
      }
    } else if (data.stage === 'raikiri-dash' && data.raikiriFlash <= 0) {
      data.stage = 'aftermath';
    }
  },
};
