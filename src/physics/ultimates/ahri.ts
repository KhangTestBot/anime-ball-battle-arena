import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface CharmHeartProj {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  life: number;
}

export interface FoxFireWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetUid: string;
  life: number;
}

export interface AhriDashTrail {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface AhriUltimateData {
  heart: CharmHeartProj;
  dashesLeft: number;
  dashTimer: number;
  wisps: FoxFireWisp[];
  dashTrails: AhriDashTrail[];
  killsAtCast: number;
  resetsGranted: number;
}

export const ahriUltimateHandler: UltimateHandler = {
  characterId: 'ahri',
  title: 'SPIRIT RUSH & CHARM',
  subtitle:
    'Charm forcibly pulls enemies in · 3 Spirit Rush dashes firing Fox-Fire with 35% lifesteal (+1 dash reset on takedown)!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 4.4,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const data: AhriUltimateData = {
      heart: {
        x: owner.x + Math.cos(angle) * (owner.radius + 10),
        y: owner.y + Math.sin(angle) * (owner.radius + 10),
        vx: Math.cos(angle) * 540,
        vy: Math.sin(angle) * 540,
        active: true,
        life: 1.4,
      },
      dashesLeft: 3,
      dashTimer: 0.35,
      wisps: [],
      dashTrails: [],
      killsAtCast: owner.kills,
      resetsGranted: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'CHARM · SPIRIT RUSH!',
      '#f472b6',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#f472b6', 60, 220, 2.5, 5.5, 'petal');
    ctx.addScreenShake(6);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AhriUltimateData;
    const enemies = ctx.getEnemies(owner);

    // Kill Reset: +1 Spirit Rush dash when Ahri scores a KO during ultimate (max 2 resets)!
    if (owner.kills > data.killsAtCast && data.resetsGranted < 2) {
      const gained = Math.min(2 - data.resetsGranted, owner.kills - data.killsAtCast);
      data.killsAtCast = owner.kills;
      data.resetsGranted += gained;
      data.dashesLeft += gained;
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'SPIRIT RESET +1!',
        '#38bdf8',
        'callout',
      );
    }

    // Decay dash trails
    for (let i = data.dashTrails.length - 1; i >= 0; i--) {
      data.dashTrails[i].life -= dt;
      if (data.dashTrails[i].life <= 0) data.dashTrails.splice(i, 1);
    }

