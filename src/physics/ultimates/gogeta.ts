import type { UltimateHandler } from './types';

export interface GogetaUltimateData {
  stardustX: number;
  stardustY: number;
  stardustDetonated: boolean;
  beamFired: boolean;
  beamAngle: number;
  beamFlash: number;
}

export const gogetaUltimateHandler: UltimateHandler = {
  characterId: 'gogeta',
  title: 'STARDUST BREAKER · FULL-FORCE KAMEHAMEHA',
  subtitle:
    'Hurls the rainbow Soul Punisher orb erasing enemy projectiles & buffs, then fires a blinding blue-gold Full-Force Kamehameha across the arena!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.6);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 1.4);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: GogetaUltimateData = {
      stardustX: target ? target.x : (ctx.bounds.left + ctx.bounds.right) * 0.5,
      stardustY: target ? target.y : (ctx.bounds.top + ctx.bounds.bottom) * 0.5,
      stardustDetonated: false,
      beamFired: false,
      beamAngle: ang,
      beamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SOUL PUNISHER!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GogetaUltimateData;
    if (data.beamFlash > 0) data.beamFlash = Math.max(0, data.beamFlash - dt);

    // 1. Rainbow Stardust Breaker Detonation (0.9s): Erases enemy projectiles & strips shields/evade!
    if (!data.stardustDetonated && state.elapsed >= 0.9) {
      data.stardustDetonated = true;
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        data.stardustX = target.x;
        data.stardustY = target.y;
      }

      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        if (ctx.projectiles[i].ownerUid !== owner.uid) {
          ctx.projectiles.splice(i, 1);
        }
      }

      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - data.stardustX, e.y - data.stardustY) <= 210 + e.radius) {
          e.shieldTimer = 0;
          e.evadeTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 13.0), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        data.stardustX,
        data.stardustY,
        210,
        '#f472b6',
        6,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnParticles(data.stardustX, data.stardustY, 28, '#38bdf8', 90, 300, 3, 6.5, 'star');
      ctx.spawnParticles(data.stardustX, data.stardustY, 18, '#facc15', 80, 260, 3, 6, 'star');
      ctx.addScreenShake(12);
      ctx.emitSfx({ type: 'crit', intensity: 1.2 });
    }

    // 2. Climax (1.95s): FULL-FORCE KAMEHAMEHA!
    if (!data.beamFired && state.elapsed >= 1.95) {
      data.beamFired = true;
      data.beamFlash = 1.3;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.beamAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= -e.radius - 30 && perp <= e.radius + 76) {
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 21.0), lx * 520, ly * 520, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FULL-FORCE KAMEHAMEHA!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};
