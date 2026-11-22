import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface GajeelUltimateData {
  ironEaten: number;
  swordSlammed: boolean;
  slamX: number;
  slamY: number;
  flash: number;
}

export const gajeelUltimateHandler: UltimateHandler = {
  characterId: 'gajeel',
  title: 'IRON SHADOW DRAGON: KARMA DEMON IRON GOD SWORD',
  subtitle:
    'Consumes enemy projectiles to heal & reinforce Iron Scales, slips through untargetable shadows, then slams the giant Iron God Sword!',
  bannerColor: '#64748b',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.2);
    owner.untargetableTimer = Math.max(owner.untargetableTimer, 0.55);

    const data: GajeelUltimateData = {
      ironEaten: 0,
      swordSlammed: false,
      slamX: owner.x,
      slamY: owner.y,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#64748b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'IRON SHADOW DRAGON!',
      '#cbd5e1',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GajeelUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Iron Dragon Slayer consumption of enemy projectiles!
    if (!data.swordSlammed) {
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 90
        ) {
          ctx.projectiles.splice(i, 1);
          data.ironEaten += 1;
          const heal = Math.round(owner.maxHp * 0.045 * getHealMultiplier(owner));
          if (heal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + heal);
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 14,
            'ATE IRON! +HP',
            '#cbd5e1',
            'heal',
          );
        }
      }
    }

    if (!data.swordSlammed && state.elapsed >= 1.65) {
      data.swordSlammed = true;
      data.flash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      const sx = target ? target.x : owner.x;
      const sy = target ? target.y : owner.y;
      data.slamX = sx;
      data.slamY = sy;

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(ctx.obstacles[i].x - sx, ctx.obstacles[i].y - sy) <= 210) {
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - sx, e.y - sy) <= 215 + e.radius) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 21.0 + data.ironEaten * 2.5),
            0,
            0,
            {
              isCrit: true,
              bypassInvuln: true,
              sourceKind: 'ability',
            },
          );
        }
      }
      ctx.spawnShockwave(sx, sy, 235, '#94a3b8', 9, owner.character.id, owner.character.series);
      ctx.spawnFloatingText(sx, sy - 26, 'IRON GOD SWORD!', '#e2e8f0', 'crit');
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
