import { applyFighterBurn } from '../domains';
import type { UltimateHandler } from './types';

export interface EscanorUltimateData {
  sunX: number;
  sunY: number;
  sunRadius: number;
  sunActive: boolean;
  sunBurnTick: number;
  divineChopped: boolean;
  chopFlash: number;
  chopX: number;
  chopY: number;
  noonProgress: number;
}

export const escanorUltimateHandler: UltimateHandler = {
  characterId: 'escanor',
  title: '12:00 THE ONE · CRUEL SUN & DIVINE SWORD',
  subtitle:
    'High Noon 12:00 transforms into an unstoppable giant · Launches Cruel Sun incinerating projectiles & foes → Cleaves down with Divine Sword Escanor!',
  bannerColor: '#f59e0b',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.6);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.3);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 2.5);

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    const { left, right, top, bottom } = ctx.bounds;
    const sunX = Math.max(left + 54, Math.min(right - 54, owner.x + Math.cos(ang) * 78));
    const sunY = Math.max(top + 54, Math.min(bottom - 54, owner.y + Math.sin(ang) * 78));

    const data: EscanorUltimateData = {
      sunX,
      sunY,
      sunRadius: 44,
      sunActive: true,
      sunBurnTick: 0,
      divineChopped: false,
      chopFlash: 0,
      chopX: sunX,
      chopY: sunY,
      noonProgress: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#f59e0b', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      200,
      '#f59e0b',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      '12:00 THE ONE · CRUEL SUN!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(sunX, sunY, 22, '#f97316', 70, 240, 3, 6.5, 'star');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EscanorUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;
    data.noonProgress = Math.min(1, state.elapsed / 2.35);

    if (data.chopFlash > 0) {
      data.chopFlash = Math.max(0, data.chopFlash - dt);
    }

    // Hovering Cruel Sun orbits slowly toward nearest enemy, melting projectiles and scorching rivals!
    if (data.sunActive) {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - data.sunX;
        const dy = target.y - data.sunY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const speed = 135;
        data.sunX = Math.max(
          left + data.sunRadius + 8,
          Math.min(right - data.sunRadius - 8, data.sunX + (dx / dist) * speed * dt),
        );
        data.sunY = Math.max(
          top + data.sunRadius + 8,
          Math.min(bottom - data.sunRadius - 8, data.sunY + (dy / dist) * speed * dt),
        );
      }

      // Melt any enemy projectile entering Cruel Sun's corona!
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - data.sunX, p.y - data.sunY) <= data.sunRadius + 16 + p.radius
        ) {
          ctx.spawnParticles(p.x, p.y, 7, '#fb923c', 50, 170, 2.5, 5, 'circle');
          ctx.projectiles.splice(i, 1);
        }
      }

      data.sunBurnTick += dt;
      if (data.sunBurnTick >= 0.3) {
        data.sunBurnTick -= 0.3;
        for (const e of enemies) {
          if (Math.hypot(e.x - data.sunX, e.y - data.sunY) <= data.sunRadius + 56 + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.2), 0, 0, {
              sourceKind: 'ability',
            });
            applyFighterBurn(e, owner.uid, 2.5, ctx.getEffectiveDamage(owner, 2.4));
            ctx.spawnParticles(e.x, e.y, 6, '#f97316', 50, 150, 2, 4.5, 'circle');
          }
        }
      }
    }

    // Climax at 2.35s: DIVINE SWORD ESCANOR!! Vertical chop + Solar Detonation!
    if (!data.divineChopped && state.elapsed >= 2.35) {
      data.divineChopped = true;
      data.sunActive = false;
      const target = ctx.getNearestEnemy(owner);
      data.chopX = target ? target.x : data.sunX;
      data.chopY = target ? target.y : data.sunY;
      data.chopFlash = 1.0;

      // Surge Escanor right beside the chop point safely inside bounds
      const dx = data.chopX - owner.x;
      const dy = data.chopY - owner.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      owner.vx = (dx / d) * 520;
      owner.vy = (dy / d) * 520;

      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnShockwave(
        data.chopX,
        data.chopY,
        210,
        '#f59e0b',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnShockwave(
        data.sunX,
        data.sunY,
        185,
        '#ef4444',
        6.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'DIVINE SWORD ESCANOR!!',
        '#fef08a',
        'powerup',
      );
      ctx.spawnParticles(data.chopX, data.chopY, 28, '#fde047', 110, 360, 3.5, 7, 'star');
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });

      for (const e of enemies) {
        const hitChop = Math.hypot(e.x - data.chopX, e.y - data.chopY) <= 155 + e.radius;
        const hitSun = Math.hypot(e.x - data.sunX, e.y - data.sunY) <= 165 + e.radius;
        if (hitChop || hitSun) {
          const ex = e.x - owner.x;
          const ey = e.y - owner.y;
          const ed = Math.max(1, Math.hypot(ex, ey));
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 15.5),
            (ex / ed) * 540,
            (ey / ed) * 540,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          applyFighterBurn(e, owner.uid, 3.2, ctx.getEffectiveDamage(owner, 3.0));
        }
      }
    }
  },

  onExpire(_ctx, owner) {
    if (owner) {
      owner.giantTimer = 0;
    }
  },
};
