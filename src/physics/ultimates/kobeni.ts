import type { UltimateHandler } from './types';

export interface KobeniUltimateData {
  zipsDone: number;
  zipCd: number;
  panicCritFired: boolean;
  flash: number;
}

export const kobeniUltimateHandler: UltimateHandler = {
  characterId: 'kobeni',
  title: 'PANICKED GODDESS: MIRACULOUS KNIFE DANCE!',
  subtitle:
    'Pure panic survival (Invulnerable + Auto-Dodge + confuses foes), zips 4 times slicing wildly, and lands a miraculous Panic Crit!',
  bannerColor: '#f59e0b',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.0);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.4);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.5);
    }

    const data: KobeniUltimateData = {
      zipsDone: 0,
      zipCd: 0.26,
      panicCritFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'WAAAH! STAY BACK!!',
      '#f59e0b',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KobeniUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.panicCritFired && data.zipsDone < 4) {
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
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 1.1) * 60),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 1.1) * 60),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.4),
            Math.cos(ang) * 260,
            Math.sin(ang) * 260,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.15 });
        }
      }
    }

    if (!data.panicCritFired && state.elapsed >= 2.0) {
      data.panicCritFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#f59e0b',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'MIRACULOUS PANIC CRIT!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'crit', intensity: 1.4 });
    }
  },
};
