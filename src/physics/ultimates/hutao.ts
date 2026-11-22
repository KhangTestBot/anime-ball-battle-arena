import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface HuTaoUltimateData {
  dashesDone: number;
  dashCd: number;
  sootherFired: boolean;
  flash: number;
}

export const hutaoUltimateHandler: UltimateHandler = {
  characterId: 'hutao',
  title: 'SPIRIT SOOTHER: BUTTERFLY PHANTASM!',
  subtitle:
    'Activates Paramita Papilio (+22% DMG Pyro infusion), dashes 3 times with burning crimson butterflies, and unleashes Spirit Soother to heal & incinerate!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    const lowHpBonus = owner.hp < owner.maxHp * 0.5 ? 28 : 22;
    owner.dmgBonusPct += lowHpBonus;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const data: HuTaoUltimateData = {
      dashesDone: 0,
      dashCd: 0.3,
      sootherFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'PYRE, PYRE, PANTS ON FIRE!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HuTaoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.sootherFired && data.dashesDone < 3) {
      data.dashCd -= dt;
      if (data.dashCd <= 0) {
        data.dashCd = 0.44;
        data.dashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 660;
          owner.vy = Math.sin(ang) * 660;
          target.burnTimer = Math.max(target.burnTimer, 4.0);
          target.burnDps = Math.max(target.burnDps, 8.5);
          target.burnOwnerUid = owner.uid;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 310,
            Math.sin(ang) * 310,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.sootherFired && state.elapsed >= 2.0) {
      data.sootherFired = true;
      data.flash = 1.35;
      const heal = Math.round(owner.maxHp * 0.18 * getHealMultiplier(owner));
      if (heal > 0) {
        owner.hp = Math.min(owner.maxHp, owner.hp + heal);
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 14,
          `+${heal} SPIRIT SOOTHER`,
          '#4ade80',
          'heal',
        );
      }
      for (const e of ctx.getEnemies(owner)) {
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 570,
          Math.sin(ang) * 570,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#f97316',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'SPIRIT SOOTHER!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
