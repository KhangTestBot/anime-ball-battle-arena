import type { UltimateHandler } from './types';

export interface GreedlingUltimateData {
  clawsDone: number;
  clawCd: number;
  shatterFired: boolean;
  flash: number;
}

export const greedlingUltimateHandler: UltimateHandler = {
  characterId: 'greedling',
  title: 'ULTIMATE SHIELD: CARBON HARDENING!',
  subtitle:
    'Full-body Carbon Armor (Totem Revive + Shield + Enchanted Armor + Unstoppable), rushes 3 times with Carbon Claws, and slams Avarice Shatter!',
  bannerColor: '#facc15',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#facc15';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: GreedlingUltimateData = {
      clawsDone: 0,
      clawCd: 0.3,
      shatterFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ULTIMATE SHIELD!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GreedlingUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.shatterFired && data.clawsDone < 3) {
      data.clawCd -= dt;
      if (data.clawCd <= 0) {
        data.clawCd = 0.44;
        data.clawsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 660;
          owner.vy = Math.sin(ang) * 660;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.shatterFired && state.elapsed >= 2.05) {
      data.shatterFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'AVARICE SHATTER!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
