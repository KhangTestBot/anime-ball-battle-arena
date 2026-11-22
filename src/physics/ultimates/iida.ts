import type { UltimateHandler } from './types';

export interface IidaUltimateData {
  kicksDone: number;
  kickCd: number;
  extendFired: boolean;
  flash: number;
}

export const iidaUltimateHandler: UltimateHandler = {
  characterId: 'iida',
  title: 'RECIPRO TURBO: ENGINE OVERDRIVE!',
  subtitle:
    'Ignites blue engine turbo (+18% DMG & Unstoppable), rockets across the arena 4 times with Recipro Burst kicks, and finishes with Recipro Extend!',
  bannerColor: '#3b82f6',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: IidaUltimateData = {
      kicksDone: 0,
      kickCd: 0.26,
      extendFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#3b82f6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'RECIPRO TURBO!!',
      '#3b82f6',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IidaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.extendFired && data.kicksDone < 4) {
      data.kickCd -= dt;
      if (data.kickCd <= 0) {
        data.kickCd = 0.34;
        data.kicksDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 760;
          owner.vy = Math.sin(ang) * 760;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 380,
            Math.sin(ang) * 380,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
        }
      }
    }

    if (!data.extendFired && state.elapsed >= 2.0) {
      data.extendFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#3b82f6',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RECIPRO EXTEND!!',
        '#3b82f6',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
