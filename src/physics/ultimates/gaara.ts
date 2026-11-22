import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface GaaraUltimateData {
  stage: 'sand-coffin' | 'mausoleum-crush';
  targetUid: string | null;
  coffinX: number;
  coffinY: number;
  blockedCount: number;
  crushed: boolean;
  crushFlash: number;
}

export const gaaraUltimateHandler: UltimateHandler = {
  characterId: 'gaara',
  title: 'GRAND SAND MAUSOLEUM',
  subtitle:
    'Mother’s Sand auto-blocks projectiles (building power) & slows enemies → Binds targets in Sand Coffin → Seals them inside the Grand Sand Mausoleum pyramid to crush & shred armor!',
  bannerColor: '#d97706',
  castDuration: 0.25,
  duration: 3.9,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    if (target) {
      applyFighterStun(ctx, owner, target, 1.35, 'chained', 'SAND COFFIN!');
      ctx.spawnParticles(target.x, target.y, 18, '#fbbf24', 55, 190, 3, 6, 'circle');
    }

    const data: GaaraUltimateData = {
      stage: 'sand-coffin',
      targetUid: target ? target.uid : null,
      coffinX: target ? target.x : owner.x,
      coffinY: target ? target.y : owner.y,
      blockedCount: 0,
      crushed: false,
      crushFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#d97706', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#f59e0b',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      "MOTHER'S SAND SHIELD!",
      '#fde047',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#f59e0b', 65, 220, 3, 6, 'circle');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GaaraUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.crushFlash > 0) {
      data.crushFlash = Math.max(0, data.crushFlash - dt);
    }

    // Mother's Absolute Sand Shield automatically deletes incoming projectiles & powers up Mausoleum!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 46 + p.radius
      ) {
        data.blockedCount++;
        ctx.spawnParticles(p.x, p.y, 7, '#fbbf24', 45, 145, 2.5, 5, 'circle');
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 14,
          'SAND BLOCK!',
          '#fde047',
          'callout',
        );
        ctx.projectiles.splice(i, 1);
      }
    }

    // Quicksand arena drag pulls enemies slightly toward Sand Coffin
    const lockedTarget =
      enemies.find((e) => e.uid === data.targetUid && e.alive) ?? ctx.getNearestEnemy(owner);
    if (lockedTarget && !data.crushed) {
      data.coffinX = lockedTarget.x;
      data.coffinY = lockedTarget.y;
    }

    for (const e of enemies) {
      if (Math.hypot(e.x - data.coffinX, e.y - data.coffinY) <= 180) {
        e.vx *= Math.pow(0.55, dt * 3);
        e.vy *= Math.pow(0.55, dt * 3);
      }
    }

    // Climax (2.0s): GRAND SAND MAUSOLEUM SEAL!!
    if (!data.crushed && state.elapsed >= 2.0) {
      data.crushed = true;
      data.stage = 'mausoleum-crush';
      data.crushFlash = 1.1;

      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnShockwave(
        data.coffinX,
        data.coffinY,
        225,
        '#d97706',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        data.coffinX,
        data.coffinY - 24,
        'SAND MAUSOLEUM SEAL!!',
        '#fef08a',
        'powerup',
      );
      ctx.spawnParticles(data.coffinX, data.coffinY, 30, '#fbbf24', 90, 320, 3.5, 7, 'shard');
      ctx.emitSfx({ type: 'wall', intensity: 1.4 });

      const bonusDmg = Math.min(8.0, data.blockedCount * 1.6);
      for (const e of enemies) {
        const dx = e.x - data.coffinX;
        const dy = e.y - data.coffinY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 165 + e.radius) {
          const d = Math.max(1, dist);
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.8);
          e.shieldTimer = 0;
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 15.0 + bonusDmg),
            (dx / d) * 440,
            (dy / d) * 440,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
        }
      }
    }
  },
};
