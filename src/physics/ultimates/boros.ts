import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface BorosUltimateData {
  kicksDone: number;
  kickCd: number;
  cannonFired: boolean;
  cannonAngle: number;
  cannonFlash: number;
}

export const borosUltimateHandler: UltimateHandler = {
  characterId: 'boros',
  title: 'METEORIC BURST: COLLAPSING STAR!',
  subtitle:
    'Ignites Meteoric Burst (+22% DMG & Alien Regen), chains 3 Moon-Kick blitzes, and fires the planet-busting Collapsing Star Roaring Cannon!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.5);
    const heal = Math.round(owner.maxHp * 0.14 * getHealMultiplier(owner));
    if (heal > 0) {
      owner.hp = Math.min(owner.maxHp, owner.hp + heal);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${heal} REGEN`,
        '#f472b6',
        'heal',
      );
    }

    const data: BorosUltimateData = {
      kicksDone: 0,
      kickCd: 0.34,
      cannonFired: false,
      cannonAngle: owner.facingAngle,
      cannonFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'METEORIC BURST!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BorosUltimateData;
    if (data.cannonFlash > 0) data.cannonFlash = Math.max(0, data.cannonFlash - dt);

    if (!data.cannonFired && data.kicksDone < 3) {
      data.kickCd -= dt;
      if (data.kickCd <= 0) {
        data.kickCd = 0.44;
        data.kicksDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          data.cannonAngle = ang;
          owner.vx = Math.cos(ang) * 760;
          owner.vy = Math.sin(ang) * 760;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 10.2),
            Math.cos(ang) * 460,
            Math.sin(ang) * 460,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            140,
            '#38bdf8',
            7,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'dodge', intensity: 1.25 });
        }
      }
    }

    if (!data.cannonFired && state.elapsed >= 2.05) {
      data.cannonFired = true;
      data.cannonFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#ec4899',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'COLLAPSING STAR ROARING CANNON!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });
    }
  },
};
