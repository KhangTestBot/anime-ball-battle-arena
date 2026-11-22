import type { UltimateHandler } from './types';

export interface KirishimaUltimateData {
  countersDone: number;
  counterCd: number;
  gauntletFired: boolean;
  flash: number;
}

export const kirishimaUltimateHandler: UltimateHandler = {
  characterId: 'kirishima',
  title: 'RED RIOT UNBREAKABLE: RED GAUNTLET!',
  subtitle:
    'Hardens into jagged Unbreakable armor (Shield + Enchanted Armor + Unstoppable), slams 3 Red Counters, and smashes with Red Gauntlet!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#ef4444';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: KirishimaUltimateData = {
      countersDone: 0,
      counterCd: 0.3,
      gauntletFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'RED RIOT: UNBREAKABLE!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'wall', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KirishimaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.gauntletFired && data.countersDone < 3) {
      data.counterCd -= dt;
      if (data.counterCd <= 0) {
        data.counterCd = 0.44;
        data.countersDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 630;
          owner.vy = Math.sin(ang) * 630;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 360,
            Math.sin(ang) * 360,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.gauntletFired && state.elapsed >= 2.0) {
      data.gauntletFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RED GAUNTLET!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
