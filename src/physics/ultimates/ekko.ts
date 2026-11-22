import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface EkkoUltimateData {
  windersDone: number;
  winderCd: number;
  chronobreakFired: boolean;
  flash: number;
}

export const ekkoUltimateHandler: UltimateHandler = {
  characterId: 'ekko',
  title: 'CHRONOBREAK (R): 4 SECONDS BACK!',
  subtitle:
    'Arms Z-Drive Rewind (Totem Revive + Time Heal), throws 3 Timewinder boomerangs, and detonates Chronobreak freezing enemies in time!',
  bannerColor: '#22d3ee',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.invulnTimer = Math.max(owner.invulnTimer, 1.2);
    const heal = Math.round(owner.maxHp * 0.16 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} Z-DRIVE REWIND`,
        '#22d3ee',
        'heal',
      );
    }

    const data: EkkoUltimateData = {
      windersDone: 0,
      winderCd: 0.3,
      chronobreakFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22d3ee', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SHATTER TIME!!',
      '#22d3ee',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EkkoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.chronobreakFired && data.windersDone < 3) {
      data.winderCd -= dt;
      if (data.winderCd <= 0) {
        data.winderCd = 0.44;
        data.windersDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        ctx.projectiles.push({
          id: ctx.nextId('ekko_q'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'boomerang',
          x: owner.x + Math.cos(ang) * (owner.radius + 10),
          y: owner.y + Math.sin(ang) * (owner.radius + 10),
          vx: Math.cos(ang) * 620,
          vy: Math.sin(ang) * 620,
          radius: 13,
          damage: ctx.getEffectiveDamage(owner, 9.2),
          knockback: 190,
          color: '#22d3ee',
          secondaryColor: '#facc15',
          angle: ang,
          life: 1.5,
          maxLife: 1.5,
          piercing: true,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.chronobreakFired && state.elapsed >= 2.05) {
      data.chronobreakFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'time-stop';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#22d3ee',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CHRONOBREAK!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};
