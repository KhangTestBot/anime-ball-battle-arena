import type { UltimateHandler } from './types';

export interface ZhongliUltimateData {
  pulsesDone: number;
  pulseCd: number;
  meteorDropped: boolean;
  targetX: number;
  targetY: number;
  meteorFlash: number;
}

export const zhongliUltimateHandler: UltimateHandler = {
  characterId: 'zhongli',
  title: 'PLANET BEFALL: I WILL HAVE ORDER!',
  subtitle:
    'Raises an unbreakable Jade Shield (Shield + Enchanted Armor + Unstoppable), resonates 3 Stone Stele pulses, and drops a colossal Geo Meteor petrifying all foes!',
  bannerColor: '#f59e0b',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 4.0);
    owner.shieldColor = '#f59e0b';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 4.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 4.0);

    const cx = (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) * 0.5;

    const data: ZhongliUltimateData = {
      pulsesDone: 0,
      pulseCd: 0.34,
      meteorDropped: false,
      targetX: cx,
      targetY: cy,
      meteorFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'I WILL HAVE ORDER!!',
      '#f59e0b',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZhongliUltimateData;
    if (data.meteorFlash > 0) data.meteorFlash = Math.max(0, data.meteorFlash - dt);

    const target = ctx.getNearestEnemy(owner);
    if (target && !data.meteorDropped) {
      data.targetX = target.x;
      data.targetY = target.y;
    }

    if (!data.meteorDropped && data.pulsesDone < 3) {
      data.pulseCd -= dt;
      if (data.pulseCd <= 0) {
        data.pulseCd = 0.45;
        data.pulsesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.6), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          220,
          '#f59e0b',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'wall', intensity: 1.15 });
      }
    }

    if (!data.meteorDropped && state.elapsed >= 2.1) {
      data.meteorDropped = true;
      data.meteorFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.4);
        e.stunKind = 'petrified';
        const ang = Math.atan2(e.y - data.targetY, e.x - data.targetX);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        data.targetX,
        data.targetY,
        355,
        '#d97706',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(data.targetX, data.targetY - 26, 'PLANET BEFALL!!', '#f59e0b', 'crit');
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
