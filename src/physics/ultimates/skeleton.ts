import type { UltimateHandler } from './types';

export interface SkeletonUltimateData {
  volleysFired: number;
  volleyCd: number;
  spectralFired: boolean;
  spectralAngle: number;
  flash: number;
}

export const skeletonUltimateHandler: UltimateHandler = {
  characterId: 'skeleton',
  title: 'POWER V · PUNCH II · SPECTRAL SNIPER BARRAGE',
  subtitle:
    'Fires 4 rapid Punch II Knockback Arrow fans pushing enemies back, finishing with a piercing golden Spectral Arrow locking dodge!',
  bannerColor: '#e2e8f0',
  castDuration: 0.22,
  duration: 3.7,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    const data: SkeletonUltimateData = {
      volleysFired: 0,
      volleyCd: 0.25,
      spectralFired: false,
      spectralAngle: ang,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#e2e8f0', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'POWER V BARRAGE!',
      '#f8fafc',
      'powerup',
    );
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SkeletonUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.spectralFired && data.volleysFired < 4) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.38;
        data.volleysFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;
        for (let k = -1; k <= 1; k++) {
          const a = baseAng + k * 0.18;
          ctx.projectiles.push({
            id: ctx.nextId('skel_arr'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x,
            y: owner.y,
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 8,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 310,
            color: '#f8fafc',
            secondaryColor: '#f97316',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.0 });
      }
    }

    if (!data.spectralFired && state.elapsed >= 2.0) {
      data.spectralFired = true;
      data.flash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.spectralAngle;
      data.spectralAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 78) {
          e.shieldTimer = 0;
          e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 20.5), lx * 520, ly * 520, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SPECTRAL SNIPE!',
        '#fde047',
        'crit',
      );
      ctx.addScreenShake(14);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
    }
  },
};
