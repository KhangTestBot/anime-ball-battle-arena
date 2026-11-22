import type { UltimateHandler } from './types';

export interface ShirouUltimateData {
  strikesDone: number;
  strikeCd: number;
  finalCutFired: boolean;
  flash: number;
}

export const shirouUltimateHandler: UltimateHandler = {
  characterId: 'shirou',
  title: 'TRACE ON: NINE LIVES BLADE WORKS!',
  subtitle:
    'Activates Avalon (+14% HP + Unstoppable), chains 5 supersonic projected Berserker-blade strikes, and finishes with Nine Lives Cleave!',
  bannerColor: '#f97316',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.maxHp * 0.14);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.dmgBonusPct += 20;

    const data: ShirouUltimateData = {
      strikesDone: 0,
      strikeCd: 0.22,
      finalCutFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TRACE ON!! NINE LIVES BLADE WORKS!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ShirouUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.finalCutFired && data.strikesDone < 5) {
      data.strikeCd -= dt;
      if (data.strikeCd <= 0) {
        data.strikeCd = 0.28;
        data.strikesDone += 1;
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
            ctx.getEffectiveDamage(owner, 7.8),
            Math.cos(ang) * 300,
            Math.sin(ang) * 300,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.finalCutFired && state.elapsed >= 2.0) {
      data.finalCutFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 630,
          Math.sin(ang) * 630,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#f97316',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'NINE LIVES: FINAL STRIKE!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
