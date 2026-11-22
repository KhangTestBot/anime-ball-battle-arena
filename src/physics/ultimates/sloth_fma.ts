import type { UltimateHandler } from './types';

export interface SlothFmaUltimateData {
  ramsDone: number;
  ramCd: number;
  impactFired: boolean;
  flash: number;
}

export const slothFmaUltimateHandler: UltimateHandler = {
  characterId: 'sloth_fma',
  title: 'FASTEST HOMUNCULUS: SUPERSONIC BULLDOZER!',
  subtitle:
    'Unstoppable juggernaut (Enchanted Armor + Unstoppable), rams across the arena 3 times at supersonic speed, and crashes with Juggernaut Impact!',
  bannerColor: '#64748b',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);

    const data: SlothFmaUltimateData = {
      ramsDone: 0,
      ramCd: 0.3,
      impactFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'WHAT A PAIN... FULL SPEED!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'wall', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SlothFmaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.impactFired && data.ramsDone < 3) {
      data.ramCd -= dt;
      if (data.ramCd <= 0) {
        data.ramCd = 0.44;
        data.ramsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 780;
          owner.vy = Math.sin(ang) * 780;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.6),
            Math.cos(ang) * 460,
            Math.sin(ang) * 460,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.25 });
        }
      }
    }

    if (!data.impactFired && state.elapsed >= 2.0) {
      data.impactFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#64748b',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SUPERSONIC BULLDOZER IMPACT!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
