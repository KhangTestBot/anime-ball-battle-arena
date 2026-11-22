import type { UltimateHandler } from './types';

export interface TableFlipRock {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vRot: number;
}

export interface SaitamaUltimateData {
  stage: 'table-flip' | 'death-windup' | 'punched';
  timer: number;
  punchAngle: number;
  halfConeRad: number; // ~40 deg each side = 80 deg directional Serious Punch cone!
  rocks: TableFlipRock[];
  punchFlash: number;
  originX: number;
  originY: number;
}

function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export const saitamaUltimateHandler: UltimateHandler = {
  characterId: 'saitama',
  title: 'DEATH · SERIOUS PUNCH² (ULTIMATE ONE-PUNCH)',
  subtitle:
    'Serious Table Flip launches 8 boulders → Freeze-frame 死 DEATH → Unleashes Serious Punch dealing ABSOLUTE DAMAGE (~85% Max HP, breaks shields & locks dodge) blasting foes at 1650 px/s into walls!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 2.65,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.0);

    // Phase 1: SERIOUS TABLE FLIP -> launch 8 spinning arena rocks & scramble enemy momentum!
    const rocks: TableFlipRock[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8 + Math.random() * 0.3;
      const spd = 240 + Math.random() * 210;
      rocks.push({
        x: owner.x + Math.cos(a) * 26,
        y: owner.y + Math.sin(a) * 26,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: 13 + (i % 3) * 4,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 14,
      });
    }

    for (const e of ctx.getEnemies(owner)) {
      const a = Math.atan2(e.y - owner.y, e.x - owner.x);
      e.vx += Math.cos(a) * 260;
      e.vy += Math.sin(a) * 260 - 140;
      e.confusedTimer = Math.max(e.confusedTimer, 0.75);
      ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 14.0), 0, 0, {
        sourceKind: 'ability',
      });
    }

    const data: SaitamaUltimateData = {
      stage: 'table-flip',
      timer: 0.78,
      punchAngle: angle,
      halfConeRad: (58 * Math.PI) / 180,
      rocks,
      punchFlash: 0,
      originX: owner.x,
      originY: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SERIOUS TABLE FLIP!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'wall', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SaitamaUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    // Animate spinning arena table-flip rocks
    for (const rock of data.rocks) {
      rock.x += rock.vx * dt;
      rock.y += rock.vy * dt;
      rock.rot += rock.vRot * dt;
      if (rock.x < left + 12 || rock.x > right - 12) rock.vx *= -0.8;
      if (rock.y < top + 12 || rock.y > bottom - 12) rock.vy *= -0.8;
    }

    if (data.stage === 'table-flip') {
      data.timer -= dt;
      data.originX = owner.x;
      data.originY = owner.y;
      if (data.timer <= 0) {
        data.stage = 'death-windup';
        data.timer = 0.25; // Counterplay window: fast enemies can slip behind Saitama during 0.25s DEATH freeze!
        const nearest = ctx.getNearestEnemy(owner);
        if (nearest) {
          data.punchAngle = Math.atan2(nearest.y - owner.y, nearest.x - owner.x);
          owner.facingAngle = data.punchAngle;
        }
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          '死  DEATH',
          '#ef4444',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-charge' });
      }
      return;
    }

    if (data.stage === 'death-windup') {
      owner.vx *= Math.pow(0.05, dt);
      owner.vy *= Math.pow(0.05, dt);
      data.originX = owner.x;
      data.originY = owner.y;
      data.timer -= dt;
      if (data.timer <= 0) {
        const lockTarget = ctx.getNearestEnemy(owner);
        if (lockTarget) {
          data.punchAngle = Math.atan2(lockTarget.y - owner.y, lockTarget.x - owner.x);
          owner.facingAngle = data.punchAngle;
        }
        data.stage = 'punched';
        data.punchFlash = 0.9;

        // Omni-directional Serious Side-Hops visual afterimages burst
        for (let i = 0; i < 6; i++) {
          const sa = (i * Math.PI * 2) / 6;
          owner.afterimages.push({
            x: owner.x + Math.cos(sa) * 32,
            y: owner.y + Math.sin(sa) * 32,
            alpha: 0.78,
            color: '#facc15',
            formIndex: owner.formIndex,
          });
        }

        ctx.addHitstop(0.09);
        ctx.addScreenShake(26);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          310,
          '#ffffff',
          10,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 24,
          'SERIOUS PUNCH!! ONE PUNCH!!',
          '#facc15',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.5 });

        // Vaporize projectiles strictly inside the 80-degree forward pressure cone!
        for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
          const p = ctx.projectiles[i];
          if (p.ownerUid === owner.uid) continue;
          const ang = Math.atan2(p.y - owner.y, p.x - owner.x);
          if (Math.abs(angleDiff(ang, data.punchAngle)) <= data.halfConeRad + 0.22) {
            ctx.spawnParticles(p.x, p.y, 7, '#ffffff', 80, 250, 2, 5, 'shard');
            ctx.projectiles.splice(i, 1);
          }
        }

        // TRUE ULTIMATE ONE-PUNCH DAMAGE across the forward shock cone!
        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          const ang = Math.atan2(dy, dx);
          if (
            dist <= 680 &&
            (dist < owner.radius + e.radius + 24 ||
              Math.abs(angleDiff(ang, data.punchAngle)) <= data.halfConeRad)
          ) {
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
            e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.0);

            const pDirX = Math.cos(data.punchAngle);
            const pDirY = Math.sin(data.punchAngle);
            const onePunchDmg = Math.max(ctx.getEffectiveDamage(owner, 145), e.maxHp * 0.98);
            ctx.applyDamage(owner, e, onePunchDmg, pDirX * 1900, pDirY * 1900, {
              isCrit: true,
              sourceKind: 'ability',
            });
            ctx.spawnFloatingText(e.x, e.y - e.radius - 20, 'ONE PUNCH!!', '#ef4444', 'crit');
            ctx.spawnParticles(e.x, e.y, 28, '#facc15', 130, 440, 3.5, 7.5, 'shard');
          }
        }
      }
      return;
    }

    if (data.punchFlash > 0) {
      data.punchFlash = Math.max(0, data.punchFlash - dt);
    }
  },
};
