import type { UltimateHandler } from './types';

export interface SubZeroUltimateData {
  slidesDone: number;
  slideCd: number;
  shatterFired: boolean;
  flash: number;
}

export const subzeroUltimateHandler: UltimateHandler = {
  characterId: 'subzero',
  title: 'LIN KUEI GRANDMASTER: DEEP FREEZE FATALITY!',
  subtitle:
    'Freezes enemies solid with Ice Clones, chains 3 armor-shredding Ice Slides, and shatters them with Absolute Zero Fatality!',
  bannerColor: '#0284c7',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.shieldColor = '#38bdf8';
    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 4.0);
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'frozen';
    }

    const data: SubZeroUltimateData = {
      slidesDone: 0,
      slideCd: 0.32,
      shatterFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'DEEP FREEZE!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SubZeroUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.shatterFired && data.slidesDone < 3) {
      data.slideCd -= dt;
      if (data.slideCd <= 0) {
        data.slideCd = 0.44;
        data.slidesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 660;
          owner.vy = Math.sin(ang) * 660;
          target.frostTimer = Math.max(target.frostTimer, 3.5);
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.5);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.shatterFired && state.elapsed >= 2.0) {
      data.shatterFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.3);
        e.stunKind = 'frozen';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'ABSOLUTE ZERO FATALITY!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
