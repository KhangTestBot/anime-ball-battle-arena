import type { UltimateHandler } from './types';

export interface UrarakaUltimateData {
  meteorsDone: number;
  meteorCd: number;
  releaseFired: boolean;
  flash: number;
}

export const urarakaUltimateHandler: UltimateHandler = {
  characterId: 'uraraka',
  title: 'ZERO GRAVITY AWAKENING: METEOR SHOWER!',
  subtitle:
    'Suspends all enemies in Zero Gravity (Airborne), rains down 3 meteor volleys, and triggers RELEASE! Meteor Shower Crash!',
  bannerColor: '#ec4899',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.6);
    for (const e of ctx.getEnemies(owner)) {
      e.airborneTimer = Math.max(e.airborneTimer, 1.2);
      e.stunTimer = Math.max(e.stunTimer, 0.85);
      e.stunKind = 'airborne';
    }

    const data: UrarakaUltimateData = {
      meteorsDone: 0,
      meteorCd: 0.3,
      releaseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ZERO GRAVITY: FLOAT!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as UrarakaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.releaseFired && data.meteorsDone < 3) {
      data.meteorCd -= dt;
      if (data.meteorCd <= 0) {
        data.meteorCd = 0.44;
        data.meteorsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('uraraka_rock'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'meteor',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 640,
            vy: Math.sin(a) * 640,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 215,
            color: '#ec4899',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.15 });
      }
    }

    if (!data.releaseFired && state.elapsed >= 2.0) {
      data.releaseFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#ec4899',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'RELEASE! METEOR SHOWER!!',
        '#ec4899',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
