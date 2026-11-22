import type { UltimateHandler } from './types';

export interface DelayedXCut {
  targetUid: string;
  x: number;
  y: number;
  detonateTimer: number;
  detonated: boolean;
  fadeTimer: number;
}

export interface ZoroUltimateData {
  stage: 'stance' | 'dash' | 'sheathe-wait' | 'done';
  stanceTimer: number;
  dashAngle: number;
  dashX: number;
  dashY: number;
  dashEndX: number;
  dashEndY: number;
  dashTimer: number;
  orbitAngle: number;
  orbitHitCd: Record<string, number>;
  delayedCuts: DelayedXCut[];
}

export const zoroUltimateHandler: UltimateHandler = {
  characterId: 'zoro',
  title: "KYUTORYU ASHURA: DEAD MAN'S GAME",
  subtitle:
    '2-tier 9-Sword Enma guard (blocks projectiles & slashes close foes) · Dashes straight across the arena → Sheathes swords detonating delayed X-Cuts!',
  bannerColor: '#4ade80',
  castDuration: 0.25,
  duration: 4.3,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 1.4);

    // Compute clean straight-line dash endpoint clamped strictly inside arena walls
    const dashLen = 360;
    const m = owner.radius + 12;
    const endX = Math.max(
      ctx.bounds.left + m,
      Math.min(ctx.bounds.right - m, owner.x + Math.cos(angle) * dashLen),
    );
    const endY = Math.max(
      ctx.bounds.top + m,
      Math.min(ctx.bounds.bottom - m, owner.y + Math.sin(angle) * dashLen),
    );

    const data: ZoroUltimateData = {
      stage: 'stance',
      stanceTimer: 0.4, // Clear straight-line telegraph before blitz!
      dashAngle: angle,
      dashX: owner.x,
      dashY: owner.y,
      dashEndX: endX,
      dashEndY: endY,
      dashTimer: 0.26,
      orbitAngle: 0,
      orbitHitCd: {},
      delayedCuts: [],
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#4ade80', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'ASHURA · 9 SWORDS!',
      '#4ade80',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#4ade80', 70, 240, 2.5, 5.5, 'shard');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ZoroUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.orbitAngle += dt * 7.2;

    for (const uid of Object.keys(data.orbitHitCd)) {
      data.orbitHitCd[uid] -= dt;
      if (data.orbitHitCd[uid] <= 0) delete data.orbitHitCd[uid];
    }

    // 1. Continuous 2-tier Enma 9-Sword Satellites:
    // Inner tier destroys enemy projectiles; Outer tier slices nearby enemies!
    const innerR = owner.radius + 26;
    const outerR = owner.radius + 46;
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= innerR + p.radius) {
        ctx.spawnParticles(p.x, p.y, 6, '#4ade80', 50, 160, 2, 4, 'spark');
        ctx.projectiles.splice(i, 1);
      }
    }
    for (const e of enemies) {
      if (data.orbitHitCd[e.uid]) continue;
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= outerR + e.radius) {
        data.orbitHitCd[e.uid] = 0.42;
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
          sourceKind: 'ability',
        });
        ctx.spawnParticles(e.x, e.y, 6, '#a855f7', 50, 170, 2, 4, 'shard');
      }
    }

    // 2. Stage A: 0.4s Sword Draw Stance (telegraphs straight dash path!)
    if (data.stage === 'stance') {
      owner.vx *= Math.pow(0.1, dt);
      owner.vy *= Math.pow(0.1, dt);
      data.dashX = owner.x;
      data.dashY = owner.y;
      data.stanceTimer -= dt;
      if (data.stanceTimer <= 0) {
        data.stage = 'dash';
        data.dashTimer = 0.24;
        owner.invulnTimer = Math.max(owner.invulnTimer, 0.35);
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 16,
          'DEAD MAN GAME!!',
          '#4ade80',
          'powerup',
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    } else if (data.stage === 'dash') {
      // Unstoppable linear blitz across arena!
      data.dashTimer -= dt;
      const stepFraction = Math.min(1, dt / 0.24);
      const nextX = owner.x + (data.dashEndX - data.dashX) * stepFraction;
      const nextY = owner.y + (data.dashEndY - data.dashY) * stepFraction;
      const m = owner.radius + 10;
      owner.x = Math.max(ctx.bounds.left + m, Math.min(ctx.bounds.right - m, nextX));
      owner.y = Math.max(ctx.bounds.top + m, Math.min(ctx.bounds.bottom - m, nextY));
      owner.vx = Math.cos(data.dashAngle) * 320;
      owner.vy = Math.sin(data.dashAngle) * 320;

      // Mark any enemy touched along the blitz line for DELAYED X-Slash rupture!
      for (const e of enemies) {
        if (data.delayedCuts.some((c) => c.targetUid === e.uid)) continue;
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 32) {
          data.delayedCuts.push({
            targetUid: e.uid,
            x: e.x,
            y: e.y,
            detonateTimer: 0.5, // Classic anime sheathe delay!
            detonated: false,
            fadeTimer: 0.65,
          });
          ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'MARKED...', '#bbf7d0', 'callout');
        }
      }

      if (data.dashTimer <= 0) {
        data.stage = 'sheathe-wait';
        ctx.spawnParticles(owner.x, owner.y, 16, '#4ade80', 80, 240, 3, 6, 'shard');
      }
    }

    // 3. Delayed X-Cut Rupture (damage detonates upon sheathing the blade!)
    for (let i = data.delayedCuts.length - 1; i >= 0; i--) {
      const cut = data.delayedCuts[i];
      const target = enemies.find((e) => e.uid === cut.targetUid);
      if (target) {
        cut.x = target.x;
        cut.y = target.y;
      }

      if (!cut.detonated) {
        cut.detonateTimer -= dt;
        if (cut.detonateTimer <= 0) {
          cut.detonated = true;
          ctx.addHitstop(0.06);
          ctx.addScreenShake(14);
          ctx.spawnShockwave(
            cut.x,
            cut.y,
            125,
            '#4ade80',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnParticles(cut.x, cut.y, 24, '#4ade80', 100, 340, 3, 6.5, 'shard');
          ctx.spawnParticles(cut.x, cut.y, 14, '#a855f7', 90, 290, 2.5, 5.5, 'spark');
          ctx.emitSfx({ type: 'ko', intensity: 1.2 });

          if (target) {
            ctx.applyDamage(
              owner,
              target,
              ctx.getEffectiveDamage(owner, 18.5),
              Math.cos(data.dashAngle) * 520,
              Math.sin(data.dashAngle) * 520,
              { isCrit: true, sourceKind: 'ability' },
            );
            ctx.spawnFloatingText(
              target.x,
              target.y - target.radius - 20,
              'ASHURA SLASH!!',
              '#4ade80',
              'powerup',
            );
          }
        }
      } else {
        cut.fadeTimer -= dt;
        if (cut.fadeTimer <= 0) data.delayedCuts.splice(i, 1);
      }
    }
  },
};
