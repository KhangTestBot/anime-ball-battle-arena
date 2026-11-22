import type { UltimateHandler } from './types';

export interface MetalBatUltimateData {
  spiritBonusPct: number;
  spinsDone: number;
  spinCd: number;
  homeRunFired: boolean;
  flash: number;
}

export const metalbatUltimateHandler: UltimateHandler = {
  characterId: 'metalbat',
  title: 'FIGHTING SPIRIT: SAVAGE TORNADO!',
  subtitle:
    'Pumps up Fighting Spirit (+15% to +35% DMG scaling with missing HP + Unstoppable), rips through foes with 3 Savage Tornado spins, and crushes with Dragon Thrashing!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    const missingRatio = Math.max(0, Math.min(1, 1 - owner.hp / Math.max(1, owner.maxHp)));
    const spiritBonusPct = Math.round(15 + missingRatio * 20);
    owner.dmgBonusPct += spiritBonusPct;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: MetalBatUltimateData = {
      spiritBonusPct,
      spinsDone: 0,
      spinCd: 0.34,
      homeRunFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      `FIGHTING SPIRIT +${spiritBonusPct}%!`,
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MetalBatUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.homeRunFired && data.spinsDone < 3) {
      data.spinCd -= dt;
      if (data.spinCd <= 0) {
        data.spinCd = 0.44;
        data.spinsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 580;
          owner.vy = Math.sin(ang) * 580;
        }
        for (const e of ctx.getEnemies(owner)) {
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          170,
          '#ef4444',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.homeRunFired && state.elapsed >= 2.0) {
      data.homeRunFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'airborne';
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
        300,
        '#cbd5e1',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'DRAGON THRASHING!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
