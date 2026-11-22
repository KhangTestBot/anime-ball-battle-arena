import type { UltimateHandler } from './types';

export interface AntiMagicCrossSlash {
  x: number;
  y: number;
  size: number;
  life: number;
}

export interface AstaUltimateData {
  brokenCount: number;
  slashes: AntiMagicCrossSlash[];
  slashesDone: number;
  slashCd: number;
  breakWaveRadius: number;
  breakWaveAlpha: number;
}

export const astaUltimateHandler: UltimateHandler = {
  characterId: 'asta',
  title: 'DEVIL UNION: ANTI-MAGIC ZONE & INFINITE EQUINOX',
  subtitle:
    'UNIQUE DOMAIN BREAKER: Instantly erases all Domains, enemy Ultimate gauge, Shields & Projectiles · Locks Ultimate gain for 3s!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.6,

  onCast(ctx, owner, state) {
    // UNIQUE MECHANIC: DEMON-DESTROYER CAUSALITY BREAK -> obliterates ALL enemy Domains & Active Ultimates!
    const broken = ctx.dispelEnemyFields(owner);

    const data: AstaUltimateData = {
      brokenCount: broken,
      slashes: [],
      slashesDone: 0,
      slashCd: 0.25,
      breakWaveRadius: 24,
      breakWaveAlpha: 1.0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      340,
      '#dc2626',
      8,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      broken > 0 ? `DOMAIN SHATTERED x${broken}!!` : 'ANTI-MAGIC UNION!!',
      '#ef4444',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#dc2626', 90, 340, 3, 6.5, 'shard');
    ctx.addScreenShake(14);
    ctx.addHitstop(0.065);
    ctx.emitSfx({ type: 'ko', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AstaUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.breakWaveAlpha > 0) {
      data.breakWaveAlpha = Math.max(0, data.breakWaveAlpha - dt * 1.4);
      data.breakWaveRadius += dt * 480;
    }

    for (let i = data.slashes.length - 1; i >= 0; i--) {
      data.slashes[i].life -= dt;
      if (data.slashes[i].life <= 0) data.slashes.splice(i, 1);
    }

    // Continuous Devil Union anti-magic aura shreds nearby enemy projectiles!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid === owner.uid) continue;
      if (owner.teamId !== null && p.teamId === owner.teamId) continue;
      if (Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 58) {
        ctx.spawnParticles(p.x, p.y, 6, '#dc2626', 50, 170, 2.5, 5, 'shard');
        ctx.projectiles.splice(i, 1);
      }
    }

    // Deliver 4 Crimson-Black Demon-Slayer Infinite Equinox Cross Slashes -> inflict 3.0s Spirit Lock!
    if (data.slashesDone < 4) {
      data.slashCd -= dt;
      if (data.slashCd <= 0) {
        data.slashCd = 0.52;
        data.slashesDone += 1;
        const target = enemies[data.slashesDone % Math.max(1, enemies.length)] ?? null;
        const sx = target ? target.x : owner.x + Math.cos(owner.facingAngle) * 100;
        const sy = target ? target.y : owner.y + Math.sin(owner.facingAngle) * 100;
        data.slashes.push({ x: sx, y: sy, size: 78, life: 0.6 });
        ctx.spawnParticles(sx, sy, 14, '#ef4444', 80, 260, 2.5, 5.5, 'shard');
        ctx.addScreenShake(7);
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });

        for (const e of enemies) {
          if (Math.hypot(e.x - sx, e.y - sy) <= 84 + e.radius) {
            e.shieldTimer = 0;
            e.spiritLockTimer = Math.max(e.spiritLockTimer, 3.0);
            e.silenceTimer = Math.max(e.silenceTimer, 1.5);
            const dx = e.x - owner.x;
            const dy = e.y - owner.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 7.2),
              (dx / d) * 320,
              (dy / d) * 320,
              { isCrit: data.slashesDone === 4, sourceKind: 'ability' },
            );
            ctx.spawnFloatingText(
              e.x,
              e.y - e.radius - 14,
              'ANTI-MAGIC LOCK!',
              '#ef4444',
              'callout',
            );
          }
        }
      }
    }
  },
};
