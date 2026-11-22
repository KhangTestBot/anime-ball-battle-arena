import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface OrochiOpmUltimateData {
  dragonBursts: number;
  burstCd: number;
  gaiaFired: boolean;
  gaiaAngle: number;
  gaiaFlash: number;
}

export const orochiOpmUltimateHandler: UltimateHandler = {
  characterId: 'orochi_opm',
  title: 'GAIA CANNON: MONSTER KING!',
  subtitle:
    'Siphons magma from Earth core (+18% DMG & Monster Regen), fires 4 Dragon-Serpent flame bursts, and unleashes the cataclysmic Gaia Cannon!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} CORE SIPHON`,
        '#f59e0b',
        'heal',
      );
    }

    const data: OrochiOpmUltimateData = {
      dragonBursts: 0,
      burstCd: 0.3,
      gaiaFired: false,
      gaiaAngle: owner.facingAngle,
      gaiaFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'MONSTER KING OROCHI!',
      '#f59e0b',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as OrochiOpmUltimateData;
    if (data.gaiaFlash > 0) data.gaiaFlash = Math.max(0, data.gaiaFlash - dt);

    if (!data.gaiaFired && data.dragonBursts < 4) {
      data.burstCd -= dt;
      if (data.burstCd <= 0) {
        data.burstCd = 0.36;
        data.dragonBursts += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.gaiaAngle = ang;
        for (const offset of [-0.2, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('orochi_flame'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 610,
            vy: Math.sin(a) * 610,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 210,
            color: '#dc2626',
            secondaryColor: '#f59e0b',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      }
    }

    if (!data.gaiaFired && state.elapsed >= 2.1) {
      data.gaiaFired = true;
      data.gaiaFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        345,
        '#f59e0b',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GAIA CANNON!!',
        '#dc2626',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });
    }
  },
};
