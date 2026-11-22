import type { UltimateHandler } from './types';

export interface KillerBeeUltimateData {
  lariatsDone: number;
  lariatCd: number;
  bijuudamaFired: boolean;
  flash: number;
}

export const killerbeeUltimateHandler: UltimateHandler = {
  characterId: 'killerbee',
  title: 'EIGHT-TAILS GYUKI: TAILED BEAST BOMB!',
  subtitle:
    'Cloaks in Eight-Tails chakra (+20% DMG & Unstoppable), slams 3 Lariat & Twister strikes, and detonates a colossal Bijuudama!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: KillerBeeUltimateData = {
      lariatsDone: 0,
      lariatCd: 0.32,
      bijuudamaFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'FOOL, YA FOOL!! EIGHT-TAILS!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KillerBeeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bijuudamaFired && data.lariatsDone < 3) {
      data.lariatCd -= dt;
      if (data.lariatCd <= 0) {
        data.lariatCd = 0.44;
        data.lariatsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 680;
          owner.vy = Math.sin(ang) * 680;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.4),
            Math.cos(ang) * 380,
            Math.sin(ang) * 380,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.bijuudamaFired && state.elapsed >= 2.05) {
      data.bijuudamaFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        345,
        '#ef4444',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 28, 'BIJUUDAMA!!', '#facc15', 'crit');
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};
