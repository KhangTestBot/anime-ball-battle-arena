import type { UltimateHandler } from './types';

export interface EndeavorUltimateData {
  beamFired: boolean;
  beamAngle: number;
  beamFlash: number;
}

export const endeavorUltimateHandler: UltimateHandler = {
  characterId: 'endeavor',
  title: 'PLUS ULTRA: PROMINENCE BURN',
  subtitle:
    'Rockets into point-blank range with unstoppable flame thrust, then unleashes an arena-spanning Prominence Burn melting obstacles & shields!',
  bannerColor: '#f97316',
  castDuration: 0.25,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: EndeavorUltimateData = {
      beamFired: false,
      beamAngle: ang,
      beamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'PLUS ULTRA!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EndeavorUltimateData;
    if (data.beamFlash > 0) data.beamFlash = Math.max(0, data.beamFlash - dt);

    if (!data.beamFired && state.elapsed >= 1.15) {
      data.beamFired = true;
      data.beamFlash = 1.4;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.beamAngle;
      data.beamAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      // Melt all obstacles in the Prominence Burn corridor!
      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        const obs = ctx.obstacles[i];
        const px = obs.x - owner.x;
        const py = obs.y - owner.y;
        if (px * lx + py * ly >= -30 && Math.abs(px * ly - py * lx) <= 84) {
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 88) {
          e.shieldTimer = 0;
          e.burnTimer = Math.max(e.burnTimer, 4.2);
          e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 5.2));
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 23.0), lx * 520, ly * 520, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'PROMINENCE BURN!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
    }
  },
};
