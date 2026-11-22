import type { UltimateHandler } from './types';

export interface SuckedVoxel {
  angle: number;
  dist: number;
  color: string;
  size: number;
}

export interface WitherUltimateData {
  beamAngle: number;
  witherArmorTimer: number;
  decayTickCd: number;
  voxels: SuckedVoxel[];
  skullVolleyCd: number;
}

function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export const witherUltimateHandler: UltimateHandler = {
  characterId: 'wither',
  title: 'WITHER STORM: COMMAND BLOCK SINGULARITY',
  subtitle:
    '3 rotating tractor beams pull enemies in · Wither Decay (-60% healing) · Dark Armor resists projectiles!',
  bannerColor: '#c084fc',
  castDuration: 0.35,
  duration: 5.0,

  onCast(ctx, owner, state) {
    const voxels: SuckedVoxel[] = [];
    const blockCols = ['#78716c', '#92400e', '#44403c', '#15803d', '#581c87'];
    for (let i = 0; i < 18; i++) {
      voxels.push({
        angle: (i * Math.PI * 2) / 18,
        dist: 90 + (i % 5) * 42,
        color: blockCols[i % blockCols.length],
        size: 5 + (i % 3) * 2.5,
      });
    }

    const data: WitherUltimateData = {
      beamAngle: owner.facingAngle,
      witherArmorTimer: owner.hp <= owner.maxHp * 0.6 ? 3.8 : 3.0,
      decayTickCd: 0.28,
      voxels,
      skullVolleyCd: 1.05,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#c084fc', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#9333ea',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#c084fc', 80, 300, 3, 6.5, 'pixel');
    ctx.addScreenShake(11);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as WitherUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Rotate 3 Tractor Beam cones at balanced speed (1.1 rad/s) so enemies have safe gaps between beams
    data.beamAngle += dt * 1.1;
    if (data.witherArmorTimer > 0) {
      data.witherArmorTimer = Math.max(0, data.witherArmorTimer - dt);
    }

    // Pull voxel debris continuously inward toward the Command Block!
    for (const v of data.voxels) {
      v.dist -= dt * 145;
      v.angle += dt * 1.15;
      if (v.dist < owner.radius + 8) {
        v.dist = 230 + Math.random() * 50;
      }
    }

    // 2. Wither Armor: blocks ALL ranged projectiles while active (melee collisions still deal 100%!)
    if (data.witherArmorTimer > 0) {
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + p.radius + 12) {
          ctx.spawnParticles(p.x, p.y, 8, '#7dd3fc', 50, 170, 2.5, 5, 'pixel');
          ctx.projectiles.splice(i, 1);
        }
      }
    }

    // 3. Check 3 Tractor Beam Cones -> continuous inward pull + Wither Decay!
    const beamRange = 275;
    const halfCone = 0.31;
    data.decayTickCd -= dt;
    const applyTick = data.decayTickCd <= 0;
    if (applyTick) data.decayTickCd = 0.34;

    for (const e of enemies) {
      const dx = e.x - owner.x;
      const dy = e.y - owner.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= beamRange && dist > 1) {
        const angToEnemy = Math.atan2(dy, dx);
        let inCone = false;
        for (let b = 0; b < 3; b++) {
          const bAng = data.beamAngle + (b * Math.PI * 2) / 3;
          if (Math.abs(angleDiff(angToEnemy, bAng)) <= halfCone) {
            inCone = true;
            break;
          }
        }
        if (inCone) {
          // Pull steadily toward Wither Storm center
          e.vx -= (dx / dist) * 460 * dt;
          e.vy -= (dy / dist) * 460 * dt;

          if (applyTick) {
            e.karmaTimer = Math.max(e.karmaTimer, 3.2);
            e.karmaDps = Math.max(e.karmaDps, ctx.getEffectiveDamage(owner, 2.8));
            e.karmaOwnerUid = owner.uid;
            e.karmaKind = 'wither';
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
      }
    }

    // 4. Periodically launch explosive Blue Charged Wither Skulls!
    data.skullVolleyCd -= dt;
    if (data.skullVolleyCd <= 0 && enemies.length > 0) {
      data.skullVolleyCd = 1.25;
      const target = enemies[0];
      const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
      for (const spread of [-0.22, 0.22]) {
        const a = ang + spread;
        ctx.projectiles.push({
          id: ctx.nextId('wstorm'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'wither-skull',
          x: owner.x + Math.cos(a) * (owner.radius + 16),
          y: owner.y + Math.sin(a) * (owner.radius + 16),
          vx: Math.cos(a) * 430,
          vy: Math.sin(a) * 430,
          radius: 19,
          damage: ctx.getEffectiveDamage(owner, 9.6),
          knockback: 340,
          color: '#38bdf8',
          secondaryColor: '#c084fc',
          angle: a,
          life: 1.8,
          maxLife: 1.8,
          piercing: false,
          explosiveRadius: 115,
          hitCooldowns: {},
          powerLevel: 6,
        });
      }
      ctx.emitSfx({ type: 'beam-fire', intensity: 0.95 });
    }
  },
};
