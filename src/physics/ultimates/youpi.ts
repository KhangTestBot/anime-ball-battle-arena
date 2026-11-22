import type { UltimateHandler } from './types';

export interface YoupiUltimateData {
  chargesDone: number;
  chargeCd: number;
  rageBlastFired: boolean;
  flash: number;
}

export const youpiUltimateHandler: UltimateHandler = {
  characterId: 'youpi',
  title: 'RAGE INCARNATE: METAMORPHIC RAGE BLAST!',
  subtitle:
    'Royal Guard juggernaut (+22% DMG, Enchanted Armor & Unstoppable), emits 3 volcanic rage pulses, and detonates a colossal Rage Blast!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: YoupiUltimateData = {
      chargesDone: 0,
      chargeCd: 0.34,
      rageBlastFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'RAGE INCARNATE!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YoupiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.rageBlastFired && data.chargesDone < 3) {
      data.chargeCd -= dt;
      if (data.chargeCd <= 0) {
        data.chargeCd = 0.44;
        data.chargesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 350,
            Math.sin(ang) * 350,
            { isCrit: true, sourceKind: 'ability' },
          );
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          230,
          '#f59e0b',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'wall', intensity: 1.25 });
      }
    }

    if (!data.rageBlastFired && state.elapsed >= 2.05) {
      data.rageBlastFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
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
        '#dc2626',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'METAMORPHIC RAGE BLAST!!',
        '#f59e0b',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};
