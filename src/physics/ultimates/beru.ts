import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BeruUltimateData {
  blinksDone: number;
  blinkCd: number;
  rendFired: boolean;
  flash: number;
}

export const beruUltimateHandler: UltimateHandler = {
  characterId: 'beru',
  title: 'MARSHAL BERU: ANT KING FRENZY!',
  subtitle:
    'Unleashes a terrifying Ant King Screech (Fear + Armor Shred), chains 4 hyperspeed claw-blinks with Devour Heal, and finishes with Shadow Marshal Rend!',
  bannerColor: '#a855f7',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.4);
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'fear';
      e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
    }

    const data: BeruUltimateData = {
      blinksDone: 0,
      blinkCd: 0.28,
      rendFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'KIEEEEEEEK!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BeruUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.rendFired && data.blinksDone < 4) {
      data.blinkCd -= dt;
      if (data.blinkCd <= 0) {
        data.blinkCd = 0.36;
        data.blinksDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(
              ctx.bounds.right - pad,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(
              ctx.bounds.bottom - pad,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.0),
            Math.cos(ang) * 290,
            Math.sin(ang) * 290,
            { isCrit: true, sourceKind: 'ability' },
          );
          const heal = Math.round(owner.maxHp * 0.04 * getHealMultiplier(owner));
          if (heal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + heal);
          ctx.spawnShockwave(
            target.x,
            target.y,
            120,
            '#a855f7',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.rendFired && state.elapsed >= 2.0) {
      data.rendFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#38bdf8',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SHADOW MARSHAL REND!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
