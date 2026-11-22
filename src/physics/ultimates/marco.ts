import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface MarcoUltimateData {
  swoopsDone: number;
  swoopCd: number;
  regenCd: number;
  pyreFired: boolean;
  flash: number;
}

export const marcoUltimateHandler: UltimateHandler = {
  characterId: 'marco',
  title: 'TORI TORI NO MI: BLUE PHOENIX REBIRTH!',
  subtitle:
    'Ignites Blue Phoenix Flames (Totem Rebirth + continuous HP regeneration + Unstoppable), swoops 3 times with Bluebird, and erupts with Undying Pyre!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    const heal = Math.round(owner.maxHp * 0.18 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} PHOENIX FLAMES`,
        '#38bdf8',
        'heal',
      );
    }

    const data: MarcoUltimateData = {
      swoopsDone: 0,
      swoopCd: 0.32,
      regenCd: 0.65,
      pyreFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BLUE PHOENIX REBIRTH!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MarcoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    data.regenCd -= dt;
    if (data.regenCd <= 0) {
      data.regenCd = 0.7;
      const tickHeal = Math.round(owner.maxHp * 0.04 * getHealMultiplier(owner));
      if (tickHeal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + tickHeal);
    }

    if (!data.pyreFired && data.swoopsDone < 3) {
      data.swoopCd -= dt;
      if (data.swoopCd <= 0) {
        data.swoopCd = 0.44;
        data.swoopsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 660;
          owner.vy = Math.sin(ang) * 660;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            135,
            '#38bdf8',
            7,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
        }
      }
    }

    if (!data.pyreFired && state.elapsed >= 2.05) {
      data.pyreFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
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
        'PHOENIX BRAND: UNDYING PYRE!!',
        '#38bdf8',
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
