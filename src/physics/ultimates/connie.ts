import type { UltimateHandler } from './types';

export interface ConnieUltimateData {
  spinsDone: number;
  spinCd: number;
  slashFired: boolean;
  flash: number;
}

export const connieUltimateHandler: UltimateHandler = {
  characterId: 'connie',
  title: 'ODM ACROBAT: SPINNING BLADE STORM!',
  subtitle:
    'Unleashes acrobatic ODM spins (Auto-Dodge + Unstoppable), dashes 4 times slicing enemies, and finishes with Ragako Revenge Slash!',
  bannerColor: '#38bdf8',
  castDuration: 0.2,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);

    const data: ConnieUltimateData = {
      spinsDone: 0,
      spinCd: 0.26,
      slashFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ODM SPINNING STORM!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ConnieUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.slashFired && data.spinsDone < 4) {
      data.spinCd -= dt;
      if (data.spinCd <= 0) {
        data.spinCd = 0.34;
        data.spinsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 640;
          owner.vy = Math.sin(ang) * 640;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.2),
            Math.cos(ang) * 280,
            Math.sin(ang) * 280,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            115,
            '#38bdf8',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.15 });
        }
      }
    }

    if (!data.slashFired && state.elapsed >= 1.95) {
      data.slashFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.0),
          Math.cos(ang) * 510,
          Math.sin(ang) * 510,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        280,
        '#15803d',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RAGAKO REVENGE SLASH!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'slash', intensity: 1.35 });
    }
  },
};
