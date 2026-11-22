import type { UltimateHandler } from './types';

export interface DiavoloUltimateData {
  skipsDone: number;
  skipCd: number;
  donutFired: boolean;
  flash: number;
}

export const diavoloUltimateHandler: UltimateHandler = {
  characterId: 'diavolo',
  title: 'KING CRIMSON: TIME ERASURE!',
  subtitle:
    'Erases 10 seconds of fate (Invulnerable + Time-Stop Stun), warps behind foes 3 times, and executes with Crimson Chop!',
  bannerColor: '#e11d48',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.2);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.4);
      e.stunKind = 'time-stop';
    }

    const data: DiavoloUltimateData = {
      skipsDone: 0,
      skipCd: 0.3,
      donutFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#e11d48', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'KING CRIMSON: TIME HAS BEEN ERASED!!',
      '#e11d48',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'dodge', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DiavoloUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.donutFired && data.skipsDone < 3) {
      data.skipCd -= dt;
      if (data.skipCd <= 0) {
        data.skipCd = 0.42;
        data.skipsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x + Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y + Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 10.5),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.donutFired && state.elapsed >= 2.05) {
      data.donutFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#e11d48',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'THIS IS A TEST! CRIMSON EXECUTION!!',
        '#e11d48',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
