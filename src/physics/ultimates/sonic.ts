import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface SonicGoldRing {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface SonicUltimateData {
  emeraldsAngle: number;
  emeraldsRadius: number;
  bouncesLeft: number;
  lastWallBounceCd: number;
  hitCooldowns: Record<string, number>;
  rings: SonicGoldRing[];
  machAngle: number;
}

export const sonicUltimateHandler: UltimateHandler = {
  characterId: 'sonic',
  title: 'SUPER SONIC: 7 CHAOS EMERALDS PINBALL',
  subtitle:
    '7 Chaos Emeralds trigger Supersonic form (1150 px/s) · Auto-angles toward foes across 7 wall ricochets · Drops healing Gold Rings!',
  bannerColor: '#facc15',
  castDuration: 0.35,
  duration: 4.6,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 1.2);
    owner.spinDashTimer = Math.max(owner.spinDashTimer, 3.6);

    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;
    owner.vx = Math.cos(angle) * 1080;
    owner.vy = Math.sin(angle) * 1080;

    const data: SonicUltimateData = {
      emeraldsAngle: 0,
      emeraldsRadius: owner.radius + 46,
      bouncesLeft: 7,
      lastWallBounceCd: 0,
      hitCooldowns: {},
      rings: [],
      machAngle: angle,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SUPER SONIC PINBALL!',
      '#facc15',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#facc15', 80, 320, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SonicUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    // Spiral 7 Chaos Emeralds inward into Sonic!
    data.emeraldsAngle += dt * 7.5;
    data.emeraldsRadius = Math.max(0, data.emeraldsRadius - dt * 68);
    if (data.lastWallBounceCd > 0) data.lastWallBounceCd = Math.max(0, data.lastWallBounceCd - dt);

    for (const uid of Object.keys(data.hitCooldowns)) {
      data.hitCooldowns[uid] -= dt;
      if (data.hitCooldowns[uid] <= 0) delete data.hitCooldowns[uid];
    }

    // 1. Supersonic Pinball Mode while bouncesLeft > 0!
    if (data.bouncesLeft > 0) {
      owner.spinDashTimer = Math.max(owner.spinDashTimer, 0.25);
      const curSpd = Math.hypot(owner.vx, owner.vy);
      if (curSpd > 1) {
        owner.vx = (owner.vx / curSpd) * 1120;
        owner.vy = (owner.vy / curSpd) * 1120;
        data.machAngle = Math.atan2(owner.vy, owner.vx);
      }

      // Detect near-wall bounce and auto-angle directly toward nearest enemy!
      const margin = owner.radius + 7;
      const touchingWall =
        owner.x <= left + margin ||
        owner.x >= right - margin ||
        owner.y <= top + margin ||
        owner.y >= bottom - margin;
      if (touchingWall && data.lastWallBounceCd <= 0) {
        data.bouncesLeft -= 1;
        data.lastWallBounceCd = 0.14;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const aim = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(aim) * 1140;
          owner.vy = Math.sin(aim) * 1140;
          data.machAngle = aim;
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          72,
          '#facc15',
          3.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.addScreenShake(4);
        ctx.emitSfx({ type: 'wall', intensity: 1.0 });
      }

      // Supersonic collision knocks 5 physical Gold Rings out of enemies!
      for (const e of enemies) {
        if (data.hitCooldowns[e.uid]) continue;
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 10) {
          data.hitCooldowns[e.uid] = 0.34;
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 9.2),
            (dx / d) * 440,
            (dy / d) * 440,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnParticles(e.x, e.y, 14, '#facc15', 80, 260, 2.5, 5.5, 'star');
          ctx.addScreenShake(7);
          ctx.emitSfx({ type: 'crit', intensity: 1.0 });

          // Scatter 5 bouncy Gold Rings! (cap total active rings at 15)
          if (data.rings.length < 15) {
            for (let k = 0; k < 5; k++) {
              const rAng = (k * Math.PI * 2) / 5 + Math.random() * 0.5;
              data.rings.push({
                id: ctx.nextId('ring'),
                x: e.x,
                y: e.y,
                vx: Math.cos(rAng) * (170 + Math.random() * 90),
                vy: Math.sin(rAng) * (170 + Math.random() * 90),
                life: 3.5,
              });
            }
          }
        }
      }
    }

    // 2. Update bouncy Gold Rings — Sonic heals +2% HP, enemies can steal for +1% HP!
    for (let i = data.rings.length - 1; i >= 0; i--) {
      const ring = data.rings[i];
      ring.life -= dt;
      ring.x += ring.vx * dt;
      ring.y += ring.vy * dt;
      ring.vx *= Math.pow(0.45, dt);
      ring.vy *= Math.pow(0.45, dt);
      if (ring.x < left + 10 || ring.x > right - 10) {
        ring.vx *= -0.8;
        ring.x = Math.max(left + 10, Math.min(right - 10, ring.x));
      }
      if (ring.y < top + 10 || ring.y > bottom - 10) {
        ring.vy *= -0.8;
        ring.y = Math.max(top + 10, Math.min(bottom - 10, ring.y));
      }

      let picked = false;
      // Only allow pickup after 0.25s scatter so hit victim doesn't insta-absorb all 5 rings on frame 0
      if (ring.life < 3.25) {
        if (Math.hypot(owner.x - ring.x, owner.y - ring.y) <= owner.radius + 14) {
          picked = true;
          const hMult = getHealMultiplier(owner);
          if (hMult > 0) {
            const heal = Math.min(
              owner.maxHp - owner.hp,
              Math.max(2, Math.round(owner.maxHp * 0.02 * hMult)),
            );
            if (heal > 0) {
              owner.hp += heal;
              ctx.spawnFloatingText(
                owner.x,
                owner.y - owner.radius - 10,
                `+${heal} RING`,
                '#facc15',
                'heal',
              );
            }
          }
          ctx.emitSfx({ type: 'heal' });
        } else {
          for (const e of enemies) {
            if (Math.hypot(e.x - ring.x, e.y - ring.y) <= e.radius + 12) {
              picked = true;
              if (e.antiHealTimer <= 0) {
                const heal = Math.min(e.maxHp - e.hp, Math.max(1, Math.round(e.maxHp * 0.01)));
                if (heal > 0) e.hp += heal;
              }
              break;
            }
          }
        }
      }

      if (picked || ring.life <= 0) {
        data.rings.splice(i, 1);
      }
    }
  },
};
