import type { UltimateHandler } from './types';

export interface DragonSegment {
  x: number;
  y: number;
  angle: number;
  radius: number;
}

export interface TanjiroUltimateData {
  headX: number;
  headY: number;
  headAngle: number;
  speed: number;
  segments: DragonSegment[];
  targetIdx: number;
  hitCooldowns: Record<string, number>;
}

function normalizeAngle(a: number): number {
  let r = a;
  while (r > Math.PI) r -= Math.PI * 2;
  while (r < -Math.PI) r += Math.PI * 2;
  return r;
}

export const tanjiroUltimateHandler: UltimateHandler = {
  characterId: 'tanjiro',
  title: 'HINOKAMI KAGURA: SUN HALO DRAGON HEAD DANCE',
  subtitle:
    '12-segment Fire Dragon weaves in pursuit · Dragon body incinerates enemy projectiles · Inflicts Demon Slayer Mark (-40% Healing)!',
  bannerColor: '#f97316',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const segments: DragonSegment[] = [];
    for (let i = 0; i < 12; i++) {
      segments.push({
        x: owner.x - Math.cos(angle) * (i * 15),
        y: owner.y - Math.sin(angle) * (i * 15),
        angle,
        radius: Math.max(11, 23 - i * 1.0),
      });
    }

    const data: TanjiroUltimateData = {
      headX: owner.x,
      headY: owner.y,
      headAngle: angle,
      speed: 455,
      segments,
      targetIdx: 0,
      hitCooldowns: {},
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SUN HALO DRAGON!!',
      '#fb923c',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#f97316', 70, 260, 3, 6.5, 'circle');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TanjiroUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    for (const uid of Object.keys(data.hitCooldowns)) {
      data.hitCooldowns[uid] -= dt;
      if (data.hitCooldowns[uid] <= 0) delete data.hitCooldowns[uid];
    }

    // 1. Steer the Sun Halo Dragon head smoothly with realistic turning radius (counterplay!)
    if (enemies.length > 0) {
      const target = enemies[Math.floor(state.elapsed / 1.1) % enemies.length];
      const desired = Math.atan2(target.y - data.headY, target.x - data.headX);
      const diff = normalizeAngle(desired - data.headAngle);
      const maxTurn = 3.8 * dt;
      data.headAngle += Math.max(-maxTurn, Math.min(maxTurn, diff));
    }

    data.headX += Math.cos(data.headAngle) * data.speed * dt;
    data.headY += Math.sin(data.headAngle) * data.speed * dt;

    // Clean arena wall deflection so Dragon never vanishes out of bounds
    if (data.headX < left + 20) {
      data.headX = left + 20;
      data.headAngle = normalizeAngle(Math.PI - data.headAngle);
    } else if (data.headX > right - 20) {
      data.headX = right - 20;
      data.headAngle = normalizeAngle(Math.PI - data.headAngle);
    }
    if (data.headY < top + 20) {
      data.headY = top + 20;
      data.headAngle = normalizeAngle(-data.headAngle);
    } else if (data.headY > bottom - 20) {
      data.headY = bottom - 20;
      data.headAngle = normalizeAngle(-data.headAngle);
    }

    // 2. Follow-the-leader Snake Ribbon kinematics across all 12 segments!
    data.segments[0].x = data.headX;
    data.segments[0].y = data.headY;
    data.segments[0].angle = data.headAngle;
    const spacing = 17;
    for (let i = 1; i < data.segments.length; i++) {
      const prev = data.segments[i - 1];
      const cur = data.segments[i];
      const dx = prev.x - cur.x;
      const dy = prev.y - cur.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.01) {
        cur.angle = Math.atan2(dy, dx);
        cur.x = prev.x - (dx / dist) * spacing;
        cur.y = prev.y - (dy / dist) * spacing;
      }
    }

    // 3. Whole Dragon body blocks enemy projectiles + burns & applies Demon Slayer Mark (-40% Heal)!
    for (let pIdx = ctx.projectiles.length - 1; pIdx >= 0; pIdx--) {
      const p = ctx.projectiles[pIdx];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      for (const seg of data.segments) {
        if (Math.hypot(p.x - seg.x, p.y - seg.y) <= seg.radius + p.radius) {
          ctx.spawnParticles(p.x, p.y, 7, '#f97316', 50, 170, 2, 4.5, 'circle');
          ctx.projectiles.splice(pIdx, 1);
          break;
        }
      }
    }

    for (const e of enemies) {
      if (data.hitCooldowns[e.uid]) continue;
      for (let sIdx = 0; sIdx < data.segments.length; sIdx++) {
        const seg = data.segments[sIdx];
        if (Math.hypot(e.x - seg.x, e.y - seg.y) <= seg.radius + e.radius) {
          data.hitCooldowns[e.uid] = 0.42;
          const isBite = sIdx === 0;
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, isBite ? 9.5 : 5.2),
            Math.cos(seg.angle) * 260,
            Math.sin(seg.angle) * 260,
            { isCrit: isBite, sourceKind: 'ability' },
          );
          e.burnTimer = Math.max(e.burnTimer, 3.2);
          e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.2));
          e.burnOwnerUid = owner.uid;
          // Apply Demon Slayer Mark -> reduces all incoming healing by 40%!
          e.slayerMarkTimer = Math.max(e.slayerMarkTimer, 4.0);
          ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'SLAYER MARK!', '#fb7185', 'callout');
          ctx.spawnParticles(e.x, e.y, 12, '#f97316', 70, 230, 2.5, 5, 'circle');
          ctx.emitSfx({ type: isBite ? 'crit' : 'slash', intensity: 1.0 });
          break;
        }
      }
    }
  },
};
