import type { UltimateHandler } from './types';

export interface LawUltimateData {
  roomX: number;
  roomY: number;
  roomRadius: number;
  shamblesTimer: number;
  shamblesCount: number;
  willeFired: boolean;
  willeTimer: number;
  willeX1: number;
  willeY1: number;
  willeX2: number;
  willeY2: number;
  willeAngle: number;
}

export const lawUltimateHandler: UltimateHandler = {
  characterId: 'law',
  title: 'ROOM: SHAMBLES & PUNCTURE WILLE',
  subtitle:
    'ROOM dome · SHAMBLES swaps enemy positions & redirects enemy projectiles behind their caster · Strips Shields + Pierces the arena with Puncture Wille!',
  bannerColor: '#22d3ee',
  castDuration: 0.25,
  duration: 4.4,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;
    const span = Math.max(ctx.bounds.right - ctx.bounds.left, ctx.bounds.bottom - ctx.bounds.top);

    const data: LawUltimateData = {
      roomX: cx,
      roomY: cy,
      roomRadius: span * 0.44,
      shamblesTimer: 0.22,
      shamblesCount: 0,
      willeFired: false,
      willeTimer: 0,
      willeX1: owner.x,
      willeY1: owner.y,
      willeX2: owner.x + 600,
      willeY2: owner.y,
      willeAngle: owner.facingAngle,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22d3ee', 'ULT', true);
    ctx.spawnShockwave(
      cx,
      cy,
      data.roomRadius,
      '#22d3ee',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(cx, ctx.bounds.top + 64, 'ROOM!!', '#22d3ee', 'powerup');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LawUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    // 1. Inside Surgical ROOM: Amputate shields + SHAMBLES swap enemy projectiles behind their own caster!
    data.shamblesTimer -= dt;
    if (data.shamblesTimer <= 0 && data.shamblesCount < 3) {
      data.shamblesTimer = 0.85;
      data.shamblesCount += 1;

      // Warp enemy projectiles inside ROOM right behind their own caster facing back at them!
      for (const p of ctx.projectiles) {
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - data.roomX, p.y - data.roomY) <= data.roomRadius) {
          const caster = enemies.find((e) => e.uid === p.ownerUid);
          p.ownerUid = owner.uid;
          p.teamId = owner.teamId;
          if (caster) {
            const ang = Math.atan2(p.vy, p.vx);
            p.x = Math.max(
              left + 16,
              Math.min(right - 16, caster.x - Math.cos(ang) * (caster.radius + 32)),
            );
            p.y = Math.max(
              top + 16,
              Math.min(bottom - 16, caster.y - Math.sin(ang) * (caster.radius + 32)),
            );
          } else {
            p.vx = -p.vx;
            p.vy = -p.vy;
          }
          p.color = '#22d3ee';
          ctx.spawnParticles(p.x, p.y, 7, '#22d3ee', 50, 160, 2.5, 5, 'star');
        }
      }

      // Surgical Shambles: swap positions & sever active shields!
      const target = enemies[data.shamblesCount % Math.max(1, enemies.length)];
      if (
        target &&
        Math.hypot(target.x - data.roomX, target.y - data.roomY) <= data.roomRadius + target.radius
      ) {
        if (target.shieldTimer > 0) {
          target.shieldTimer = 0;
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 20,
            'AMPUTATE SHIELD!',
            '#22d3ee',
            'callout',
          );
        }
        const ox = owner.x;
        const oy = owner.y;
        owner.x = target.x;
        owner.y = target.y;
        target.x = ox;
        target.y = oy;
        ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
          sourceKind: 'ability',
        });
        ctx.spawnFloatingText(
          target.x,
          target.y - target.radius - 14,
          'SHAMBLES!',
          '#7dd3fc',
          'callout',
        );
        ctx.emitSfx({ type: 'dodge' });
      }
    }

    // 2. Climax (2.75s): PUNCTURE WILLE piercing deep-ground shockblade!
    if (!data.willeFired && state.elapsed >= 2.75) {
      data.willeFired = true;
      data.willeTimer = 0.9;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.willeAngle = ang;
      data.willeX1 = owner.x;
      data.willeY1 = owner.y;
      data.willeX2 = owner.x + Math.cos(ang) * 720;
      data.willeY2 = owner.y + Math.sin(ang) * 720;

      ctx.addHitstop(0.07);
      ctx.addScreenShake(16);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        210,
        '#22d3ee',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'PUNCTURE WILLE!!',
        '#22d3ee',
        'powerup',
      );
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });

      const dxL = Math.cos(ang);
      const dyL = Math.sin(ang);
      for (const e of enemies) {
        const rx = e.x - data.willeX1;
        const ry = e.y - data.willeY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= -e.radius && perp <= e.radius + 38) {
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.5), dxL * 520, dyL * 520, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 18, '#22d3ee', 90, 300, 3, 6, 'shard');
        }
      }
    } else if (data.willeFired && data.willeTimer > 0) {
      data.willeTimer = Math.max(0, data.willeTimer - dt);
    }
  },
};
