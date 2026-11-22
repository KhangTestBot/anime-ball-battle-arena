import type { UltimateHandler } from './types';

export interface ZoltraakLaser {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bx2?: number;
  by2?: number;
  life: number;
}

export interface FrierenUltimateData {
  manaRevealAlpha: number;
  shieldAngles: number[];
  shieldHp: number[];
  lasers: ZoltraakLaser[];
  salvosLeft: number;
  salvoCd: number;
}

function pointToSegDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-4) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export const frierenUltimateHandler: UltimateHandler = {
  characterId: 'frieren',
  title: 'HEIGHT OF MAGIC: FULL MANA UNLEASH & ZOLTRAAK',
  subtitle:
    'Unleashes full mana to knock back all foes · 4 Golden Hex Shields block projectiles · 6 Magic Circles fire Zoltraak beams that ricochet off walls once!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 4.5,

  onCast(ctx, owner, state) {
    // 1. Mana Suppression Reveal: erupts massive white-gold mage pressure knocking ALL nearby enemies away!
    for (const e of ctx.getEnemies(owner)) {
      const dx = e.x - owner.x;
      const dy = e.y - owner.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      if (d <= 270) {
        e.vx += (dx / d) * 620;
        e.vy += (dy / d) * 620;
      }
    }

    const data: FrierenUltimateData = {
      manaRevealAlpha: 1.0,
      shieldAngles: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
      shieldHp: [3, 3, 3, 3],
      lasers: [],
      salvosLeft: 4,
      salvoCd: 0.55,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#fef08a', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      260,
      '#fef08a',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'ZOLTRAAK UNLEASH!!',
      '#facc15',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#fef08a', 90, 320, 3, 6, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as FrierenUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    data.manaRevealAlpha = Math.max(0.28, data.manaRevealAlpha - dt * 0.35);

    for (let i = data.lasers.length - 1; i >= 0; i--) {
      data.lasers[i].life -= dt;
      if (data.lasers[i].life <= 0) data.lasers.splice(i, 1);
    }

    // 1. Rotate 4 Hexagonal Defense Barriers (covering ~60% circumference -> intercept projectiles until HP depleted!)
    const orbitR = owner.radius + 32;
    for (let s = 0; s < 4; s++) {
      data.shieldAngles[s] += dt * 2.1;
      if (data.shieldHp[s] <= 0) continue;
      const sx = owner.x + Math.cos(data.shieldAngles[s]) * orbitR;
      const sy = owner.y + Math.sin(data.shieldAngles[s]) * orbitR;
      for (let pIdx = ctx.projectiles.length - 1; pIdx >= 0; pIdx--) {
        const p = ctx.projectiles[pIdx];
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - sx, p.y - sy) <= 22 + p.radius) {
          ctx.spawnParticles(p.x, p.y, 8, '#facc15', 60, 180, 2.5, 5, 'star');
          ctx.projectiles.splice(pIdx, 1);
          data.shieldHp[s] -= 1;
          ctx.emitSfx({ type: 'dodge' });
          break;
        }
      }
    }

    // 2. Fire Ricochet Zoltraak Salvoses (bounces 1x off arena wall!) from hovering magic circles!
    if (data.salvosLeft > 0 && enemies.length > 0) {
      data.salvoCd -= dt;
      if (data.salvoCd <= 0) {
        data.salvoCd = 0.78;
        data.salvosLeft -= 1;

        for (let b = 0; b < 2; b++) {
          const target = enemies[(data.salvosLeft + b) % enemies.length];
          const arrayAng = owner.facingAngle + (b === 0 ? -0.9 : 0.9) + data.salvosLeft * 0.4;
          const ox = Math.max(left + 20, Math.min(right - 20, owner.x + Math.cos(arrayAng) * 58));
          const oy = Math.max(top + 20, Math.min(bottom - 20, owner.y + Math.sin(arrayAng) * 58));
          const shotAng = Math.atan2(target.y - oy, target.x - ox);
          const dx = Math.cos(shotAng);
          const dy = Math.sin(shotAng);

          // Raycast first bounce point cleanly inside arena bounds
          let tWall = 900;
          let reflDx = dx;
          let reflDy = dy;
          if (dx > 0.01) tWall = Math.min(tWall, (right - ox) / dx);
          else if (dx < -0.01) tWall = Math.min(tWall, (left - ox) / dx);
          if (dy > 0.01) {
            const ty = (bottom - oy) / dy;
            if (ty < tWall) {
              tWall = ty;
              reflDy = -dy;
            }
          } else if (dy < -0.01) {
            const ty = (top - oy) / dy;
            if (ty < tWall) {
              tWall = ty;
              reflDy = -dy;
            }
          }
          if (reflDy === dy) reflDx = -dx;

          const hx = ox + dx * tWall;
          const hy = oy + dy * tWall;
          const bx2 = hx + reflDx * 360;
          const by2 = hy + reflDy * 360;

          data.lasers.push({ x1: ox, y1: oy, x2: hx, y2: hy, bx2, by2, life: 0.48 });

          for (const e of enemies) {
            const hit1 = pointToSegDist(e.x, e.y, ox, oy, hx, hy) <= e.radius + 14;
            const hit2 = pointToSegDist(e.x, e.y, hx, hy, bx2, by2) <= e.radius + 14;
            if (hit1 || hit2) {
              ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.8), dx * 180, dy * 180, {
                isCrit: !hit1 && hit2,
                sourceKind: 'ability',
              });
              ctx.spawnParticles(e.x, e.y, 10, '#fef08a', 70, 220, 2.5, 5, 'star');
            }
          }
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.0 });
      }
    }
  },
};
