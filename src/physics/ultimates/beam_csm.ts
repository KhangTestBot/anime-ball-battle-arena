import type { UltimateHandler } from './types';

export interface BeamCsmUltimateData {
  breachesDone: number;
  breachCd: number;
  chompFired: boolean;
  flash: number;
}

export const beamCsmUltimateHandler: UltimateHandler = {
  characterId: 'beam_csm',
  title: 'SHARK FIEND: FLOOR-SWIMMING JAWS!',
  subtitle:
    'Swims through the solid arena floor (Auto-Dodge + Unstoppable), breaches 4 times beneath foes, and erupts with Shark Fiend Chomp!',
  bannerColor: '#0284c7',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: BeamCsmUltimateData = {
      breachesDone: 0,
      breachCd: 0.26,
      chompFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#0284c7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'LORD CHAINSAW!! SHARK DIVE!',
      '#0284c7',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BeamCsmUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.chompFired && data.breachesDone < 4) {
      data.breachCd -= dt;
      if (data.breachCd <= 0) {
        data.breachCd = 0.34;
        data.breachesDone += 1;
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
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.chompFired && state.elapsed >= 2.0) {
      data.chompFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#0284c7',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SHARK FIEND CHOMP!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
