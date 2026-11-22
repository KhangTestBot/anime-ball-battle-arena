import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface FubukiUltimateData {
  vortexTicks: number;
  vortexCd: number;
  crushFired: boolean;
  flash: number;
}

export const fubukiUltimateHandler: UltimateHandler = {
  characterId: 'fubuki',
  title: 'HELLSTORM: PSYCHIC BLIZZARD!',
  subtitle:
    'Raises a Psychic Barrier with Esper Heal, whips up a jade Hellstorm vortex that shreds projectiles and pulls enemies in, and erupts with Hellstorm Crush!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.shieldColor = '#10b981';
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} ESPER HEAL`,
        '#34d399',
        'heal',
      );
    }

    const data: FubukiUltimateData = {
      vortexTicks: 0,
      vortexCd: 0.34,
      crushFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'HELLSTORM!!',
      '#34d399',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as FubukiUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Shred enemy projectiles caught in the Hellstorm vortex
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid || (owner.teamId && p.teamId === owner.teamId)) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= 160) {
        ctx.projectiles.splice(i, 1);
      }
    }

    if (!data.crushFired && data.vortexTicks < 3) {
      data.vortexCd -= dt;
      if (data.vortexCd <= 0) {
        data.vortexCd = 0.45;
        data.vortexTicks += 1;
        for (const e of ctx.getEnemies(owner)) {
          const dx = owner.x - e.x;
          const dy = owner.y - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 260;
          e.vy += (dy / dist) * 260;
          e.frostTimer = Math.max(e.frostTimer, 1.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.8), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          185,
          '#10b981',
          6,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.05 });
      }
    }

    if (!data.crushFired && state.elapsed >= 2.0) {
      data.crushFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.0),
          Math.cos(ang) * 530,
          Math.sin(ang) * 530,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        290,
        '#34d399',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HELLSTORM CRUSH!',
        '#34d399',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });
    }
  },
};
