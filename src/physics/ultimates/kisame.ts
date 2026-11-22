import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface KisameUltimateData {
  sharksDone: number;
  sharkCd: number;
  superSharkFired: boolean;
  flash: number;
}

export const kisameUltimateHandler: UltimateHandler = {
  characterId: 'kisame',
  title: 'WATER PRISON SHARK DANCE: SUPER SHARK BOMB!',
  subtitle:
    'Floods the arena (Frost Drag + Silence + Samehada Chakra Heal), rushes 3 times, and unleashes Great Shark Bullet!',
  bannerColor: '#0284c7',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} SAMEHADA DRAIN`,
        '#38bdf8',
        'heal',
      );
    }
    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 4.0);
      e.silenceTimer = Math.max(e.silenceTimer, 2.2);
    }

    const data: KisameUltimateData = {
      sharksDone: 0,
      sharkCd: 0.32,
      superSharkFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#0284c7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'WATER PRISON SHARK DANCE!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KisameUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.superSharkFired && data.sharksDone < 3) {
      data.sharkCd -= dt;
      if (data.sharkCd <= 0) {
        data.sharkCd = 0.44;
        data.sharksDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 650;
          owner.vy = Math.sin(ang) * 650;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 340,
            Math.sin(ang) * 340,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.superSharkFired && state.elapsed >= 2.0) {
      data.superSharkFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
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
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SUPER SHARK BOMB!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
