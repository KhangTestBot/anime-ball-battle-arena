import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface ZerefUltimateData {
  waveDetonated: boolean;
  waveRadius: number;
  flash: number;
}

export const zerefUltimateHandler: UltimateHandler = {
  characterId: 'zeref',
  title: 'ANKHSERAM BLACK MAGIC: DEATH PREDATION · FAIRY HEART',
  subtitle:
    'Unleashes a pitch-black Death Predation wave inflicting lethal Karma Decay, Anti-Heal & Dodge Lock while Fairy Heart regenerates Zeref!',
  bannerColor: '#6d28d9',
  castDuration: 0.26,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        `+${heal} FAIRY HEART`,
        '#e9d5ff',
        'heal',
      );
    }

    const data: ZerefUltimateData = {
      waveDetonated: false,
      waveRadius: 40,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#6d28d9', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'CURSE OF ANKHSERAM!',
      '#c084fc',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZerefUltimateData;
    data.waveRadius = Math.min(340, data.waveRadius + dt * 210);
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.waveDetonated && state.elapsed >= 1.4) {
      data.waveDetonated = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.6);
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
        e.karmaTimer = Math.max(e.karmaTimer, 4.5);
        e.karmaDps = Math.max(e.karmaDps, ctx.getEffectiveDamage(owner, 5.4));
        e.karmaOwnerUid = owner.uid;
        e.karmaKind = 'wither';
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 20.5), 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        330,
        '#6d28d9',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'DEATH PREDATION!!',
        '#d8b4fe',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
