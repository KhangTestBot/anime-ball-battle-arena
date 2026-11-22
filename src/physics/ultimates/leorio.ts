import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface LeorioUltimateData {
  warpsDone: number;
  warpCd: number;
  uppercutFired: boolean;
  flash: number;
}

export const leorioUltimateHandler: UltimateHandler = {
  characterId: 'leorio',
  title: 'REMOTE PUNCH: WARP UPPERCUT!',
  subtitle:
    'Doctor Nen Heal (+16% DMG & Unstoppable), fires 3 teleporting Emission punches from beneath foes, and launches a massive Warp Uppercut!',
  bannerColor: '#2563eb',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} MEDICAL NEN`,
        '#4ade80',
        'heal',
      );
    }

    const data: LeorioUltimateData = {
      warpsDone: 0,
      warpCd: 0.3,
      uppercutFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#2563eb', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'REMOTE PUNCH!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LeorioUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.uppercutFired && data.warpsDone < 3) {
      data.warpCd -= dt;
      if (data.warpCd <= 0) {
        data.warpCd = 0.44;
        data.warpsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          target.airborneTimer = Math.max(target.airborneTimer, 0.7);
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            130,
            '#2563eb',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.2 });
        }
      }
    }

    if (!data.uppercutFired && state.elapsed >= 2.0) {
      data.uppercutFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.5),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#facc15',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'WARP UPPERCUT!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
