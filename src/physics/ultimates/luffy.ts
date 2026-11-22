import type { UltimateHandler } from './types';

export interface WallFlexPulse {
  side: 'left' | 'right' | 'top' | 'bottom';
  pos: number;
  strength: number;
}

export interface LuffyUltimateData {
  wallFlexes: WallFlexPulse[];
  wallStunCd: Record<string, number>;
  bajrangX: number;
  bajrangY: number;
  bajrangRadius: number;
  bajrangTimer: number; // 1.1s warning shadow -> SLAM!
  bajrangSlammed: boolean;
  slamFlashTimer: number;
  drumBeatTimer: number;
}

export const luffyUltimateHandler: UltimateHandler = {
  characterId: 'luffy',
  title: 'GEAR 5: SUN GOD NIKA — BAJRANG GUN & RUBBER WORLD',
  subtitle:
    'Turns all 4 walls into bouncy Rubber · Reflects enemy projectiles · Slams down the colossal Bajrang Gun!',
  bannerColor: '#f8fafc',
  castDuration: 0.3,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;
    const bx = target ? target.x : cx;
    const by = target ? target.y : cy;

    const data: LuffyUltimateData = {
      wallFlexes: [],
      wallStunCd: {},
      bajrangX: Math.max(ctx.bounds.left + 90, Math.min(ctx.bounds.right - 90, bx)),
      bajrangY: Math.max(ctx.bounds.top + 90, Math.min(ctx.bounds.bottom - 90, by)),
      bajrangRadius: 158,
      bajrangTimer: 1.15,
      bajrangSlammed: false,
      slamFlashTimer: 0,
      drumBeatTimer: 0.55,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ffffff', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'DOOM DUT DA DA!! GEAR 5!',
      '#ffffff',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#ffffff', 70, 260, 3, 6.5, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LuffyUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    // Decay wall flex animations & per-enemy bounce cooldowns
    for (let i = data.wallFlexes.length - 1; i >= 0; i--) {
      data.wallFlexes[i].strength -= dt * 2.8;
      if (data.wallFlexes[i].strength <= 0) data.wallFlexes.splice(i, 1);
    }
    for (const uid of Object.keys(data.wallStunCd)) {
      data.wallStunCd[uid] -= dt;
      if (data.wallStunCd[uid] <= 0) delete data.wallStunCd[uid];
    }

    // Drums of Liberation heartbeat!
    data.drumBeatTimer -= dt;
    if (data.drumBeatTimer <= 0) {
      data.drumBeatTimer = 1.05;
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        'DOOM DUT DA DA!',
        '#f8fafc',
        'callout',
      );
    }

    // 1. Toon Force Rubber Arena Walls (1.65x elastic chaos + brief comic pop-eye stun!)
    for (const e of enemies) {
      if (data.wallStunCd[e.uid]) continue;
      const m = e.radius + 9;
      let hitSide: WallFlexPulse['side'] | null = null;
      let hitPos = 0;
      if (e.x <= left + m) {
        hitSide = 'left';
        hitPos = e.y;
        e.vx = Math.abs(e.vx) * 1.45 + 220;
      } else if (e.x >= right - m) {
        hitSide = 'right';
        hitPos = e.y;
        e.vx = -Math.abs(e.vx) * 1.45 - 220;
      } else if (e.y <= top + m) {
        hitSide = 'top';
        hitPos = e.x;
        e.vy = Math.abs(e.vy) * 1.45 + 220;
      } else if (e.y >= bottom - m) {
        hitSide = 'bottom';
        hitPos = e.x;
        e.vy = -Math.abs(e.vy) * 1.45 - 220;
      }

      if (hitSide) {
        data.wallStunCd[e.uid] = 0.55;
        data.wallFlexes.push({ side: hitSide, pos: hitPos, strength: 1.0 });
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 5.2), 0, 0, {
          sourceKind: 'wall',
        });
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'BOING!!', '#facc15', 'callout');
        ctx.spawnParticles(e.x, e.y, 10, '#ffffff', 70, 210, 3, 6, 'star');
        ctx.emitSfx({ type: 'wall', intensity: 1.1 });
      }
    }

    // 2. Rubber Floor Lift: reflects enemy projectiles near Luffy right back at their sender!
    for (const p of ctx.projectiles) {
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 54) {
        p.ownerUid = owner.uid;
        p.teamId = owner.teamId;
        p.vx = -p.vx * 1.25;
        p.vy = -p.vy * 1.25;
        p.color = '#ffffff';
        p.secondaryColor = '#ef4444';
        ctx.spawnFloatingText(p.x, p.y - 12, 'RUBBER REFLECT!', '#ffffff', 'callout');
        ctx.spawnParticles(p.x, p.y, 8, '#ffffff', 60, 180, 2.5, 5, 'star');
        ctx.emitSfx({ type: 'dodge' });
      }
    }

    // 3. Giant Haki Bajrang Gun shadow warning (1.15s) -> MASSIVE ARENA SLAM!
    if (!data.bajrangSlammed) {
      data.bajrangTimer -= dt;
      // Gently drift shadow toward nearest enemy during first half of warning so it feels ominous yet dodgeable!
      if (data.bajrangTimer > 0.55) {
        const nearest = ctx.getNearestEnemy(owner);
        if (nearest) {
          data.bajrangX += (nearest.x - data.bajrangX) * Math.min(1, dt * 1.8);
          data.bajrangY += (nearest.y - data.bajrangY) * Math.min(1, dt * 1.8);
        }
      }
      if (data.bajrangTimer <= 0) {
        data.bajrangSlammed = true;
        data.slamFlashTimer = 0.75;
        ctx.addHitstop(0.075);
        ctx.addScreenShake(18);
        ctx.spawnShockwave(
          data.bajrangX,
          data.bajrangY,
          data.bajrangRadius + 55,
          '#ef4444',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnShockwave(
          data.bajrangX,
          data.bajrangY,
          data.bajrangRadius,
          '#111827',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(data.bajrangX, data.bajrangY, 34, '#ef4444', 110, 420, 3, 7.5, 'star');
        ctx.spawnParticles(data.bajrangX, data.bajrangY, 22, '#ffffff', 90, 340, 3, 6.5, 'circle');
        ctx.spawnFloatingText(
          data.bajrangX,
          data.bajrangY - 24,
          'BAJRANG GUN!!',
          '#ef4444',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });

        for (const e of enemies) {
          const dx = e.x - data.bajrangX;
          const dy = e.y - data.bajrangY;
          const dist = Math.hypot(dx, dy);
          if (dist <= data.bajrangRadius + e.radius) {
            const nx = dist > 0.1 ? dx / dist : 1;
            const ny = dist > 0.1 ? dy / dist : 0;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22), nx * 740, ny * 740, {
              isCrit: true,
              sourceKind: 'ability',
            });
          }
        }
      }
    } else if (data.slamFlashTimer > 0) {
      data.slamFlashTimer = Math.max(0, data.slamFlashTimer - dt);
    }
  },

  onExpire(ctx, owner) {
    // Classic Gear 5 side effect: brief "deflated/old" fatigue window (1.0s)!
    if (owner && owner.alive) {
      owner.drowsyTimer = Math.max(owner.drowsyTimer, 1.0);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        'PHEW... DEFLATED!',
        '#e2e8f0',
        'callout',
      );
    }
  },
};
