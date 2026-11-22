import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface NatsuUltimateData {
  flamesEaten: number;
  fistDetonated: boolean;
  fistX: number;
  fistY: number;
  fistFlash: number;
}

export const natsuUltimateHandler: UltimateHandler = {
  characterId: 'natsu',
  title: "FIRE DRAGON KING'S DEMOLITION FIST",
  subtitle:
    'Eats incoming enemy projectiles to heal & stack Dragon Slayer power, then rockets forward in an unstoppable Demolition Fist melting obstacles & shields!',
  bannerColor: '#f97316',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const data: NatsuUltimateData = {
      flamesEaten: 0,
      fistDetonated: false,
      fistX: owner.x,
      fistY: owner.y,
      fistFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#f97316',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      "I'M ALL FIRED UP!",
      '#fb923c',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NatsuUltimateData;
    if (data.fistFlash > 0) data.fistFlash = Math.max(0, data.fistFlash - dt);

    // 1. Dragon Slayer Consumption: Eat enemy projectiles within 95px -> Heal + +8% DMG!
    if (!data.fistDetonated) {
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 95
        ) {
          ctx.projectiles.splice(i, 1);
          data.flamesEaten += 1;
          owner.dmgBonusPct += 8;
          const heal = Math.round(owner.maxHp * 0.04 * getHealMultiplier(owner));
          if (heal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + heal);
          ctx.spawnParticles(p.x, p.y, 8, '#facc15', 45, 140, 2.5, 5, 'circle');
          ctx.spawnFloatingText(
            owner.x,
            owner.y - owner.radius - 14,
            'ATE FLAMES! +DMG',
            '#fde047',
            'heal',
          );
        }
      }
    }

    // 2. Climax (1.65s): FIRE DRAGON KING'S DEMOLITION FIST!
    if (!data.fistDetonated && state.elapsed >= 1.65) {
      data.fistDetonated = true;
      data.fistFlash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      const tx = target ? target.x : owner.x;
      const ty = target ? target.y : owner.y;
      const ang = Math.atan2(ty - owner.y, tx - owner.x);

      if (target) {
        owner.x = Math.max(
          ctx.bounds.left + owner.radius,
          Math.min(
            ctx.bounds.right - owner.radius,
            target.x - Math.cos(ang) * (owner.radius + target.radius + 4),
          ),
        );
        owner.y = Math.max(
          ctx.bounds.top + owner.radius,
          Math.min(
            ctx.bounds.bottom - owner.radius,
            target.y - Math.sin(ang) * (owner.radius + target.radius + 4),
          ),
        );
      }
      data.fistX = tx;
      data.fistY = ty;

      // Melt nearby obstacles!
      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(ctx.obstacles[i].x - tx, ctx.obstacles[i].y - ty) <= 190) {
          ctx.obstacles.splice(i, 1);
        }
      }

      const dmg = ctx.getEffectiveDamage(owner, 21.0 + data.flamesEaten * 3.0);
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - tx, e.y - ty) <= 215 + e.radius) {
          e.shieldTimer = 0;
          e.burnTimer = Math.max(e.burnTimer, 4.0);
          e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 4.8));
          e.burnOwnerUid = owner.uid;
          const knockAng = Math.atan2(e.y - ty, e.x - tx);
          ctx.applyDamage(owner, e, dmg, Math.cos(knockAng) * 560, Math.sin(knockAng) * 560, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(tx, ty, 245, '#f97316', 9, owner.character.id, owner.character.series);
      ctx.spawnParticles(tx, ty, 38, '#facc15', 110, 380, 3.5, 7.5, 'circle');
      ctx.spawnFloatingText(tx, ty - 28, 'DEMOLITION FIST!!', '#facc15', 'crit');
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};
