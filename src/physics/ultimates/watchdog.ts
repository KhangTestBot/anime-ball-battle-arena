import type { UltimateHandler } from './types';

export interface WatchdogUltimateData {
  pouncesDone: number;
  pounceCd: number;
  claimFired: boolean;
  flash: number;
}

export const watchdogUltimateHandler: UltimateHandler = {
  characterId: 'watchdog',
  title: 'Q-CITY GUARDIAN: FEROCIOUS PAW BLITZ!',
  subtitle:
    'Drops into four-legged feral guard stance (Unstoppable + Auto-Dodge), chains 4 blinding Paw Blitz pounces, and erupts with Territory Claim!',
  bannerColor: '#38bdf8',
  castDuration: 0.2,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);

    const data: WatchdogUltimateData = {
      pouncesDone: 0,
      pounceCd: 0.26,
      claimFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'Q-CITY GUARDIAN!',
      '#f8fafc',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as WatchdogUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.claimFired && data.pouncesDone < 4) {
      data.pounceCd -= dt;
      if (data.pounceCd <= 0) {
        data.pounceCd = 0.34;
        data.pouncesDone += 1;
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
            ctx.getEffectiveDamage(owner, 8.6),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            115,
            '#f8fafc',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'dodge', intensity: 1.15 });
        }
      }
    }

    if (!data.claimFired && state.elapsed >= 1.95) {
      data.claimFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        290,
        '#38bdf8',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'TERRITORY CLAIMED!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });
    }
  },
};
