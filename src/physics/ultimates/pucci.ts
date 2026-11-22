import type { UltimateHandler } from './types';

export interface PucciUltimateData {
  blinksDone: number;
  blinkCd: number;
  resetFired: boolean;
  flash: number;
}

export const pucciUltimateHandler: UltimateHandler = {
  characterId: 'pucci',
  title: 'MADE IN HEAVEN: UNIVERSE RESET!',
  subtitle:
    'Accelerates universal time (Silence + Auto-Dodge + Infinite Speed), blinks 4 times at Mach speed, and triggers UNIVERSE RESET!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 2.6);
    }

    const data: PucciUltimateData = {
      blinksDone: 0,
      blinkCd: 0.26,
      resetFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'MADE IN HEAVEN: TIME ACCELERATES!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PucciUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.resetFired && data.blinksDone < 4) {
      data.blinkCd -= dt;
      if (data.blinkCd <= 0) {
        data.blinkCd = 0.34;
        data.blinksDone += 1;
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
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.25 });
        }
      }
    }

    if (!data.resetFired && state.elapsed >= 2.05) {
      data.resetFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'time-stop';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        375,
        '#f8fafc',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'UNIVERSE RESET: NEW WORLD!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
