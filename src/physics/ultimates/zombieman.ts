import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface ZombiemanUltimateData {
  volleysFired: number;
  volleyCd: number;
  regenCd: number;
  execFired: boolean;
  flash: number;
}

export const zombiemanUltimateHandler: UltimateHandler = {
  characterId: 'zombieman',
  title: 'IMMORTAL REGENERATION: ENDLESS ASSAULT!',
  subtitle:
    'Arms Immortal Body (Totem revive + continuous HP regen), empties 4 high-caliber pistol volleys, and finishes with a point-blank Machete & Axe Execution!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} IMMORTAL`,
        '#4ade80',
        'heal',
      );
    }

    const data: ZombiemanUltimateData = {
      volleysFired: 0,
      volleyCd: 0.28,
      regenCd: 0.65,
      execFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'IMMORTAL REGEN!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZombiemanUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Continuous regeneration ticks
    data.regenCd -= dt;
    if (data.regenCd <= 0) {
      data.regenCd = 0.7;
      const tickHeal = Math.round(owner.maxHp * 0.04 * getHealMultiplier(owner));
      if (tickHeal > 0) {
        owner.hp = Math.min(owner.maxHp, owner.hp + tickHeal);
      }
    }

    if (!data.execFired && data.volleysFired < 4) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.36;
        data.volleysFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.12, 0.12]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('zombieman_shot'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 8),
            y: owner.y + Math.sin(a) * (owner.radius + 8),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 7,
            damage: ctx.getEffectiveDamage(owner, 6.8),
            knockback: 185,
            color: '#94a3b8',
            secondaryColor: '#dc2626',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.05 });
      }
    }

    if (!data.execFired && state.elapsed >= 2.05) {
      data.execFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 3.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.5),
          Math.cos(ang) * 490,
          Math.sin(ang) * 490,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        265,
        '#dc2626',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'AXE EXECUTION!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
