import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BaekYunhoUltimateData {
  pouncesDone: number;
  pounceCd: number;
  roarFired: boolean;
  flash: number;
}

export const baekYunhoUltimateHandler: UltimateHandler = {
  characterId: 'baek_yunho',
  title: 'BEAST TRANSFORMATION: WHITE TIGER KING!',
  subtitle:
    'Unleashes White Tiger form (+18% DMG, Beast Heal & Unstoppable), chains 4 armor-shredding Tiger Claw pounces, and erupts with White Tiger Roar!',
  bannerColor: '#f59e0b',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} BEAST FORM`,
        '#f59e0b',
        'heal',
      );
    }

    const data: BaekYunhoUltimateData = {
      pouncesDone: 0,
      pounceCd: 0.28,
      roarFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'WHITE TIGER TRANSFORMATION!',
      '#f8fafc',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BaekYunhoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.roarFired && data.pouncesDone < 4) {
      data.pounceCd -= dt;
      if (data.pounceCd <= 0) {
        data.pounceCd = 0.36;
        data.pouncesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 650;
          owner.vy = Math.sin(ang) * 650;
          target.armorShredTimer = Math.max(target.armorShredTimer, 3.2);
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 8.8),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            120,
            '#f8fafc',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.roarFired && state.elapsed >= 2.0) {
      data.roarFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'fear';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        295,
        '#f59e0b',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'WHITE TIGER ROAR!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
