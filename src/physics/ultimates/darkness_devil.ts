import type { UltimateHandler } from './types';

export interface DarknessDevilUltimateData {
  cutsDone: number;
  cutCd: number;
  bellFired: boolean;
  flash: number;
}

export const darknessDevilUltimateHandler: UltimateHandler = {
  characterId: 'darkness_devil',
  title: 'PRIMAL FEAR: ASTRONAUTS & DISMEMBERMENT!',
  subtitle:
    'Plunges the arena into pitch-black Primal Fear (Fear + Silence + Anti-Heal + Unstoppable), severs defenses with 3 invisible waves, and tolls the Darkness Bell!',
  bannerColor: '#7e22ce',
  castDuration: 0.26,
  duration: 4.2,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 24;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 4.0);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 4.0);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.0);
      e.stunKind = 'fear';
      e.silenceTimer = Math.max(e.silenceTimer, 3.0);
      e.antiHealTimer = Math.max(e.antiHealTimer, 5.0);
    }

    const data: DarknessDevilUltimateData = {
      cutsDone: 0,
      cutCd: 0.34,
      bellFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7e22ce', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'PRIMAL FEAR: DARKNESS!!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DarknessDevilUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bellFired && data.cutsDone < 3) {
      data.cutCd -= dt;
      if (data.cutCd <= 0) {
        data.cutCd = 0.45;
        data.cutsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 4.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 9.6), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          245,
          '#7e22ce',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.3 });
      }
    }

    if (!data.bellFired && state.elapsed >= 2.1) {
      data.bellFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.3);
        e.stunKind = 'fear';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        370,
        '#a855f7',
        14,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'DARKNESS DEVIL DISMEMBERMENT!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};
