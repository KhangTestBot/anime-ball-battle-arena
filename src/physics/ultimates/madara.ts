import type { UltimateHandler } from './types';

export interface MeteorShardProj {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface MadaraUltimateData {
  stage: 'shadow-1' | 'meteor-1-rock' | 'shadow-2' | 'shattered';
  timer: number;
  impactX: number;
  impactY: number;
  obstacleId: string;
  limboAngle: number;
  limboCd: Record<string, number>;
  shards: MeteorShardProj[];
  shatterFlash: number;
}

export const madaraUltimateHandler: UltimateHandler = {
  characterId: 'madara',
  title: 'TENGAI SHINSEI — TWIN METEORS & LIMBO',
  subtitle:
    'Meteor 1 lands creating Rock Obstacles · 1.3s later Meteor 2 shatters it into 12 shield-breaking 360° shards · Invisible Limbo clones knock enemies back!',
  bannerColor: '#dc2626',
  castDuration: 0.25,
  duration: 4.6,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;
    const target = ctx.getNearestEnemy(owner);
    const ix = target
      ? Math.max(ctx.bounds.left + 85, Math.min(ctx.bounds.right - 85, (cx + target.x) * 0.5))
      : cx;
    const iy = target
      ? Math.max(ctx.bounds.top + 85, Math.min(ctx.bounds.bottom - 85, (cy + target.y) * 0.5))
      : cy;

    const data: MadaraUltimateData = {
      stage: 'shadow-1',
      timer: 0.85,
      impactX: ix,
      impactY: iy,
      obstacleId: ctx.nextId('madara_rock'),
      limboAngle: 0,
      limboCd: {},
      shards: [],
      shatterFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'TENGAI SHINSEI!',
      '#ef4444',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#dc2626', 60, 220, 3, 6, 'shard');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MadaraUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Limbo: Border Jail unseen shadow clone orbiting Madara, knocking away melee attackers!
    data.limboAngle += dt * 3.8;
    const limboX = Math.max(
      ctx.bounds.left + 20,
      Math.min(ctx.bounds.right - 20, owner.x + Math.cos(data.limboAngle) * (owner.radius + 30)),
    );
    const limboY = Math.max(
      ctx.bounds.top + 20,
      Math.min(ctx.bounds.bottom - 20, owner.y + Math.sin(data.limboAngle) * (owner.radius + 30)),
    );
    for (const uid of Object.keys(data.limboCd)) {
      data.limboCd[uid] -= dt;
      if (data.limboCd[uid] <= 0) delete data.limboCd[uid];
    }
    for (const e of enemies) {
      if (data.limboCd[e.uid]) continue;
      if (Math.hypot(e.x - limboX, e.y - limboY) <= e.radius + 20) {
        data.limboCd[e.uid] = 0.65;
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 5.2),
          (dx / d) * 440,
          (dy / d) * 440,
          {
            sourceKind: 'ability',
          },
        );
        ctx.spawnFloatingText(limboX, limboY - 12, 'LIMBO!', '#a855f7', 'callout');
        ctx.emitSfx({ type: 'hit', intensity: 1.0 });
      }
    }

    // 2. Two-Stage Tengai Shinsei Meteors!
    if (data.stage === 'shadow-1') {
      data.timer -= dt;
      if (data.timer <= 0) {
        data.stage = 'meteor-1-rock';
        data.timer = 1.25;
        ctx.addScreenShake(13);
        ctx.addHitstop(0.05);
        ctx.spawnShockwave(
          data.impactX,
          data.impactY,
          155,
          '#ea580c',
          6,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(data.impactX, data.impactY - 26, 'METEOR #1!!', '#f97316', 'powerup');
        ctx.emitSfx({ type: 'wall', intensity: 1.3 });

        for (const e of enemies) {
          const dx = e.x - data.impactX;
          const dy = e.y - data.impactY;
          const d = Math.hypot(dx, dy);
          if (d <= 140 + e.radius) {
            const nx = d > 0.1 ? dx / d : 1;
            const ny = d > 0.1 ? dy / d : 0;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 10.5), nx * 460, ny * 460, {
              sourceKind: 'ability',
            });
          }
        }

        // Spawn physical Stone Meteor ArenaObstacle if not overlapping any fighter's center!
        const overlaps = ctx.fighters.some(
          (f) => f.alive && Math.hypot(f.x - data.impactX, f.y - data.impactY) < f.radius + 26,
        );
        if (!overlaps) {
          ctx.obstacles.push({
            id: data.obstacleId,
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            teamId: owner.teamId,
            kind: 'stone-meteor',
            x: data.impactX,
            y: data.impactY,
            w: 62,
            h: 62,
            hp: 4,
            maxHp: 4,
            life: 2.5,
            maxLife: 2.5,
            blocksProjectiles: true,
            restitution: 1.1,
            color: '#44403c',
            secondaryColor: '#f97316',
          });
        }
      }
    } else if (data.stage === 'meteor-1-rock') {
      data.timer -= dt;
      if (data.timer <= 0) {
        data.stage = 'shadow-2';
        data.timer = 0.8;
        ctx.spawnFloatingText(
          data.impactX,
          data.impactY - 36,
          'WHAT ABOUT THE 2ND ONE?',
          '#dc2626',
          'powerup',
        );
      }
    } else if (data.stage === 'shadow-2') {
      data.timer -= dt;
      if (data.timer <= 0) {
        data.stage = 'shattered';
        data.shatterFlash = 0.75;

        // Destroy the Meteor #1 rock obstacle and blast 12 shield-breaking shards 360°!
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (ctx.obstacles[i].id === data.obstacleId) ctx.obstacles.splice(i, 1);
        }

        ctx.addHitstop(0.075);
        ctx.addScreenShake(17);
        ctx.spawnShockwave(
          data.impactX,
          data.impactY,
          215,
          '#dc2626',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.impactX,
          data.impactY - 26,
          'METEOR #2 SHATTER!!',
          '#dc2626',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });

        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI * 2) / 12;
          data.shards.push({
            x: data.impactX + Math.cos(a) * 18,
            y: data.impactY + Math.sin(a) * 18,
            vx: Math.cos(a) * 510,
            vy: Math.sin(a) * 510,
            life: 1.1,
          });
        }

        for (const e of enemies) {
          const dx = e.x - data.impactX;
          const dy = e.y - data.impactY;
          const d = Math.hypot(dx, dy);
          if (d <= 190 + e.radius) {
            e.shieldTimer = 0; // Shatters shields!
            const nx = d > 0.1 ? dx / d : 1;
            const ny = d > 0.1 ? dy / d : 0;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 13.5), nx * 560, ny * 560, {
              isCrit: true,
              sourceKind: 'ability',
            });
          }
        }
      }
    }

    // 3. Update 12 explosive Meteor #2 shrapnel shards!
    if (data.shatterFlash > 0) data.shatterFlash = Math.max(0, data.shatterFlash - dt);
    for (let i = data.shards.length - 1; i >= 0; i--) {
      const sh = data.shards[i];
      sh.life -= dt;
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      let hit = false;
      for (const e of enemies) {
        if (Math.hypot(e.x - sh.x, e.y - sh.y) <= e.radius + 12) {
          e.shieldTimer = 0;
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 4.6),
            sh.vx * 0.28,
            sh.vy * 0.28,
            {
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(sh.x, sh.y, 8, '#f97316', 60, 180, 2.5, 5, 'shard');
          hit = true;
          break;
        }
      }
      if (hit || sh.life <= 0) data.shards.splice(i, 1);
    }
  },
};
