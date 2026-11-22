import type { UltimateHandler } from './types';

export interface HitUltimateData {
  skipsDone: number;
  skipCd: number;
  molotovFired: boolean;
  flash: number;
}

export const hitUltimateHandler: UltimateHandler = {
  characterId: 'hit',
  title: 'TIME-SKIP: MOLOTOV ASSASSINATION!',
  subtitle:
    'Freezes enemies in Time-Skip (Time-Stop + Auto-Dodge), chains 4 invisible Flash-Fist blinks, and executes with Time-Cage!',
  bannerColor: '#a855f7',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    owner.dmgBonusPct += 20;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.0);
      e.stunKind = 'time-stop';
    }

    const data: HitUltimateData = {
      skipsDone: 0,
      skipCd: 0.26,
      molotovFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'TIME TO MAKE THE DONUTS!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HitUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.molotovFired && data.skipsDone < 4) {
      data.skipCd -= dt;
      if (data.skipCd <= 0) {
        data.skipCd = 0.34;
        data.skipsDone += 1;
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
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.6);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.4),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.molotovFired && state.elapsed >= 2.0) {
      data.molotovFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'time-stop';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'TIME-SKIP MOLOTOV!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