    // 1. Update Charm Heart projectile (hits first enemy OR blocked by obstacle/minion!)
    if (data.heart.active) {
      data.heart.x += data.heart.vx * dt;
      data.heart.y += data.heart.vy * dt;
      data.heart.life -= dt;

      // Obstacle block check
      for (const obs of ctx.obstacles) {
        if (obs.blocksProjectiles && obs.ownerUid !== owner.uid) {
          if (
            Math.abs(data.heart.x - obs.x) <= obs.w * 0.5 + 10 &&
            Math.abs(data.heart.y - obs.y) <= obs.h * 0.5 + 10
          ) {
            data.heart.active = false;
            ctx.spawnParticles(data.heart.x, data.heart.y, 10, '#f472b6', 50, 150, 2, 4.5, 'petal');
            break;
          }
        }
      }

      if (data.heart.active) {
        for (const e of enemies) {
          if (Math.hypot(e.x - data.heart.x, e.y - data.heart.y) <= e.radius + 14) {
            data.heart.active = false;
            e.charmTimer = Math.max(e.charmTimer, 1.45);
            e.charmOwnerUid = owner.uid;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.5), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'CHARMED ♥', '#f472b6', 'callout');
            ctx.spawnShockwave(
              e.x,
              e.y,
              90,
              '#ec4899',
              4,
              owner.character.id,
              owner.character.series,
            );
            ctx.emitSfx({ type: 'powerup' });
            break;
          }
        }
      }

      if (
        data.heart.life <= 0 ||
        data.heart.x < ctx.bounds.left ||
        data.heart.x > ctx.bounds.right ||
        data.heart.y < ctx.bounds.top ||
        data.heart.y > ctx.bounds.bottom
      ) {
        data.heart.active = false;
      }
    }

    // 2. Sequential Spirit Rush Dashes (every 0.8s) -> each fires 3 homing Fox-Fire wisps!
    if (data.dashesLeft > 0 && enemies.length > 0) {
      data.dashTimer -= dt;
      if (data.dashTimer <= 0) {
        data.dashesLeft -= 1;
        data.dashTimer = 0.8;

        const target = ctx.getNearestEnemy(owner) ?? enemies[0];
        const angToTarget = Math.atan2(target.y - owner.y, target.x - owner.x);
        // Strafe around target stylishly
        const strafe = angToTarget + (data.dashesLeft % 2 === 0 ? 0.65 : -0.65);
        const startX = owner.x;
        const startY = owner.y;
        const dashDist = 135;
        owner.x = Math.max(
          ctx.bounds.left + owner.radius + 10,
          Math.min(ctx.bounds.right - owner.radius - 10, owner.x + Math.cos(strafe) * dashDist),
        );
        owner.y = Math.max(
          ctx.bounds.top + owner.radius + 10,
          Math.min(ctx.bounds.bottom - owner.radius - 10, owner.y + Math.sin(strafe) * dashDist),
        );
        owner.vx = Math.cos(strafe) * 320;
        owner.vy = Math.sin(strafe) * 320;
        owner.facingAngle = strafe;

        data.dashTrails.push({ x1: startX, y1: startY, x2: owner.x, y2: owner.y, life: 0.55 });
        ctx.spawnParticles(owner.x, owner.y, 12, '#38bdf8', 60, 190, 2, 4.5, 'petal');
        ctx.emitSfx({ type: 'dodge' });

        // Spawn 3 homing Spirit Rush Fox-Fires
        for (let k = 0; k < 3; k++) {
          const wTarget = enemies[k % enemies.length];
          const wAng = strafe + (k - 1) * 0.9;
          data.wisps.push({
            x: owner.x + Math.cos(wAng) * 20,
            y: owner.y + Math.sin(wAng) * 20,
            vx: Math.cos(wAng) * 260,
            vy: Math.sin(wAng) * 260,
            targetUid: wTarget.uid,
            life: 1.6,
          });
        }
      }
    }

    // 3. Update homing Fox-Fire wisps -> deal damage + 35% Spirit Lifesteal!
    for (let i = data.wisps.length - 1; i >= 0; i--) {
      const w = data.wisps[i];
      w.life -= dt;
      const target = enemies.find((e) => e.uid === w.targetUid) ?? ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - w.x;
        const dy = target.y - w.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        w.vx += (dx / d) * 1400 * dt;
        w.vy += (dy / d) * 1400 * dt;
        const spd = Math.hypot(w.vx, w.vy);
        if (spd > 520) {
          w.vx = (w.vx / spd) * 520;
          w.vy = (w.vy / spd) * 520;
        }
      }
      w.x += w.vx * dt;
      w.y += w.vy * dt;

      let hit = false;
      for (const e of enemies) {
        if (Math.hypot(e.x - w.x, e.y - w.y) <= e.radius + 10) {
          const dealt = ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 5.2),
            w.vx * 0.25,
            w.vy * 0.25,
            {
              sourceKind: 'ability',
            },
          );
          // 35% Essence Theft Lifesteal (respects Anti-Heal, Wither Decay & Demon Slayer Mark!)
          const hMult = getHealMultiplier(owner);
          if (dealt > 0 && owner.alive && hMult > 0) {
            const heal = Math.min(
              owner.maxHp - owner.hp,
              Math.max(1, Math.round(dealt * 0.35 * hMult)),
            );
            if (heal > 0) {
              owner.hp += heal;
              ctx.spawnFloatingText(
                owner.x,
                owner.y - owner.radius - 8,
                `+${heal}`,
                '#4ade80',
                'heal',
              );
            }
          }
          ctx.spawnParticles(w.x, w.y, 7, '#38bdf8', 50, 170, 2, 4, 'petal');
          hit = true;
          break;
        }
      }

      if (hit || w.life <= 0) {
        data.wisps.splice(i, 1);
      }
    }
  },
};
