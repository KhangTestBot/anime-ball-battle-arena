import type { UltimateHandler } from './types';

export interface SpiritStream {
  sx: number;
  sy: number;
  progress: number;
}

export interface GokuUltimateData {
  stage: 'charging' | 'launched' | 'detonated';
  chargeTimer: number;
  orbX: number;
  orbY: number;
  orbVx: number;
  orbVy: number;
  orbRadius: number;
  absorbedCount: number;
  streams: SpiritStream[];
  detonateFlash: number;
}

export const gokuUltimateHandler: UltimateHandler = {
  characterId: 'goku',
  title: 'ULTRA INSTINCT & SPIRIT BOMB',
  subtitle:
    'Charges the Spirit Bomb + 85% Ultra Instinct Dodge · Sphere absorbs enemy projectiles to grow (+15% damage) before unleashing a shockwave blast!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 4.8,

  onCast(ctx, owner, state) {
    // Mastered Ultra Instinct 85% auto-dodge while charging Genki Dama!
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 1.65);

    const { left, right, top, bottom } = ctx.bounds;
    const streams: SpiritStream[] = [];
    for (let i = 0; i < 16; i++) {
      const side = i % 4;
      const sx = side === 0 ? left : side === 1 ? right : left + Math.random() * (right - left);
      const sy = side === 2 ? top : side === 3 ? bottom : top + Math.random() * (bottom - top);
      streams.push({ sx, sy, progress: Math.random() });
    }

    const data: GokuUltimateData = {
      stage: 'charging',
      chargeTimer: 1.55,
      orbX: owner.x,
      orbY: Math.max(top + 38, owner.y - owner.radius - 26),
      orbVx: 0,
      orbVy: 0,
      orbRadius: 18,
      absorbedCount: 0,
      streams,
      detonateFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'LEND ME YOUR ENERGY!!',
      '#bae6fd',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#e2e8f0', 70, 240, 2.5, 5.5, 'star');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GokuUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    // 1. Phase 1: Gathering Spirit Energy (1.55s) with Ultra Instinct 85% dodge!
    if (data.stage === 'charging') {
      owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 0.15);
      // Goku hovers calmly while channeling
      owner.vx *= Math.pow(0.15, dt);
      owner.vy *= Math.pow(0.15, dt);

      data.chargeTimer -= dt;
      data.orbX = owner.x;
      data.orbY = Math.max(top + data.orbRadius + 6, owner.y - owner.radius - data.orbRadius - 6);
      data.orbRadius = Math.min(64, 18 + (1 - Math.max(0, data.chargeTimer) / 1.55) * 46);

      for (const s of data.streams) {
        s.progress += dt * 1.65;
        if (s.progress >= 1) s.progress = 0;
      }

      if (data.chargeTimer <= 0) {
        data.stage = 'launched';
        const target = ctx.getNearestEnemy(owner);
        const ang = target
          ? Math.atan2(target.y - data.orbY, target.x - data.orbX)
          : owner.facingAngle;
        data.orbVx = Math.cos(ang) * 235;
        data.orbVy = Math.sin(ang) * 235;
        ctx.spawnFloatingText(
          data.orbX,
          data.orbY - data.orbRadius - 10,
          'GENKI DAMA!!',
          '#38bdf8',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-fire' });
      }
      return;
    }

    // 2. Phase 2: Slow Homing Genki Dama — ABSORBS enemy projectiles to grow +15% stronger!
    if (data.stage === 'launched') {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - data.orbX;
        const dy = target.y - data.orbY;
        const d = Math.max(1, Math.hypot(dx, dy));
        data.orbVx += (dx / d) * 320 * dt;
        data.orbVy += (dy / d) * 320 * dt;
        const spd = Math.hypot(data.orbVx, data.orbVy);
        if (spd > 245) {
          data.orbVx = (data.orbVx / spd) * 245;
          data.orbVy = (data.orbVy / spd) * 245;
        }
      }

      data.orbX += data.orbVx * dt;
      data.orbY += data.orbVy * dt;

      // Eat any enemy projectile touching the Spirit Bomb -> +15% power & bigger radius!
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        if (Math.hypot(p.x - data.orbX, p.y - data.orbY) <= data.orbRadius + p.radius + 10) {
          ctx.projectiles.splice(i, 1);
          data.absorbedCount = Math.min(6, data.absorbedCount + 1);
          data.orbRadius = Math.min(86, data.orbRadius + 4.5);
          ctx.spawnParticles(p.x, p.y, 10, '#bae6fd', 60, 190, 2.5, 5, 'star');
          ctx.spawnFloatingText(
            data.orbX,
            data.orbY - data.orbRadius - 8,
            'ABSORBED +15%!',
            '#7dd3fc',
            'callout',
          );
        }
      }

      let detonate = false;
      for (const e of enemies) {
        if (Math.hypot(e.x - data.orbX, e.y - data.orbY) <= data.orbRadius + e.radius) {
          detonate = true;
          break;
        }
      }
      if (
        !detonate &&
        (data.orbX <= left + data.orbRadius * 0.6 ||
          data.orbX >= right - data.orbRadius * 0.6 ||
          data.orbY <= top + data.orbRadius * 0.6 ||
          data.orbY >= bottom - data.orbRadius * 0.6)
      ) {
        detonate = true;
      }

      if (detonate) {
        data.stage = 'detonated';
        data.detonateFlash = 0.85;
        const absorbMult = 1 + data.absorbedCount * 0.15;
        const blastR = data.orbRadius * 2.65;

        ctx.addHitstop(0.08);
        ctx.addScreenShake(18);
        ctx.spawnShockwave(
          data.orbX,
          data.orbY,
          blastR,
          '#bae6fd',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnShockwave(
          data.orbX,
          data.orbY,
          blastR * 0.65,
          '#38bdf8',
          7,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(data.orbX, data.orbY, 36, '#bae6fd', 120, 440, 3, 7, 'star');
        ctx.emitSfx({ type: 'ko', intensity: 1.3 });

        for (const e of enemies) {
          const dx = e.x - data.orbX;
          const dy = e.y - data.orbY;
          const dist = Math.hypot(dx, dy);
          if (dist <= blastR + e.radius) {
            const nx = dist > 0.1 ? dx / dist : 1;
            const ny = dist > 0.1 ? dy / dist : 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 21 * absorbMult),
              nx * 700,
              ny * 700,
              { isCrit: true, sourceKind: 'ability' },
            );
          }
        }
      }
    } else if (data.detonateFlash > 0) {
      data.detonateFlash = Math.max(0, data.detonateFlash - dt);
    }
  },
};
