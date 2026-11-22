import type { UltimateHandler } from './types';

export interface MerlinSdsUltimateData {
  orbsDone: number;
  orbCd: number;
  rayFired: boolean;
  rayAngle: number;
  rayFlash: number;
}

export const merlinSdsUltimateHandler: UltimateHandler = {
  characterId: 'merlin_sds',
  title: 'INFINITY: PERFECT CUBE & EXTERMINATE RAY!',
  subtitle:
    'Seals self in Perfect Cube (Invulnerable + Shield), silences foes with 3 Absolute Cancel orbs, and fires Exterminate Ray!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.2);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.8);
    owner.shieldColor = '#a855f7';
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 2.4);
    }
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: MerlinSdsUltimateData = {
      orbsDone: 0,
      orbCd: 0.32,
      rayFired: false,
      rayAngle: ang,
      rayFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'PERFECT CUBE: INFINITY!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MerlinSdsUltimateData;
    if (data.rayFlash > 0) data.rayFlash = Math.max(0, data.rayFlash - dt);

    if (!data.rayFired && data.orbsDone < 3) {
      data.orbCd -= dt;
      if (data.orbCd <= 0) {
        data.orbCd = 0.44;
        data.orbsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.rayAngle = ang;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('merlin_orb'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 200,
            color: '#a855f7',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.rayFired && state.elapsed >= 2.05) {
      data.rayFired = true;
      data.rayFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.silenceTimer = Math.max(e.silenceTimer, 2.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        330,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'EXTERMINATE RAY!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};
