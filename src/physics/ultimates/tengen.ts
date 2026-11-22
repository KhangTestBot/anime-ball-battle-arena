import type { UltimateHandler } from './types';

export interface FlashyBead {
  x: number;
  y: number;
  timer: number;
  exploded: boolean;
}

export interface TengenUltimateData {
  beads: FlashyBead[];
  beadCd: number;
  scoreLevel: number;
  scoreFinished: boolean;
  flashTimer: number;
}

export const tengenUltimateHandler: UltimateHandler = {
  characterId: 'tengen',
  title: 'MUSICAL SCORE COMPLETE: FLASHY STRING PERFORMANCE',
  subtitle:
    'Flashy Peak acceleration (Dodge + Haste) · Throws 6 Anti-Demon Bombs blasting rhythmically through obstacles → Completes the Musical Score unleashing Twin Cleavers to shred shields & armor!',
  bannerColor: '#f59e0b',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.3);
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.9);

    const data: TengenUltimateData = {
      beads: [],
      beadCd: 0.15,
      scoreLevel: 0,
      scoreFinished: false,
      flashTimer: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      190,
      '#ec4899',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'MUSICAL SCORE! FLASHY!!',
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#f59e0b', 80, 260, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TengenUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.flashTimer > 0) data.flashTimer = Math.max(0, data.flashTimer - dt);

    // Drop rhythmic Sound Hashira Gunpowder Beads toward targets!
    if (data.scoreLevel < 6 && state.elapsed < 1.95) {
      data.beadCd -= dt;
      if (data.beadCd <= 0) {
        data.beadCd = 0.28;
        data.scoreLevel++;
        const target = ctx.getNearestEnemy(owner);
        const bx = Math.max(left + 32, Math.min(right - 32, target ? target.x : owner.x));
        const by = Math.max(top + 32, Math.min(bottom - 32, target ? target.y : owner.y));
        data.beads.push({ x: bx, y: by, timer: 0.32, exploded: false });
      }
    }

    for (let i = data.beads.length - 1; i >= 0; i--) {
      const b = data.beads[i];
      b.timer -= dt;
      if (b.timer <= 0 && !b.exploded) {
        b.exploded = true;
        for (let k = ctx.obstacles.length - 1; k >= 0; k--) {
          if (Math.hypot(ctx.obstacles[k].x - b.x, ctx.obstacles[k].y - b.y) <= 165) {
            ctx.obstacles.splice(k, 1);
          }
        }
        ctx.spawnShockwave(b.x, b.y, 115, '#f59e0b', 5, owner.character.id, owner.character.series);
        ctx.spawnParticles(b.x, b.y, 12, '#ec4899', 65, 220, 3, 6, 'star');
        for (const e of enemies) {
          if (Math.hypot(e.x - b.x, e.y - b.y) <= 95 + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
        ctx.emitSfx({ type: 'hit', intensity: 1.1 });
        data.beads.splice(i, 1);
      }
    }

    // Climax (2.15s): 5TH FORM STRING PERFORMANCE FIREWORK SLASH!!
    if (!data.scoreFinished && state.elapsed >= 2.15) {
      data.scoreFinished = true;
      data.flashTimer = 1.1;

      const target = ctx.getNearestEnemy(owner);
      if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        owner.x = Math.max(
          left + owner.radius + 8,
          Math.min(
            right - owner.radius - 8,
            target.x - (dx / d) * (owner.radius + target.radius + 8),
          ),
        );
        owner.y = Math.max(
          top + owner.radius + 8,
          Math.min(
            bottom - owner.radius - 8,
            target.y - (dy / d) * (owner.radius + target.radius + 8),
          ),
        );
      }

      for (const e of enemies) {
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 230 + e.radius) {
          const d = Math.max(1, dist);
          e.shieldTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 14.5),
            (dx / d) * 480,
            (dy / d) * 480,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        240,
        '#f59e0b',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'STRING PERFORMANCE!!',
        '#fef08a',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};
