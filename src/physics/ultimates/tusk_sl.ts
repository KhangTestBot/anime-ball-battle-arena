import type { UltimateHandler } from './types';

export interface TuskSlUltimateData {
  barragesDone: number;
  barrageCd: number;
  dragonFired: boolean;
  dragonAngle: number;
  dragonFlash: number;
}

export const tuskSlUltimateHandler: UltimateHandler = {
  characterId: 'tusk_sl',
  title: 'HYMN OF THE FIRE DRAGON: ORB OF AVARICE!',
  subtitle:
    'Amplified by the Orb of Avarice (+20% DMG), launches 3 barrages of Blazing Fire and unleashes a colossal Hymn of the Fire Dragon beam!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: TuskSlUltimateData = {
      barragesDone: 0,
      barrageCd: 0.34,
      dragonFired: false,
      dragonAngle: ang,
      dragonFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ORB OF AVARICE!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TuskSlUltimateData;
    if (data.dragonFlash > 0) data.dragonFlash = Math.max(0, data.dragonFlash - dt);

    if (!data.dragonFired && data.barragesDone < 3) {
      data.barrageCd -= dt;
      if (data.barrageCd <= 0) {
        data.barrageCd = 0.44;
        data.barragesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.dragonAngle = ang;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('tusk_fire'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 620,
            vy: Math.sin(a) * 620,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 200,
            color: '#ef4444',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      }
    }

    if (!data.dragonFired && state.elapsed >= 2.0) {
      data.dragonFired = true;
      data.dragonFlash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#ef4444',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'HYMN OF THE FIRE DRAGON!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.45 });
    }
  },
};
