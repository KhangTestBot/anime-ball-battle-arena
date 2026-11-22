import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface GodThreadSpear {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface DoflamingoUltimateData {
  stage: 'torikago' | 'god-thread';
  centerX: number;
  centerY: number;
  cageRadius: number;
  cutCd: number;
  godThreadFired: boolean;
  spears: GodThreadSpear[];
  slicedBullets: number;
}

export const doflamingoUltimateHandler: UltimateHandler = {
  characterId: 'doflamingo',
  title: 'TORIKAGO (BIRDCAGE) & 16 HOLY BULLETS: GOD THREAD',
  subtitle:
    'Raises a shrinking razor Birdcage forcing all enemies inward & slicing every projectile on contact → Summons 16 Holy Bullets: God Thread to shatter shields & bind-stun!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;

    const data: DoflamingoUltimateData = {
      stage: 'torikago',
      centerX: cx,
      centerY: cy,
      cageRadius:
        Math.min(ctx.bounds.right - ctx.bounds.left, ctx.bounds.bottom - ctx.bounds.top) * 0.46,
      cutCd: 0.3,
      godThreadFired: false,
      spears: [],
      slicedBullets: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnShockwave(
      cx,
      cy,
      data.cageRadius,
      '#f472b6',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'TORIKAGO! BIRDCAGE!',
      '#fbcfe8',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#f43f5e', 75, 240, 3, 6, 'shard');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DoflamingoUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    for (let i = data.spears.length - 1; i >= 0; i--) {
      data.spears[i].life -= dt;
      if (data.spears[i].life <= 0) data.spears.splice(i, 1);
    }

    // 1. Shrinking Birdcage pulls enemies inward & slices any bullet touching perimeter!
    if (data.stage === 'torikago') {
      data.cageRadius = Math.max(105, data.cageRadius - dt * 62);

      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (Math.hypot(p.x - data.centerX, p.y - data.centerY) >= data.cageRadius - 8) {
          data.slicedBullets++;
          ctx.spawnParticles(p.x, p.y, 6, '#f9a8d4', 40, 120, 2, 4, 'shard');
          ctx.projectiles.splice(i, 1);
        }
      }

      data.cutCd -= dt;
      const shouldSlice = data.cutCd <= 0;
      if (shouldSlice) data.cutCd = 0.42;

      for (const e of enemies) {
        const dx = e.x - data.centerX;
        const dy = e.y - data.centerY;
        const dist = Math.hypot(dx, dy);
        if (dist >= data.cageRadius - e.radius - 6) {
          const d = Math.max(1, dist);
          // Clamp/pull gently back inside Torikago wires
          e.x = Math.max(
            left + e.radius + 6,
            Math.min(
              right - e.radius - 6,
              data.centerX + (dx / d) * (data.cageRadius - e.radius - 8),
            ),
          );
          e.y = Math.max(
            top + e.radius + 6,
            Math.min(
              bottom - e.radius - 6,
              data.centerY + (dy / d) * (data.cageRadius - e.radius - 8),
            ),
          );
          if (shouldSlice) {
            e.armorShredTimer = Math.max(e.armorShredTimer, 1.8);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 4.4),
              (-dx / d) * 240,
              (-dy / d) * 240,
              {
                sourceKind: 'ability',
              },
            );
            ctx.spawnFloatingText(e.x, e.y - e.radius - 12, 'PARASITE CUT!', '#f472b6', 'callout');
          }
        }
      }

      // Climax (2.25s): 16 HOLY BULLETS: GOD THREAD!!
      if (!data.godThreadFired && state.elapsed >= 2.25) {
        data.godThreadFired = true;
        data.stage = 'god-thread';
        const target = ctx.getNearestEnemy(owner);
        const tx = target ? target.x : data.centerX;
        const ty = target ? target.y : data.centerY;

        for (let i = 0; i < 16; i++) {
          const a = (i * Math.PI * 2) / 16;
          data.spears.push({
            x1: Math.max(left + 12, Math.min(right - 12, tx + Math.cos(a) * 185)),
            y1: Math.max(top + 12, Math.min(bottom - 12, ty + Math.sin(a) * 185)),
            x2: tx,
            y2: ty,
            life: 0.95,
          });
        }

        ctx.addHitstop(0.08);
        ctx.addScreenShake(20);
        ctx.spawnShockwave(tx, ty, 210, '#ec4899', 7.5, owner.character.id, owner.character.series);
        ctx.spawnFloatingText(tx, ty - 24, '16 HOLY BULLETS: GOD THREAD!!', '#fbcfe8', 'powerup');
        ctx.emitSfx({ type: 'ko', intensity: 1.35 });

        for (const e of enemies) {
          if (Math.hypot(e.x - tx, e.y - ty) <= 155 + e.radius) {
            e.shieldTimer = 0;
            applyFighterStun(ctx, owner, e, 0.55, 'chained', 'GOD THREAD!');
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 15.5 + Math.min(4.5, data.slicedBullets * 0.8)),
              0,
              0,
              { isCrit: true, sourceKind: 'ability' },
            );
          }
        }
      }
    }
  },
};
