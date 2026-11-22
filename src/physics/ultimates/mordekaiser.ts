import type { UltimateHandler } from './types';

export interface MordekaiserUltimateData {
  centerX: number;
  centerY: number;
  realmRadius: number;
  slamsDone: number;
  slamCd: number;
  slamFlash: number;
  slamX: number;
  slamY: number;
}

export const mordekaiserUltimateHandler: UltimateHandler = {
  characterId: 'mordekaiser',
  title: 'REALM OF DEATH (R) · IRON REVENANT',
  subtitle:
    'Banishes all fighters into the spectral Death Realm, siphons enemy armor & speed into an Indestructible shield, and crushes foes with Nightfall slams!',
  bannerColor: '#14b8a6',
  castDuration: 0.28,
  duration: 4.2,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) * 0.5;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#14b8a6';
    owner.giantTimer = Math.max(owner.giantTimer, 3.6);

    for (const e of ctx.getEnemies(owner)) {
      e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
      e.frostTimer = Math.max(e.frostTimer, 3.2);
    }

    const data: MordekaiserUltimateData = {
      centerX: cx,
      centerY: cy,
      realmRadius: ctx.bounds.fullSize * 0.42,
      slamsDone: 0,
      slamCd: 0.65,
      slamFlash: 0,
      slamX: owner.x,
      slamY: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, cx, cy, 0, '#14b8a6', 'ULT', true);
    ctx.spawnShockwave(cx, cy, 260, '#14b8a6', 7, owner.character.id, owner.character.series);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'WELCOME TO BRAZIL!',
      '#2dd4bf',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MordekaiserUltimateData;
    if (data.slamFlash > 0) data.slamFlash = Math.max(0, data.slamFlash - dt);

    // Gently pull enemies back inside the Death Realm ring if they drift outside
    for (const e of ctx.getEnemies(owner)) {
      const dx = data.centerX - e.x;
      const dy = data.centerY - e.y;
      const d = Math.hypot(dx, dy);
      if (d > data.realmRadius - e.radius && d > 1) {
        e.vx += (dx / d) * 460 * dt;
        e.vy += (dy / d) * 460 * dt;
      }
    }

    // 3 Giant Spectral Nightfall Mace Slams!
    if (data.slamsDone < 3) {
      data.slamCd -= dt;
      if (data.slamCd <= 0) {
        data.slamCd = 0.95;
        data.slamsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const sx = target ? target.x : data.centerX;
        const sy = target ? target.y : data.centerY;
        data.slamX = sx;
        data.slamY = sy;
        data.slamFlash = 0.65;

        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - sx, e.y - sy) <= 135 + e.radius) {
            e.shieldTimer = 0;
            const ang = Math.atan2(e.y - sy, e.x - sx);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 12.2),
              Math.cos(ang) * 320,
              Math.sin(ang) * 320,
              {
                isCrit: data.slamsDone === 3,
                sourceKind: 'ability',
              },
            );
          }
        }
        ctx.spawnShockwave(sx, sy, 150, '#2dd4bf', 6, owner.character.id, owner.character.series);
        ctx.spawnParticles(sx, sy, 20, '#14b8a6', 70, 240, 3, 6, 'shard');
        ctx.spawnFloatingText(sx, sy - 20, 'OBLITERATE!', '#5eead4', 'callout');
        ctx.addScreenShake(10);
        ctx.emitSfx({ type: 'crit', intensity: 1.15 });
      }
    }
  },
};
