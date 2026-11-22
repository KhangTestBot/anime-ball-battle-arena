import type { UltimateHandler } from './types';

export interface PolnareffUltimateData {
  thrustsDone: number;
  thrustCd: number;
  millionFired: boolean;
  flash: number;
}

export const polnareffUltimateHandler: UltimateHandler = {
  characterId: 'polnareff',
  title: 'SILVER CHARIOT: ARMOR OFF!!',
  subtitle:
    'Sheds silver armor for blinding afterimage speed (Auto-Dodge), chains 5 rapier blink-thrusts, and finishes with Million Prick!',
  bannerColor: '#cbd5e1',
  castDuration: 0.18,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    owner.dmgBonusPct += 20;

    const data: PolnareffUltimateData = {
      thrustsDone: 0,
      thrustCd: 0.22,
      millionFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#cbd5e1', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SILVER CHARIOT: ARMOR OFF!!',
      '#cbd5e1',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PolnareffUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.millionFired && data.thrustsDone < 5) {
      data.thrustCd -= dt;
      if (data.thrustCd <= 0) {
        data.thrustCd = 0.28;
        data.thrustsDone += 1;
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
            ctx.getEffectiveDamage(owner, 7.6),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.millionFired && state.elapsed >= 2.0) {
      data.millionFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#cbd5e1',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HORA HORA HORA! MILLION PRICK!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
