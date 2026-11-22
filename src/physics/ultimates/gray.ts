import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface GrayUltimateData {
  arrowFired: boolean;
  arrowAngle: number;
  flash: number;
}

export const grayUltimateHandler: UltimateHandler = {
  characterId: 'gray',
  title: "ICE DEVIL'S ZEROTH DESTRUCTION BOW",
  subtitle:
    'Chills the arena freezing incoming projectiles, then fires a colossal demonic Ice Devil arrow shattering shields & deep-freezing foes!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 3.2);
    }

    const data: GrayUltimateData = {
      arrowFired: false,
      arrowAngle: ang,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'ICE DEVIL SLAYER!',
      '#7dd3fc',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GrayUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    // Freeze & shatter approaching enemy projectiles
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 78
      ) {
        ctx.spawnParticles(p.x, p.y, 6, '#bae6fd', 40, 120, 2.5, 5, 'shard');
        ctx.projectiles.splice(i, 1);
      }
    }

    if (!data.arrowFired && state.elapsed >= 1.25) {
      data.arrowFired = true;
      data.flash = 1.3;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.arrowAngle;
      data.arrowAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 82) {
          e.shieldTimer = 0;
          applyFighterStun(ctx, owner, e, 0.95, 'frozen', 'FROZEN SOLID!');
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.0), lx * 500, ly * 500, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'ZEROTH DESTRUCTION BOW!',
        '#bae6fd',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};
