import type { UltimateHandler } from './types';

export interface BrunoUltimateData {
  zipsDone: number;
  zipCd: number;
  unzippedProjectiles: number;
  arrivederciFired: boolean;
  flash: number;
}

export const brunoUltimateHandler: UltimateHandler = {
  characterId: 'bruno',
  title: 'STICKY FINGERS: ARI ARI ARRIVEDERCI!',
  subtitle:
    'Opens dimensional zippers that swallow enemy projectiles, warps 4 times with ARI ARI ARI!, and finishes with ARRIVEDERCI!',
  bannerColor: '#38bdf8',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.dmgBonusPct += 18;

    const data: BrunoUltimateData = {
      zipsDone: 0,
      zipCd: 0.26,
      unzippedProjectiles: 0,
      arrivederciFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'STICKY FINGERS: ZIPPER SPACE!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BrunoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Swallow nearby enemy projectiles through dimensional zippers!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 135) {
        ctx.projectiles.splice(i, 1);
        data.unzippedProjectiles += 1;
        ctx.spawnParticles(p.x, p.y, 8, '#38bdf8', 50, 170, 2.5, 5, 'spark');
      }
    }

    if (!data.arrivederciFired && data.zipsDone < 4) {
      data.zipCd -= dt;
      if (data.zipCd <= 0) {
        data.zipCd = 0.34;
        data.zipsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 310,
            Math.sin(ang) * 310,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.arrivederciFired && state.elapsed >= 2.0) {
      data.arrivederciFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 630,
          Math.sin(ang) * 630,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'ARI ARI ARI... ARRIVEDERCI!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
