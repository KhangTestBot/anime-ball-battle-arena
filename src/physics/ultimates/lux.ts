import type { UltimateHandler } from './types';

export interface LuxUltimateData {
  orbsDone: number;
  orbCd: number;
  sparkFired: boolean;
  sparkAngle: number;
  sparkFlash: number;
}

export const luxUltimateHandler: UltimateHandler = {
  characterId: 'lux',
  title: 'FINAL SPARK (R): DEMACIA!',
  subtitle:
    'Roots foes with Light Binding + Prismatic Barrier, fires 3 Lucent Singularity volleys, and blasts a screen-wide Final Spark laser!',
  bannerColor: '#facc15',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.shieldColor = '#facc15';
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 0.85);
      e.stunKind = 'chained';
    }
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: LuxUltimateData = {
      orbsDone: 0,
      orbCd: 0.34,
      sparkFired: false,
      sparkAngle: ang,
      sparkFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 26, 'DEMACIA!!', '#facc15', 'powerup');
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LuxUltimateData;
    if (data.sparkFlash > 0) data.sparkFlash = Math.max(0, data.sparkFlash - dt);

    if (!data.sparkFired && data.orbsDone < 3) {
      data.orbCd -= dt;
      if (data.orbCd <= 0) {
        data.orbCd = 0.44;
        data.orbsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.sparkAngle = ang;
        for (const offset of [-0.16, 0, 0.16]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('lux_lucent'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 190,
            color: '#facc15',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      }
    }

    if (!data.sparkFired && state.elapsed >= 2.0) {
      data.sparkFired = true;
      data.sparkFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'FINAL SPARK!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};
