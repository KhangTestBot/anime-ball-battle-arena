import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface MuzanUltimateData {
  whipAngle: number;
  lashCd: number;
  lashCount: number;
  nerveBurstFired: boolean;
  whipRadius: number;
}

export const muzanUltimateHandler: UltimateHandler = {
  characterId: 'muzan',
  title: 'DEMON KING MUZAN: NINE BIOWHIPS & DEMON BLOOD VENOM',
  subtitle:
    'Continuous Demon King cell regeneration (+12% Max HP) · Sweeps 9 Flesh Barbed Whips chaining hits, breaking shields & injecting Demon Blood Venom → Neural shockwave inflicts Disorientation!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const healAmt = owner.maxHp * 0.12 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${Math.round(healAmt)} DEMON REGEN`,
        '#f87171',
        'heal',
      );
    }

    const data: MuzanUltimateData = {
      whipAngle: 0,
      lashCd: 0.25,
      lashCount: 0,
      nerveBurstFired: false,
      whipRadius: 245,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#991b1b',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'DEMON KING: BIOWHIP STORM!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#dc2626', 80, 260, 3, 6, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MuzanUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.whipAngle += dt * 7.5;

    // 1. 9-Biowhip Flesh Tentacles sweeping & infecting enemies with Demon Blood Poison!
    if (state.elapsed < 2.2) {
      data.lashCd -= dt;
      if (data.lashCd <= 0) {
        data.lashCd = 0.45;
        data.lashCount++;
        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= data.whipRadius + e.radius) {
            e.karmaTimer = Math.max(e.karmaTimer, 3.0);
            e.karmaDps = Math.max(e.karmaDps, 8);
            e.karmaOwnerUid = owner.uid;
            e.karmaKind = 'kr';
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.6), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnFloatingText(e.x, e.y - e.radius - 12, 'DEMON BLOOD!', '#f87171', 'callout');
          }
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.0 });
      }
      return;
    }

    // Climax (2.2s): Toxic Shockwave shattering nerves & tearing shields!
    if (!data.nerveBurstFired && state.elapsed >= 2.2) {
      data.nerveBurstFired = true;
      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 230 + e.radius) {
          const d = Math.max(1, dist);
          e.shieldTimer = 0;
          e.confusedTimer = Math.max(e.confusedTimer, 1.4);
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.5);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 13.0),
            (dx / d) * 460,
            (dy / d) * 460,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        240,
        '#dc2626',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'SHOCKWAVE PULSE!!',
        '#fecaca',
        'powerup',
      );
      ctx.addHitstop(0.075);
      ctx.addScreenShake(18);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
