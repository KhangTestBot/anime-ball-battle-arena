import type { UltimateHandler } from './types';

export interface BlastCrater {
  x: number;
  y: number;
  radius: number;
}

export interface CreeperUltimateData {
  blastsDone: number; // 0 -> 1 (small) -> 2 (medium) -> 3 (mega)
  nextBlastTimer: number;
  countdownDisplay: number; // 3, 2, 1
  craters: BlastCrater[];
  superchargedMult: number;
  lastWallHitX: number;
  lastWallHitY: number;
}

export const creeperUltimateHandler: UltimateHandler = {
  characterId: 'creeper',
  title: 'CHARGED SUPER-FUSE: CHAIN CRATER',
  subtitle:
    'Sacrifices 12% HP to trigger a 3-beat chain detonation (3-2-1) at 1.5x damage · Creates a slippery Bomb Crater causing loss of control!',
  bannerColor: '#38bdf8',
  castDuration: 0.3,
  duration: 4.8,

  onCast(ctx, owner, state) {
    // Risk-Reward: consume 12% current HP (never self-KOs!) to supercharge explosions by 1.5x!
    const selfCost = Math.floor(owner.hp * 0.12);
    if (selfCost > 0 && owner.hp - selfCost >= 1) {
      owner.hp -= selfCost;
      ctx.spawnFloatingText(
        owner.x,
        owner.y + owner.radius + 14,
        `-${selfCost} FUSE`,
        '#38bdf8',
        'damage',
      );
    }

    const data: CreeperUltimateData = {
      blastsDone: 0,
      nextBlastTimer: 0.68,
      countdownDisplay: 3,
      craters: [],
      superchargedMult: 1.5,
      lastWallHitX: owner.x,
      lastWallHitY: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    owner.fuseTimer = 0.7;
    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnParticles(owner.x, owner.y, 20, '#38bdf8', 70, 240, 3, 6, 'pixel');
    ctx.addScreenShake(8);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as CreeperUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. During the 3-beat fuse, aggressively chase the nearest enemy so Creeper explodes right on top of them!
    if (data.blastsDone < 3) {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        owner.vx += (dx / d) * 620 * dt;
        owner.vy += (dy / d) * 620 * dt;
      }

      data.nextBlastTimer -= dt;
      data.countdownDisplay = Math.max(1, 3 - data.blastsDone);
      owner.fuseTimer = Math.max(0.08, data.nextBlastTimer);

      if (data.nextBlastTimer <= 0) {
        data.blastsDone += 1;
        const isMega = data.blastsDone === 3;
        const blastR = isMega ? 215 : data.blastsDone === 2 ? 155 : 115;
        const rawBase = (isMega ? 15.5 : data.blastsDone === 2 ? 9.5 : 6.8) * data.superchargedMult;

        ctx.addScreenShake(isMega ? 15 : 8);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          blastR,
          isMega ? '#38bdf8' : '#4ade80',
          isMega ? 8 : 5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(owner.x, owner.y, isMega ? 32 : 18, '#4ade80', 110, 380, 3, 7, 'pixel');
        ctx.spawnParticles(owner.x, owner.y, isMega ? 22 : 12, '#38bdf8', 90, 340, 3, 6, 'pixel');
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          isMega ? 'SUPER ATOMIC BOOM!!' : `BOOM #${data.blastsDone}!`,
          isMega ? '#38bdf8' : '#4ade80',
          'powerup',
        );
        ctx.emitSfx({ type: isMega ? 'ko' : 'crit', intensity: 1.2 });

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= blastR + e.radius) {
            const nx = dist > 0.1 ? dx / dist : 1;
            const ny = dist > 0.1 ? dy / dist : 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, rawBase),
              nx * (isMega ? 680 : 420),
              ny * (isMega ? 680 : 420),
              { isCrit: isMega, sourceKind: 'ability' },
            );
          }
        }

        // Stamp a terraced Minecraft Blast Crater on the 2nd & 3rd blast!
        if (data.blastsDone >= 2) {
          data.craters.push({ x: owner.x, y: owner.y, radius: isMega ? 105 : 70 });
        }

        data.nextBlastTimer = data.blastsDone < 3 ? 0.68 : 99;
      }
    }

    // 2. Active Blast Craters destabilize enemies sliding through them (chaotic slip / reduced control!)
    for (const cr of data.craters) {
      for (const e of enemies) {
        const dx = e.x - cr.x;
        const dy = e.y - cr.y;
        const d = Math.hypot(dx, dy);
        if (d < cr.radius + e.radius * 0.5 && d > 1) {
          // Tangential slip force destabilizing footing inside crater!
          e.vx += (-dy / d) * 320 * dt;
          e.vy += (dx / d) * 320 * dt;
        }
      }
    }

    // 3. Wall-impact mini spark explosion while Charged Creeper bounces off arena walls!
    const { left, right, top, bottom } = ctx.bounds;
    const nearWall =
      owner.x - owner.radius <= left + 4 ||
      owner.x + owner.radius >= right - 4 ||
      owner.y - owner.radius <= top + 4 ||
      owner.y + owner.radius >= bottom - 4;
    if (nearWall && Math.hypot(owner.x - data.lastWallHitX, owner.y - data.lastWallHitY) > 65) {
      data.lastWallHitX = owner.x;
      data.lastWallHitY = owner.y;
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        95,
        '#38bdf8',
        4,
        owner.character.id,
        owner.character.series,
      );
      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 95 + e.radius) {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), 0, 0, {
            sourceKind: 'ability',
          });
        }
      }
    }
  },
};
