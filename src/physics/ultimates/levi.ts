import type { UltimateHandler } from './types';

export interface OdmCableAnchor {
  ax: number;
  ay: number;
}

export interface LeviUltimateData {
  cables: OdmCableAnchor[];
  zipsLeft: number;
  zipTimer: number;
  destX: number;
  destY: number;
  snapped: boolean;
  hitCooldowns: Record<string, number>;
  steamPuffs: Array<{ x: number; y: number; life: number }>;
}

function clampWallPoint(
  x: number,
  y: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): OdmCableAnchor {
  // Snap anchor cleanly to the nearest arena border!
  const dl = Math.abs(x - left);
  const dr = Math.abs(right - x);
  const dt = Math.abs(y - top);
  const db = Math.abs(bottom - y);
  const min = Math.min(dl, dr, dt, db);
  if (min === dl) return { ax: left, ay: Math.max(top, Math.min(bottom, y)) };
  if (min === dr) return { ax: right, ay: Math.max(top, Math.min(bottom, y)) };
  if (min === dt) return { ax: Math.max(left, Math.min(right, x)), ay: top };
  return { ax: Math.max(left, Math.min(right, x)), ay: bottom };
}

function pickNextZipTarget(
  ctx: Parameters<UltimateHandler['onCast']>[0],
  ownerX: number,
  ownerY: number,
  enemies: ReturnType<Parameters<UltimateHandler['onCast']>[0]['getEnemies']>,
  zipIdx: number,
): { tx: number; ty: number; cables: OdmCableAnchor[] } {
  const { left, right, top, bottom } = ctx.bounds;
  const target = enemies[zipIdx % Math.max(1, enemies.length)];
  const rawX = target
    ? target.x + (zipIdx % 2 === 0 ? 48 : -48)
    : (left + right) / 2 + Math.cos(zipIdx) * 140;
  const rawY = target
    ? target.y + (zipIdx % 2 === 0 ? -42 : 42)
    : (top + bottom) / 2 + Math.sin(zipIdx) * 140;
  const tx = Math.max(left + 32, Math.min(right - 32, rawX));
  const ty = Math.max(top + 32, Math.min(bottom - 32, rawY));

  const ang = Math.atan2(ty - ownerY, tx - ownerX);
  const c1 = clampWallPoint(
    tx + Math.cos(ang + 0.45) * 400,
    ty + Math.sin(ang + 0.45) * 400,
    left,
    right,
    top,
    bottom,
  );
  const c2 = clampWallPoint(
    tx + Math.cos(ang - 0.45) * 400,
    ty + Math.sin(ang - 0.45) * 400,
    left,
    right,
    top,
    bottom,
  );
  return { tx, ty, cables: [c1, c2] };
}

