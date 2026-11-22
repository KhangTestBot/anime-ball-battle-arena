import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BuuUltimateData {
  blastsDone: number;
  blastCd: number;
  regenCd: number;
  planetBurstFired: boolean;
  flash: number;
}

export const buuUltimateHandler: UltimateHandler = {
  characterId: 'buu',
  title: 'MAJIN REGENERATION: PLANET BURST!',
  subtitle:
    'Arms Majin Regeneration (Totem Revive + continuous healing), turns enemies into candy (Petrified), and drops a colossal Planet Burst!',
  bannerColor: '#f472b6',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} MAJIN REGEN`,
        '#f472b6',
        'heal',
      );
    }
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.9);
      e.stunKind = 'petrified';
    }

    const data: BuuUltimateData = {
      blastsDone: 0,
      blastCd: 0.32,
      regenCd: 0.65,
      planetBurstFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f472b6', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'TURN INTO CANDY!!',
      '#f472b6',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BuuUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    data.regenCd -= dt;
    if (data.regenCd <= 0) {
      data.regenCd = 0.7;
      const tickHeal = Math.round(owner.maxHp * 0.04 * getHealMultiplier(owner));
      if (tickHeal > 0) owner.hp = Math.min(owner.maxHp, owner.hp + tickHeal);
    }

    if (!data.planetBurstFired && data.blastsDone < 3) {
      data.blastCd -= dt;
      if (data.blastCd <= 0) {
        data.blastCd = 0.44;
        data.blastsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('buu_ki'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 630,
            vy: Math.sin(a) * 630,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 210,
            color: '#f472b6',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.planetBurstFired && state.elapsed >= 2.05) {
      data.planetBurstFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#f472b6',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'PLANET BURST!!',
        '#f472b6',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
