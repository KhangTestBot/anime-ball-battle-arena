import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BigMomUltimateData {
  homieBursts: number;
  burstCd: number;
  maserFired: boolean;
  maserAngle: number;
  maserFlash: number;
}

export const bigmomUltimateHandler: UltimateHandler = {
  characterId: 'bigmom',
  title: 'SOUL POCUS: MASER CANNON!',
  subtitle:
    'Terrifies enemies with Life or Treat (Fear + Soul Heal + Enchanted Armor), unleashes 3 Prometheus & Hera bursts, and fires Maser Cannon!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} SOUL POCUS`,
        '#ec4899',
        'heal',
      );
    }
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'fear';
    }
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: BigMomUltimateData = {
      homieBursts: 0,
      burstCd: 0.34,
      maserFired: false,
      maserAngle: ang,
      maserFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'LIFE OR TREAT!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BigMomUltimateData;
    if (data.maserFlash > 0) data.maserFlash = Math.max(0, data.maserFlash - dt);

    if (!data.maserFired && data.homieBursts < 3) {
      data.burstCd -= dt;
      if (data.burstCd <= 0) {
        data.burstCd = 0.44;
        data.homieBursts += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.maserAngle = ang;
        for (const offset of [-0.2, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('bigmom_homie'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 620,
            vy: Math.sin(a) * 620,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 225,
            color: '#facc15',
            secondaryColor: '#ec4899',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.maserFired && state.elapsed >= 2.05) {
      data.maserFired = true;
      data.maserFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.paralyzeTimer = Math.max(e.paralyzeTimer, 2.5);
        e.burnTimer = Math.max(e.burnTimer, 4.0);
        e.burnDps = Math.max(e.burnDps, 9.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#facc15',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'MASER CANNON!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};
