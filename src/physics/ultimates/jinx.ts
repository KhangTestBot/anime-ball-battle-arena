import type { UltimateHandler } from './types';

export interface FlameChomperTrap {
  id: string;
  x: number;
  y: number;
  armed: boolean;
  triggered: boolean;
  life: number;
}

export interface MegaDeathRocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  distTraveled: number;
  active: boolean;
  exploded: boolean;
  explodeX: number;
  explodeY: number;
  explodeTimer: number;
}

export interface JinxUltimateData {
  chompers: FlameChomperTrap[];
  rocket: MegaDeathRocket;
  minigunCd: number;
  excitedActive: boolean;
}

export const jinxUltimateHandler: UltimateHandler = {
  characterId: 'jinx',
  title: 'SUPER MEGA DEATH ROCKET! & GET EXCITED!',
  subtitle:
    '3 Flame Chompers root enemies · Accelerating Shark Rocket executes by missing HP% · Get Excited! grants +75% speed!',
  bannerColor: '#ec4899',
  castDuration: 0.28,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    // Place a line of 3 Flame Chompers between Jinx and target!
    const perp = angle + Math.PI / 2;
    const midDist = 92;
    const chompers: FlameChomperTrap[] = [-48, 0, 48].map((offset, idx) => ({
      id: ctx.nextId(`chomp_${idx}`),
      x: Math.max(
        ctx.bounds.left + 26,
        Math.min(
          ctx.bounds.right - 26,
          owner.x + Math.cos(angle) * midDist + Math.cos(perp) * offset,
        ),
      ),
      y: Math.max(
        ctx.bounds.top + 26,
        Math.min(
          ctx.bounds.bottom - 26,
          owner.y + Math.sin(angle) * midDist + Math.sin(perp) * offset,
        ),
      ),
      armed: true,
      triggered: false,
      life: 3.6,
    }));

    const data: JinxUltimateData = {
      chompers,
      rocket: {
        x: owner.x + Math.cos(angle) * (owner.radius + 14),
        y: owner.y + Math.sin(angle) * (owner.radius + 14),
        vx: Math.cos(angle) * 260,
        vy: Math.sin(angle) * 260,
        angle,
        speed: 260,
        distTraveled: 0,
        active: true,
        exploded: false,
        explodeX: owner.x,
        explodeY: owner.y,
        explodeTimer: 0,
      },
      minigunCd: 0.25,
      excitedActive: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'BYE BYE! MEGA ROCKET!',
      '#ec4899',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#38bdf8', 70, 250, 3, 6, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'beam-fire' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JinxUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Update Flame Chompers traps -> root enemies for 1.1s on contact!
    for (let i = data.chompers.length - 1; i >= 0; i--) {
      const trap = data.chompers[i];
      trap.life -= dt;
      if (!trap.triggered) {
        for (const e of enemies) {
          if (Math.hypot(e.x - trap.x, e.y - trap.y) <= e.radius + 16) {
            trap.triggered = true;
            e.savedVx = e.vx;
            e.savedVy = e.vy;
            e.stunTimer = Math.max(e.stunTimer, 1.05);
            e.stunKind = 'chained';
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 5.5), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'CHOMPED!', '#facc15', 'callout');
            ctx.spawnParticles(trap.x, trap.y, 12, '#f97316', 60, 200, 2.5, 5, 'star');
            ctx.emitSfx({ type: 'hit', intensity: 1.0 });
            break;
          }
        }
      }
      if (trap.triggered || trap.life <= 0) {
        data.chompers.splice(i, 1);
      }
    }

    // 2. Accelerate Shark-Head Super Mega Death Rocket (scales with distance traveled + missing HP execute!)
    const r = data.rocket;
    if (r.active) {
      r.speed = Math.min(920, r.speed + 760 * dt);
      r.vx = Math.cos(r.angle) * r.speed;
      r.vy = Math.sin(r.angle) * r.speed;
      const stepDist = r.speed * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.distTraveled += stepDist;

      let shouldExplode = false;
      let hitEnemyDirectly = false;

      for (const e of enemies) {
        if (Math.hypot(e.x - r.x, e.y - r.y) <= e.radius + 20) {
          shouldExplode = true;
          hitEnemyDirectly = true;
          break;
        }
      }

      if (
        !shouldExplode &&
        (r.x <= ctx.bounds.left + 14 ||
          r.x >= ctx.bounds.right - 14 ||
          r.y <= ctx.bounds.top + 14 ||
          r.y >= ctx.bounds.bottom - 14)
      ) {
        shouldExplode = true;
      }

      if (shouldExplode) {
        r.active = false;
        r.exploded = true;
        r.explodeX = Math.max(ctx.bounds.left + 20, Math.min(ctx.bounds.right - 20, r.x));
        r.explodeY = Math.max(ctx.bounds.top + 20, Math.min(ctx.bounds.bottom - 20, r.y));
        r.explodeTimer = 0.85;

        // Distance multiplier: 0.85x point-blank -> 1.85x long-range across arena!
        const distMult = 0.85 + Math.min(1.0, r.distTraveled / 420);
        const blastR = 168;

        ctx.addScreenShake(15);
        ctx.addHitstop(0.055);
        ctx.spawnShockwave(
          r.explodeX,
          r.explodeY,
          blastR,
          '#ec4899',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnShockwave(
          r.explodeX,
          r.explodeY,
          blastR * 0.72,
          '#38bdf8',
          5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(r.explodeX, r.explodeY, 28, '#ec4899', 100, 380, 3, 7, 'star');
        ctx.spawnParticles(r.explodeX, r.explodeY, 20, '#38bdf8', 90, 320, 3, 6, 'star');
        ctx.spawnFloatingText(r.explodeX, r.explodeY - 24, 'BOOM!! X_X', '#ec4899', 'powerup');
        ctx.emitSfx({ type: 'ko', intensity: 1.2 });

        let damagedAny = hitEnemyDirectly;
        for (const e of enemies) {
          const dx = e.x - r.explodeX;
          const dy = e.y - r.explodeY;
          const d = Math.hypot(dx, dy);
          if (d <= blastR + e.radius) {
            damagedAny = true;
            // Execute bonus: up to +60% extra damage based on target's missing HP %!
            const missingRatio = Math.max(0, Math.min(1, 1 - e.hp / Math.max(1, e.maxHp)));
            const executeMult = 1 + missingRatio * 0.6;
            const nx = d > 0.1 ? dx / d : 1;
            const ny = d > 0.1 ? dy / d : 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 13.5 * distMult * executeMult),
              nx * 560,
              ny * 560,
              { isCrit: distMult > 1.35 || missingRatio > 0.45, sourceKind: 'ability' },
            );
          }
        }

        if (damagedAny) {
          data.excitedActive = true;
          owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.5);
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 18,
            'GET EXCITED!!',
            '#38bdf8',
            'callout',
          );
        }
      }
    } else if (r.explodeTimer > 0) {
      r.explodeTimer = Math.max(0, r.explodeTimer - dt);
    }

    // 3. Get Excited! Rapid Pow-Pow Minigun bursts while excited
    if (data.excitedActive && enemies.length > 0) {
      data.minigunCd -= dt;
      if (data.minigunCd <= 0) {
        data.minigunCd = 0.22;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang =
            Math.atan2(target.y - owner.y, target.x - owner.x) + (Math.random() - 0.5) * 0.16;
          ctx.projectiles.push({
            id: ctx.nextId('powpow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            x: owner.x + Math.cos(ang) * (owner.radius + 8),
            y: owner.y + Math.sin(ang) * (owner.radius + 8),
            vx: Math.cos(ang) * 760,
            vy: Math.sin(ang) * 760,
            radius: 5.5,
            damage: ctx.getEffectiveDamage(owner, 3.4),
            knockback: 110,
            color: '#facc15',
            secondaryColor: '#ec4899',
            angle: ang,
            piercing: false,
            powerLevel: 2,
            life: 0.9,
            maxLife: 0.9,
            kind: 'ki-blast',
            hitCooldowns: {},
          });
          ctx.emitSfx({ type: 'hit', intensity: 0.5 });
        }
      }
    }
  },
};
