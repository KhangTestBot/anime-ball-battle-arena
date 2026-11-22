import type { UltimateHandler } from './types';

export interface VegetaUltimateData {
  stage: 'ego-absorb' | 'hakai-detonated';
  absorbTimer: number;
  lastDamageTaken: number;
  absorbedDamage: number;
  sphereX: number;
  sphereY: number;
  sphereRadius: number;
  waveRadius: number;
  waveMaxRadius: number;
  waveFlash: number;
}

export const vegetaUltimateHandler: UltimateHandler = {
  characterId: 'vegeta',
  title: 'ULTRA EGO: HAKAI SPHERE & FINAL ATONEMENT',
  subtitle:
    'Destroyer Instinct: 100% of damage Vegeta takes over 2.8s charges the Hakai Sphere · Detonates to Obliterate all projectiles, traps & shields!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const data: VegetaUltimateData = {
      stage: 'ego-absorb',
      absorbTimer: 2.6, // 2.6s Ultra Ego pain-to-power absorption window!
      lastDamageTaken: owner.damageTaken,
      absorbedDamage: 0,
      sphereX: owner.x + Math.cos(angle) * (owner.radius + 22),
      sphereY: owner.y + Math.sin(angle) * (owner.radius + 22),
      sphereRadius: 20,
      waveRadius: 20,
      waveMaxRadius: 240,
      waveFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'ULTRA EGO · HAKAI!',
      '#c084fc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#9333ea', 80, 260, 3, 6.5, 'pixel');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as VegetaUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Ultra Ego Pain-Conversion Phase: 100% of damageTaken delta feeds Hakai Sphere!
    if (data.stage === 'ego-absorb') {
      const takenDelta = Math.max(0, owner.damageTaken - data.lastDamageTaken);
      data.lastDamageTaken = owner.damageTaken;
      if (takenDelta > 0) {
        data.absorbedDamage += takenDelta;
        ctx.spawnFloatingText(
          data.sphereX,
          data.sphereY - data.sphereRadius - 10,
          `+${Math.round(takenDelta)} HAKAI`,
          '#e879f9',
          'callout',
        );
        ctx.spawnParticles(data.sphereX, data.sphereY, 6, '#c084fc', 50, 150, 2.5, 5, 'pixel');
      }

      const ang = owner.facingAngle;
      data.sphereX = owner.x + Math.cos(ang) * (owner.radius + 22);
      data.sphereY = owner.y + Math.sin(ang) * (owner.radius + 22);
      // Scale sphere radius visually based on absorbed pain relative to maxHp!
      const absorbRatio = Math.min(1.4, data.absorbedDamage / Math.max(120, owner.maxHp * 0.25));
      data.sphereRadius = 20 + absorbRatio * 24;

      data.absorbTimer -= dt;
      if (data.absorbTimer <= 0) {
        data.stage = 'hakai-detonated';
        data.waveFlash = 0.9;
        data.waveMaxRadius = 225 + absorbRatio * 75;
        const egoMult = 1.0 + absorbRatio;

        ctx.addHitstop(0.075);
        ctx.addScreenShake(17);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          data.waveMaxRadius,
          '#a855f7',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'HAKAI ERASURE!!',
          '#e879f9',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.25 });

        // DESTRUCTION: Erase ALL enemy projectiles, bombs, and shield barriers inside blast wave!
        for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
          const p = ctx.projectiles[i];
          if (
            p.ownerUid !== owner.uid &&
            Math.hypot(p.x - owner.x, p.y - owner.y) <= data.waveMaxRadius
          ) {
            ctx.spawnParticles(p.x, p.y, 6, '#c084fc', 40, 140, 2, 4, 'pixel');
            ctx.projectiles.splice(i, 1);
          }
        }
        for (let i = ctx.bombs.length - 1; i >= 0; i--) {
          const b = ctx.bombs[i];
          if (
            b.ownerUid !== owner.uid &&
            Math.hypot(b.x - owner.x, b.y - owner.y) <= data.waveMaxRadius
          ) {
            ctx.spawnParticles(b.x, b.y, 8, '#c084fc', 50, 160, 2.5, 5, 'pixel');
            ctx.bombs.splice(i, 1);
          }
        }

        for (const e of enemies) {
          const dx = e.x - owner.x;
          const dy = e.y - owner.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= data.waveMaxRadius + e.radius) {
            // Strip enemy defensive shield on Hakai impact!
            e.shieldTimer = 0;
            const nx = dist > 0.1 ? dx / dist : 1;
            const ny = dist > 0.1 ? dy / dist : 0;
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 14.5 * egoMult),
              nx * 580,
              ny * 580,
              { isCrit: absorbRatio > 0.35, sourceKind: 'ability' },
            );
            ctx.spawnParticles(e.x, e.y, 18, '#a855f7', 90, 310, 3, 6.5, 'pixel');
          }
        }
      }
    } else if (data.waveFlash > 0) {
      data.waveFlash = Math.max(0, data.waveFlash - dt);
      data.waveRadius = data.waveMaxRadius * (1 - data.waveFlash * 0.5);
    }
  },
};
