import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface ErwinUltimateData {
  flaresFired: number;
  flareCd: number;
  chargeFired: boolean;
  flash: number;
}

export const erwinUltimateHandler: UltimateHandler = {
  characterId: 'erwin',
  title: 'SHINZOU WO SASAGEYO!: FINAL CHARGE!',
  subtitle:
    'Rallies undying resolve (Totem Revive, +24% DMG, Heal & Unstoppable), fires 3 Signal Flares shredding armor, and leads a devastating Cavalry Charge!',
  bannerColor: '#15803d',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 24;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} DEDICATE YOUR HEART`,
        '#4ade80',
        'heal',
      );
    }

    const data: ErwinUltimateData = {
      flaresFired: 0,
      flareCd: 0.34,
      chargeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'SHINZOU WO SASAGEYO!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ErwinUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.chargeFired && data.flaresFired < 3) {
      data.flareCd -= dt;
      if (data.flareCd <= 0) {
        data.flareCd = 0.44;
        data.flaresFired += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.6), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          215,
          '#15803d',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.chargeFired && state.elapsed >= 2.05) {
      data.chargeFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
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
        owner.y - owner.radius - 28,
        'MY SOLDIERS, RAGE!!',
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
