import { applyFighterStun, getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface DariusUltimateData {
  decimated: boolean;
  dunked: boolean;
  dunkX: number;
  dunkY: number;
  dunkFlash: number;
  spinAngle: number;
}

export const dariusUltimateHandler: UltimateHandler = {
  characterId: 'darius',
  title: 'NOXIAN GUILLOTINE · 5-STACK HEMORRHAGE',
  subtitle:
    'Apprehends foes inward, spins Decimate to heal and inflict 5-stack Hemorrhage bleed, then leaps for a shield-shattering Noxian Guillotine dunk!',
  bannerColor: '#b91c1c',
  castDuration: 0.24,
  duration: 3.5,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    const target = ctx.getNearestEnemy(owner);

    // Apprehend pull!
    for (const e of ctx.getEnemies(owner)) {
      const dx = owner.x - e.x;
      const dy = owner.y - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      if (d <= 290) {
        e.vx += (dx / d) * 340;
        e.vy += (dy / d) * 340;
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
      }
    }

    const data: DariusUltimateData = {
      decimated: false,
      dunked: false,
      dunkX: target ? target.x : owner.x,
      dunkY: target ? target.y : owner.y,
      dunkFlash: 0,
      spinAngle: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#b91c1c', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'NOXIAN MIGHT!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DariusUltimateData;
    data.spinAngle += dt * 13;
    if (data.dunkFlash > 0) data.dunkFlash = Math.max(0, data.dunkFlash - dt);

    // 1. Decimate Axe Spin (0.75s): 5-Stack Hemorrhage + Healing!
    if (!data.decimated && state.elapsed >= 0.75) {
      data.decimated = true;
      let hitCount = 0;
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 215 + e.radius) {
          hitCount += 1;
          e.burnTimer = Math.max(e.burnTimer, 3.6);
          e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 4.4));
          e.burnOwnerUid = owner.uid;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 10.5), 0, 0, {
            sourceKind: 'ability',
          });
        }
      }
      if (hitCount > 0) {
        const heal = Math.round(
          owner.maxHp * Math.min(0.24, hitCount * 0.1) * getHealMultiplier(owner),
        );
        if (heal > 0) {
          owner.hp = Math.min(owner.maxHp, owner.hp + heal);
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 16,
            `+${heal} DECIMATE`,
            '#4ade80',
            'heal',
          );
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        210,
        '#dc2626',
        6,
        owner.character.id,
        owner.character.series,
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.25 });
    }

    // 2. Climax (1.7s): NOXIAN GUILLOTINE DUNK!
    if (!data.dunked && state.elapsed >= 1.7) {
      data.dunked = true;
      data.dunkFlash = 1.2;
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
        owner.x = Math.max(
          ctx.bounds.left + owner.radius,
          Math.min(
            ctx.bounds.right - owner.radius,
            target.x - Math.cos(ang) * (owner.radius + target.radius + 6),
          ),
        );
        owner.y = Math.max(
          ctx.bounds.top + owner.radius,
          Math.min(
            ctx.bounds.bottom - owner.radius,
            target.y - Math.sin(ang) * (owner.radius + target.radius + 6),
          ),
        );
        data.dunkX = target.x;
        data.dunkY = target.y;

        // Shatter obstacles around the dunk impact
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - target.x, ctx.obstacles[i].y - target.y) <= 165) {
            ctx.obstacles.splice(i, 1);
          }
        }

        target.shieldTimer = 0;
        const missingRatio = Math.max(0, 1 - target.hp / Math.max(1, target.maxHp));
        const dunkDmg = ctx.getEffectiveDamage(owner, 18.5 + missingRatio * 14);
        ctx.applyDamage(owner, target, dunkDmg, Math.cos(ang) * 440, Math.sin(ang) * 440, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
        applyFighterStun(ctx, owner, target, 0.75, 'chained', 'GUILLOTINED!');
        ctx.spawnShockwave(
          target.x,
          target.y,
          220,
          '#b91c1c',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(target.x, target.y, 34, '#ef4444', 100, 340, 3, 7, 'shard');
        ctx.spawnFloatingText(
          target.x,
          target.y - target.radius - 28,
          'NOXIAN GUILLOTINE!',
          '#facc15',
          'crit',
        );
        ctx.addScreenShake(16);
        ctx.addHitstop(0.07);
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });
      }
    }
  },
};
