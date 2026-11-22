import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface KingSdsUltimateData {
  increaseVolleys: number;
  increaseCd: number;
  sunflowerFired: boolean;
  sunflowerAngle: number;
  sunflowerFlash: number;
}

export const kingSdsUltimateHandler: UltimateHandler = {
  characterId: 'king_sds',
  title: 'TRUE SPIRIT SPEAR CHASTIEFOL: SUNFLOWER!',
  subtitle:
    'Pollen Garden Barrier + Heal, unleashes 4 volleys of Form 5 Increase daggers, and blasts Form 4 Sunflower solar beam!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#10b981';
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} POLLEN GARDEN`,
        '#4ade80',
        'heal',
      );
    }
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: KingSdsUltimateData = {
      increaseVolleys: 0,
      increaseCd: 0.28,
      sunflowerFired: false,
      sunflowerAngle: ang,
      sunflowerFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'CHASTIEFOL: INCREASE!!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KingSdsUltimateData;
    if (data.sunflowerFlash > 0) data.sunflowerFlash = Math.max(0, data.sunflowerFlash - dt);

    if (!data.sunflowerFired && data.increaseVolleys < 4) {
      data.increaseCd -= dt;
      if (data.increaseCd <= 0) {
        data.increaseCd = 0.36;
        data.increaseVolleys += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.sunflowerAngle = ang;
        for (const offset of [-0.24, -0.08, 0.08, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('king_dagger'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 185,
            color: '#10b981',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.sunflowerFired && state.elapsed >= 2.05) {
      data.sunflowerFired = true;
      data.sunflowerFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'FOURTH FORM: SUNFLOWER!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};
