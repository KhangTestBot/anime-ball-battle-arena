import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface HohenheimUltimateData {
  circlesDone: number;
  circleCd: number;
  xerxesFired: boolean;
  flash: number;
}

export const hohenheimUltimateHandler: UltimateHandler = {
  characterId: 'hohenheim',
  title: 'LIVING PHILOSOPHER STONE: REVERSE CIRCLE!',
  subtitle:
    '536,329 souls awaken (Totem Revive + Shield + Heal), silences foes with 3 Reverse Transmutation rings, and unleashes Golden Light of Xerxes!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#eab308';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    const heal = Math.round(owner.maxHp * 0.18 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} 536,329 SOULS`,
        '#eab308',
        'heal',
      );
    }

    const data: HohenheimUltimateData = {
      circlesDone: 0,
      circleCd: 0.34,
      xerxesFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'NATIONWIDE REVERSE CIRCLE!!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HohenheimUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.xerxesFired && data.circlesDone < 3) {
      data.circleCd -= dt;
      if (data.circleCd <= 0) {
        data.circleCd = 0.45;
        data.circlesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.silenceTimer = Math.max(e.silenceTimer, 2.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.8), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#eab308',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
      }
    }

    if (!data.xerxesFired && state.elapsed >= 2.05) {
      data.xerxesFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#eab308',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GOLDEN LIGHT OF XERXES!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
