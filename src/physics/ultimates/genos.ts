import type { UltimateHandler } from './types';

export interface GenosUltimateData {
  salvosFired: number;
  salvoCd: number;
  beamFired: boolean;
  beamAngle: number;
  beamFlash: number;
}

export const genosUltimateHandler: UltimateHandler = {
  characterId: 'genos',
  title: 'TRUE SPIRAL INCINERATION CANNON!',
  subtitle:
    'Overdrives Twin-Core (+16% DMG), blasts 3 Machine Gun plasma salvos, and unleashes a screen-splitting Spiral Incineration Beam!',
  bannerColor: '#f97316',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: GenosUltimateData = {
      salvosFired: 0,
      salvoCd: 0.35,
      beamFired: false,
      beamAngle: ang,
      beamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'INCINERATE!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GenosUltimateData;
    if (data.beamFlash > 0) data.beamFlash = Math.max(0, data.beamFlash - dt);

    if (!data.beamFired && data.salvosFired < 3) {
      data.salvoCd -= dt;
      if (data.salvoCd <= 0) {
        data.salvoCd = 0.42;
        data.salvosFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;
        data.beamAngle = baseAng;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = baseAng + offset;
          ctx.projectiles.push({
            id: ctx.nextId('genos_plasma'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 8),
            y: owner.y + Math.sin(a) * (owner.radius + 8),
            vx: Math.cos(a) * 640,
            vy: Math.sin(a) * 640,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 180,
            color: '#f97316',
            secondaryColor: '#fef08a',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.05 });
      }
    }

    if (!data.beamFired && state.elapsed >= 1.95) {
      data.beamFired = true;
      data.beamFlash = 1.35;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.beamAngle;
      data.beamAngle = ang;
      const dx = Math.cos(ang);
      const dy = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const rx = e.x - owner.x;
        const ry = e.y - owner.y;
        const proj = rx * dx + ry * dy;
        const perp = Math.abs(rx * -dy + ry * dx);
        if (proj >= -30 || perp <= 150) {
          e.shieldTimer = 0;
          e.burnTimer = Math.max(e.burnTimer, 4.0);
          e.burnDps = Math.max(e.burnDps, 8.5);
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 24.0), dx * 580, dy * 580, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        300,
        '#f97316',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'SPIRAL INCINERATION!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
    }
  },
};
