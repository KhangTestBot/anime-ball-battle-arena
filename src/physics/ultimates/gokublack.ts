import type { UltimateHandler } from './types';

export interface GokuBlackUltimateData {
  riftX: number;
  riftY: number;
  riftAngle: number;
  cloneVolleys: number;
  volleyCd: number;
  scytheDetonated: boolean;
}

export const gokuBlackUltimateHandler: UltimateHandler = {
  characterId: 'gokublack',
  title: 'SCYTHE OF SORROW · DIVINE ROSE RIFT',
  subtitle:
    'Tears open a crimson-pink dimensional Scythe Rift firing Rosé energy clones & blades that shred armor and lock dodge!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.4);
    const target = ctx.getNearestEnemy(owner);
    const rx = target
      ? Math.max(ctx.bounds.left + 80, Math.min(ctx.bounds.right - 80, (owner.x + target.x) * 0.5))
      : (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const ry = target
      ? Math.max(ctx.bounds.top + 80, Math.min(ctx.bounds.bottom - 80, (owner.y + target.y) * 0.5))
      : (ctx.bounds.top + ctx.bounds.bottom) * 0.5;

    const data: GokuBlackUltimateData = {
      riftX: rx,
      riftY: ry,
      riftAngle: -0.45,
      cloneVolleys: 0,
      volleyCd: 0.4,
      scytheDetonated: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, rx, ry, data.riftAngle, '#ec4899', 'ULT', true);
    ctx.spawnShockwave(rx, ry, 195, '#ec4899', 6, owner.character.id, owner.character.series);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SUBARASHII! DIVINE RIFT!',
      '#f472b6',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GokuBlackUltimateData;

    // 1. Dimensional Rift fires 4 waves of Rosé scythe blades!
    if (data.cloneVolleys < 4) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.55;
        data.cloneVolleys += 1;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - data.riftY, target.x - data.riftX)
          : owner.facingAngle;

        for (let k = -1; k <= 1; k++) {
          const a = baseAng + k * 0.26;
          ctx.projectiles.push({
            id: ctx.nextId('rose_scythe'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'scythe',
            x: data.riftX,
            y: data.riftY,
            vx: Math.cos(a) * 560,
            vy: Math.sin(a) * 560,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 220,
            color: '#ec4899',
            secondaryColor: '#09090b',
            angle: a,
            life: 1.8,
            maxLife: 1.8,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.spawnParticles(data.riftX, data.riftY, 12, '#f472b6', 60, 210, 2.5, 5.5, 'shard');
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    // 2. Climax (2.4s): Rift Collapse Scythe Explosion!
    if (!data.scytheDetonated && state.elapsed >= 2.4) {
      data.scytheDetonated = true;
      for (const e of ctx.getEnemies(owner)) {
        if (Math.hypot(e.x - data.riftX, e.y - data.riftY) <= 230 + e.radius) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.2);
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 17.5), 0, 0, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        data.riftX,
        data.riftY,
        235,
        '#ec4899',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(data.riftX, data.riftY - 24, 'ZERO MORTALS!', '#ec4899', 'crit');
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.2 });
    }
  },
};
