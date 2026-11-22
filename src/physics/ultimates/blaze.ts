import type { UltimateHandler } from './types';

export interface BlazeUltimateData {
  rodAngle: number;
  volleysFired: number;
  volleyCd: number;
  ringFired: boolean;
  flash: number;
}

export const blazeUltimateHandler: UltimateHandler = {
  characterId: 'blaze',
  title: 'NETHER FORTRESS: BLAZE FIREBALL INFERNO',
  subtitle:
    'Spins golden Blaze Rods shielding Blaze, fires 3 triple-burst Fireball volleys scorching targets, then erupts a Nether Ignition Ring!',
  bannerColor: '#f59e0b',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 2.8);
    owner.shieldColor = '#f59e0b';
    const data: BlazeUltimateData = {
      rodAngle: 0,
      volleysFired: 0,
      volleyCd: 0.32,
      ringFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'BLAZE INFERNO!',
      '#fbbf24',
      'powerup',
    );
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BlazeUltimateData;
    data.rodAngle += dt * 10;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.ringFired && data.volleysFired < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.45;
        data.volleysFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;
        for (let k = -1; k <= 1; k++) {
          const a = baseAng + k * 0.2;
          ctx.projectiles.push({
            id: ctx.nextId('blaze_fb'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x,
            y: owner.y,
            vx: Math.cos(a) * 560,
            vy: Math.sin(a) * 560,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.4),
            knockback: 180,
            color: '#f97316',
            secondaryColor: '#fef08a',
            angle: a,
            life: 1.6,
            maxLife: 1.6,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.05 });
      }
    }

    if (!data.ringFired && state.elapsed >= 1.95) {
      data.ringFired = true;
      data.flash = 1.2;
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 260 + e.radius) {
          e.shieldTimer = 0;
          e.burnTimer = Math.max(e.burnTimer, 4.0);
          e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 4.8));
          e.burnOwnerUid = owner.uid;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 19.5), 0, 0, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        265,
        '#f97316',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'NETHER IGNITION!',
        '#fde047',
        'crit',
      );
      ctx.addScreenShake(14);
      ctx.emitSfx({ type: 'crit', intensity: 1.25 });
    }
  },
};
