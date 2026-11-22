import { applyFighterStun, getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface MakimaUltimateData {
  bangsFired: number;
  bangCd: number;
  bangX: number;
  bangY: number;
  bangFlash: number;
}

export const makimaUltimateHandler: UltimateHandler = {
  characterId: 'makima',
  title: 'CONTROL DEVIL: BANG! · PRIME MINISTER CONTRACT',
  subtitle:
    'Binds enemies in crimson Control Chains, fires 3 invisible kinetic BANG! blasts slamming foes into walls, and heals via her Prime Minister Contract!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    const heal = Math.round(owner.maxHp * 0.12 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        `+${heal} CONTRACT`,
        '#f87171',
        'heal',
      );
    }

    for (const e of ctx.getEnemies(owner)) {
      applyFighterStun(ctx, owner, e, 0.55, 'chained', 'CONTROLLED!');
    }

    const data: MakimaUltimateData = {
      bangsFired: 0,
      bangCd: 0.55,
      bangX: owner.x,
      bangY: owner.y,
      bangFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 26, 'OBEY ME.', '#ef4444', 'powerup');
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MakimaUltimateData;
    if (data.bangFlash > 0) data.bangFlash = Math.max(0, data.bangFlash - dt);

    if (data.bangsFired < 3) {
      data.bangCd -= dt;
      if (data.bangCd <= 0) {
        data.bangCd = 0.72;
        data.bangsFired += 1;
        data.bangFlash = 0.5;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          data.bangX = target.x;
          data.bangY = target.y;
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          if (data.bangsFired === 3) {
            target.shieldTimer = 0;
            target.dodgeLockedTimer = Math.max(target.dodgeLockedTimer, 2.2);
          }
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, data.bangsFired === 3 ? 16.5 : 10.0),
            Math.cos(ang) * 680,
            Math.sin(ang) * 680,
            {
              isCrit: data.bangsFired === 3,
              bypassInvuln: data.bangsFired === 3,
              sourceKind: 'ability',
            },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            165,
            '#dc2626',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 22,
            'BANG!',
            '#ef4444',
            'crit',
          );
          ctx.addScreenShake(13);
          ctx.emitSfx({ type: 'crit', intensity: 1.25 });
        }
      }
    }
  },
};