export const leviUltimateHandler: UltimateHandler = {
  characterId: 'levi',
  title: 'ODM GEAR: ACKERMAN BEYBLADE BLITZ',
  subtitle:
    'Fires 2 anchor cables into walls for Beyblade spin dashes · 60% Dodge · Backstab nape slashes deal 1.5x Crit + Stun (cables snap on obstacle hit)!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.8,

  onCast(ctx, owner, state) {
    const enemies = ctx.getEnemies(owner);
    const first = pickNextZipTarget(ctx, owner.x, owner.y, enemies, 0);
    owner.evadeTimer = Math.max(owner.evadeTimer, 2.8);

    const data: LeviUltimateData = {
      cables: first.cables,
      zipsLeft: 4,
      zipTimer: 0.55,
      destX: first.tx,
      destY: first.ty,
      snapped: false,
      hitCooldowns: {},
      steamPuffs: [{ x: owner.x, y: owner.y, life: 0.65 }],
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'ACKERMAN BEYBLADE!',
      '#34d399',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#e2e8f0', 70, 240, 2.5, 5, 'circle');
    ctx.addScreenShake(7);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LeviUltimateData;
    const enemies = ctx.getEnemies(owner);

    for (let i = data.steamPuffs.length - 1; i >= 0; i--) {
      data.steamPuffs[i].life -= dt;
      if (data.steamPuffs[i].life <= 0) data.steamPuffs.splice(i, 1);
    }
    for (const uid of Object.keys(data.hitCooldowns)) {
      data.hitCooldowns[uid] -= dt;
      if (data.hitCooldowns[uid] <= 0) delete data.hitCooldowns[uid];
    }

    if (data.snapped || data.zipsLeft <= 0) return;

    owner.evadeTimer = Math.max(owner.evadeTimer, 0.2);
    owner.spinAngle += dt * 36;

    // 1. Check hard ArenaObstacle collision -> snaps Levi's ODM cable early (counterplay!)
    for (const obs of ctx.obstacles) {
      if (
        Math.abs(owner.x - obs.x) <= obs.w * 0.5 + owner.radius + 3 &&
        Math.abs(owner.y - obs.y) <= obs.h * 0.5 + owner.radius + 3
      ) {
        data.snapped = true;
        data.zipsLeft = 0;
        owner.evadeTimer = 0;
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 16,
          'CABLE SNAPPED!',
          '#f97316',
          'callout',
        );
        ctx.spawnParticles(owner.x, owner.y, 14, '#facc15', 80, 220, 2, 4.5, 'spark');
        ctx.emitSfx({ type: 'wall', intensity: 1.0 });
        return;
      }
    }

    // 2. Propel Levi at high speed toward current Z-zip target!
    const dx = data.destX - owner.x;
    const dy = data.destY - owner.y;
    const dist = Math.hypot(dx, dy);
    data.zipTimer -= dt;

    if (dist > 14 && data.zipTimer > 0) {
      const zipSpeed = 760;
      owner.vx = (dx / dist) * zipSpeed;
      owner.vy = (dy / dist) * zipSpeed;
      owner.x = Math.max(
        ctx.bounds.left + owner.radius + 6,
        Math.min(ctx.bounds.right - owner.radius - 6, owner.x + owner.vx * dt * 0.35),
      );
      owner.y = Math.max(
        ctx.bounds.top + owner.radius + 6,
        Math.min(ctx.bounds.bottom - owner.radius - 6, owner.y + owner.vy * dt * 0.35),
      );
    } else {
      data.zipsLeft -= 1;
      data.steamPuffs.push({ x: owner.x, y: owner.y, life: 0.65 });
      if (data.zipsLeft > 0) {
        const next = pickNextZipTarget(ctx, owner.x, owner.y, enemies, 4 - data.zipsLeft);
        data.destX = next.tx;
        data.destY = next.ty;
        data.cables = next.cables;
        data.zipTimer = 0.55;
        ctx.spawnParticles(owner.x, owner.y, 10, '#f8fafc', 70, 200, 3, 6, 'circle');
        ctx.emitSfx({ type: 'dodge' });
      }
    }

    // 3. Beyblade Blade Ring Slices -> guaranteed 1.5x NAPE CRIT when striking enemy from behind!
    for (const e of enemies) {
      if (data.hitCooldowns[e.uid]) continue;
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 26) {
        data.hitCooldowns[e.uid] = 0.24;
        const strikeDx = e.x - owner.x;
        const strikeDy = e.y - owner.y;
        const behindScore = strikeDx * e.vx + strikeDy * e.vy;
        const isNapeCrit = behindScore > 0;
        const mult = isNapeCrit ? 1.5 : 1.0;

        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 6.2 * mult),
          (strikeDx / Math.max(1, Math.hypot(strikeDx, strikeDy))) * 220,
          (strikeDy / Math.max(1, Math.hypot(strikeDx, strikeDy))) * 220,
          { isCrit: isNapeCrit, sourceKind: 'ability' },
        );

        if (isNapeCrit) {
          e.confusedTimer = Math.max(e.confusedTimer, 0.55);
          ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'NAPE CRIT x1.5!', '#10b981', 'crit');
        }
        ctx.spawnParticles(e.x, e.y, 9, '#67e8f9', 80, 250, 2, 4.5, 'spark');
        ctx.emitSfx({ type: 'slash', intensity: isNapeCrit ? 1.25 : 0.9 });
      }
    }
  },

  onExpire(_ctx, owner) {
    if (owner) owner.evadeTimer = 0;
  },
};
