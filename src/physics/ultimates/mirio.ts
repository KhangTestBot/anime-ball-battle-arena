import type { UltimateHandler } from './types';

export interface MirioUltimateData {
  warpsDone: number;
  warpCd: number;
  powerFired: boolean;
  flash: number;
}

export const mirioUltimateHandler: UltimateHandler = {
  characterId: 'mirio',
  title: 'PERMEATION: PHANTOM MENACE!',
  subtitle:
    'Phases through all attacks (Invulnerable + Auto-Dodge), warps beneath foes 4 times, and finishes with POWERRR!!',
  bannerColor: '#facc15',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.2);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    owner.dmgBonusPct += 18;

    const data: MirioUltimateData = {
      warpsDone: 0,
      warpCd: 0.26,
      powerFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'PHANTOM MENACE!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MirioUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.powerFired && data.warpsDone < 4) {
      data.warpCd -= dt;
      if (data.warpCd <= 0) {
        data.warpCd = 0.34;
        data.warpsDone += 1;
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
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.2 });
        }
      }
    }

    if (!data.powerFired && state.elapsed >= 2.0) {
      data.powerFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 26, 'POWERRRRR!!', '#2563eb', 'crit');
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
