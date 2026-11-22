import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface TsunadeUltimateData {
  punchesDone: number;
  punchCd: number;
  regenCd: number;
  footFired: boolean;
  flash: number;
}

export const tsunadeUltimateHandler: UltimateHandler = {
  characterId: 'tsunade',
  title: 'BYAKUGO SEAL: HEAVENLY FOOT OF PAIN!',
  subtitle:
    'Releases Strength of a Hundred Seal (Totem Revive + massive HP regeneration + Unstoppable), slams 3 Chakra punches, and shatters the arena!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 20;
    const heal = Math.round(owner.maxHp * 0.2 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} BYAKUGO SEAL`,
        '#4ade80',
        'heal',
      );
    }

    const data: TsunadeUltimateData = {
      punchesDone: 0,
      punchCd: 0.32,
      regenCd: 0.65,
      footFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'STRENGTH OF A HUNDRED!!',
      '#22c55e',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TsunadeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    data.regenCd -= dt;
    if (data.regenCd <= 0) {
      data.regenCd = 0.7;
      const tickHeal = Math.round(owner.maxHp * 0.045 * getHealMultiplier(owner));
      if (tickHeal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + tickHeal);
    }

    if (!data.footFired && data.punchesDone < 3) {
      data.punchCd -= dt;
      if (data.punchCd <= 0) {
        data.punchCd = 0.44;
        data.punchesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 630;
          owner.vy = Math.sin(ang) * 630;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 400,
            Math.sin(ang) * 400,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.footFired && state.elapsed >= 2.05) {
      data.footFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#eab308',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'HEAVENLY FOOT OF PAIN!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
