import type { UltimateHandler } from './types';

export interface GildartsUltimateData {
  crushedObjects: number;
  empyreanFired: boolean;
  impactX: number;
  impactY: number;
  flash: number;
}

export const gildartsUltimateHandler: UltimateHandler = {
  characterId: 'gildarts',
  title: 'CRASH MAGIC: ALL CRUSH · EMPYREAN',
  subtitle:
    'Disassembles all obstacles & enemy projectiles into harmless cubes, shreds enemy armor, then launches a sky-shattering Empyrean punch!',
  bannerColor: '#f59e0b',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    let crushed = 0;
    for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
      const obs = ctx.obstacles[i];
      ctx.spawnParticles(obs.x, obs.y, 12, '#f59e0b', 60, 200, 3, 6, 'pixel');
      ctx.obstacles.splice(i, 1);
      crushed += 1;
    }
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      if (ctx.projectiles[i].ownerUid !== owner.uid) {
        ctx.spawnParticles(
          ctx.projectiles[i].x,
          ctx.projectiles[i].y,
          6,
          '#fbbf24',
          45,
          140,
          2.5,
          5,
          'pixel',
        );
        ctx.projectiles.splice(i, 1);
        crushed += 1;
      }
    }

    const data: GildartsUltimateData = {
      crushedObjects: crushed,
      empyreanFired: false,
      impactX: owner.x,
      impactY: owner.y,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'CRASH MAGIC: ALL CRUSH!',
      '#fde047',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'crit', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GildartsUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.empyreanFired && state.elapsed >= 1.35) {
      data.empyreanFired = true;
      data.flash = 1.3;
      const target = ctx.getNearestEnemy(owner);
      const tx = target ? target.x : owner.x;
      const ty = target ? target.y : owner.y;
      data.impactX = tx;
      data.impactY = ty;

      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - tx, e.y - ty) <= 235 + e.radius) {
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
          const ang = Math.atan2(e.y - ty, e.x - tx);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 23.5),
            Math.cos(ang) * 620,
            Math.sin(ang) * 620,
            {
              isCrit: true,
              bypassInvuln: true,
              sourceKind: 'ability',
            },
          );
        }
      }
      ctx.spawnShockwave(tx, ty, 260, '#f59e0b', 9, owner.character.id, owner.character.series);
      ctx.spawnParticles(tx, ty, 36, '#fde047', 100, 360, 3.5, 7.5, 'pixel');
      ctx.spawnFloatingText(tx, ty - 28, 'EMPYREAN!!', '#fef08a', 'crit');
      ctx.addScreenShake(18);
      ctx.addHitstop(0.075);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
