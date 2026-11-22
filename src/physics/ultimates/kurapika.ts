import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface KurapikaUltimateData {
  chainsDone: number;
  chainCd: number;
  judgmentFired: boolean;
  flash: number;
}

export const kurapikaUltimateHandler: UltimateHandler = {
  characterId: 'kurapika',
  title: 'EMPEROR TIME: CHAIN JAIL & JUDGMENT CHAIN!',
  subtitle:
    'Scarlet Eyes awaken Emperor Time (+20% DMG & Holy Chain Heal), forces enemies into Zetsu (Chained + Silence), and pierces them with Judgment Chain!',
  bannerColor: '#eab308',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} HOLY CHAIN`,
        '#eab308',
        'heal',
      );
    }
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.0);
      e.stunKind = 'chained';
      e.silenceTimer = Math.max(e.silenceTimer, 2.8);
    }

    const data: KurapikaUltimateData = {
      chainsDone: 0,
      chainCd: 0.32,
      judgmentFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'EMPEROR TIME!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KurapikaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.judgmentFired && data.chainsDone < 3) {
      data.chainCd -= dt;
      if (data.chainCd <= 0) {
        data.chainCd = 0.44;
        data.chainsDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 8.6), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          215,
          '#eab308',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.judgmentFired && state.elapsed >= 2.05) {
      data.judgmentFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#dc2626',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'JUDGMENT CHAIN!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
