import type { UltimateHandler } from './types';

function pointToLineDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-4) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export interface IchigoUltimateData {
  cx: number;
  cy: number;
  angle: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  wallHalfThickness: number;
  slashActive: boolean;
  windupTimer: number;
  tickCd: number;
}

export const ichigoUltimateHandler: UltimateHandler = {
  characterId: 'ichigo',
  title: 'FINAL GETSUGA TENSHO: MUGETSU',
  subtitle:
    'Mugetsu — A pitch-black slash bisects the entire arena for 2.8s & erases all projectiles · Leaves Ichigo powerless for 1.2s afterward!',
  bannerColor: '#e2e8f0',
  castDuration: 0.28,
  duration: 3.15,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const span = right - left;
    const anchorX = target ? (owner.x + target.x) * 0.5 : cx;
    const anchorY = target ? (owner.y + target.y) * 0.5 : cy;

    const data: IchigoUltimateData = {
      cx: anchorX,
      cy: anchorY,
      angle,
      x1: anchorX - Math.cos(angle) * span,
      y1: anchorY - Math.sin(angle) * span,
      x2: anchorX + Math.cos(angle) * span,
      y2: anchorY + Math.sin(angle) * span,
      wallHalfThickness: 32,
      slashActive: false,
      windupTimer: 0.25,
      tickCd: 0.12,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#f8fafc', 'ULT', true);
    ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 18, 'MUGETSU...', '#f8fafc', 'powerup');
    ctx.spawnParticles(owner.x, owner.y, 20, '#18181b', 70, 230, 3, 6.5, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IchigoUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (!data.slashActive) {
      data.windupTimer -= dt;
      if (data.windupTimer <= 0) {
        data.slashActive = true;
        ctx.addHitstop(0.07);
        ctx.addScreenShake(16);
        ctx.spawnShockwave(
          data.cx,
          data.cy,
          220,
          '#f8fafc',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.cx,
          data.cy - 20,
          'FINAL GETSUGA TENSHO!!',
          '#ffffff',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.2 });
      }
      return;
    }

    // 1. Delete EVERY enemy projectile intersecting the black Mugetsu Arena Split Barrier!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (
        pointToLineDist(p.x, p.y, data.x1, data.y1, data.x2, data.y2) <=
        data.wallHalfThickness + p.radius
      ) {
        ctx.spawnParticles(p.x, p.y, 7, '#f8fafc', 50, 170, 2.5, 5, 'shard');
        ctx.projectiles.splice(i, 1);
      }
    }

    // 2. Push enemies outward from the bisecting Void Curtain and deal spiritual slash ticks!
    data.tickCd -= dt;
    const doDmg = data.tickCd <= 0;
    if (doDmg) data.tickCd = 0.34;

    const nx = -Math.sin(data.angle);
    const ny = Math.cos(data.angle);

    for (const e of enemies) {
      const dist = pointToLineDist(e.x, e.y, data.x1, data.y1, data.x2, data.y2);
      if (dist <= data.wallHalfThickness + e.radius) {
        // Side sign relative to line
        const sideSign = (e.x - data.cx) * nx + (e.y - data.cy) * ny >= 0 ? 1 : -1;
        e.vx += nx * sideSign * 640 * dt;
        e.vy += ny * sideSign * 640 * dt;

        if (doDmg) {
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 6.4),
            nx * sideSign * 260,
            ny * sideSign * 260,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnParticles(e.x, e.y, 10, '#f8fafc', 80, 250, 2.5, 5, 'shard');
        }
      }
    }
  },

  onExpire(ctx, owner) {
    // Canon sacrifice: Ichigo loses spiritual pressure for 1.2s after Mugetsu fades!
    if (owner && owner.alive) {
      owner.spiritLockTimer = Math.max(owner.spiritLockTimer, 1.2);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        'SPIRIT LOCKED!',
        '#94a3b8',
        'callout',
      );
    }
  },
};
