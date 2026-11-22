import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface ZombieUltimateData {
  wavesDone: number;
  waveCd: number;
  flash: number;
}

export const zombieUltimateHandler: UltimateHandler = {
  characterId: 'zombie',
  title: 'UNDEAD SIEGE · INFECTIOUS HORDE',
  subtitle:
    'Heals with Rotten Flesh sustain, dons unstoppable Iron Siege armor, and unleashes 3 infectious waves inflicting Hunger Anti-Heal & Decay!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.0);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        `+${heal} UNDEAD REGEN`,
        '#4ade80',
        'heal',
      );
    }

    const data: ZombieUltimateData = {
      wavesDone: 0,
      waveCd: 0.45,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ZOMBIE SIEGE!!',
      '#4ade80',
      'powerup',
    );
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZombieUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.72;
        data.wavesDone += 1;
        data.flash = 0.55;
        for (const e of ctx.getEnemies(owner)) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 245 + e.radius) {
            e.antiHealTimer = Math.max(e.antiHealTimer, 4.2);
            e.karmaTimer = Math.max(e.karmaTimer, 3.8);
            e.karmaDps = Math.max(e.karmaDps, ctx.getEffectiveDamage(owner, 4.5));
            e.karmaOwnerUid = owner.uid;
            e.karmaKind = 'wither';
            if (data.wavesDone === 3) e.shieldTimer = 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, data.wavesDone === 3 ? 16.5 : 9.2),
              0,
              0,
              {
                isCrit: data.wavesDone === 3,
                bypassInvuln: data.wavesDone === 3,
                sourceKind: 'ability',
              },
            );
          }
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#22c55e',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.addScreenShake(11);
        ctx.emitSfx({ type: 'crit', intensity: 1.15 });
      }
    }
  },
};
