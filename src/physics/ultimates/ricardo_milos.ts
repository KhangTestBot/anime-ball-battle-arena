import type { UltimateHandler } from './types';

export interface RicardoMilosUltimateData {
  flexesDone: number;
  flexCd: number;
  uGotThatFired: boolean;
  flash: number;
}

export const ricardoMilosUltimateHandler: UltimateHandler = {
  characterId: 'ricardo_milos',
  title: 'U GOT THAT: NEON DISCO FLEX!!',
  subtitle:
    'Charms all foes with dazzling disco lights (Genjutsu Stun + Unstoppable), chains 3 neon flex dashes, and drops U GOT THAT!',
  bannerColor: '#ec4899',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.25);
      e.stunKind = 'genjutsu';
    }

    const data: RicardoMilosUltimateData = {
      flexesDone: 0,
      flexCd: 0.28,
      uGotThatFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'CAUSE YOU GOT THAT!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RicardoMilosUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.uGotThatFired && data.flexesDone < 3) {
      data.flexCd -= dt;
      if (data.flexCd <= 0) {
        data.flexCd = 0.42;
        data.flexesDone += 1;
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
            ctx.getEffectiveDamage(owner, 10.2),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.uGotThatFired && state.elapsed >= 2.05) {
      data.uGotThatFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 670,
          Math.sin(ang) * 670,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        365,
        '#ec4899',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'U GOT THAT: MAXIMUM FLEX!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
