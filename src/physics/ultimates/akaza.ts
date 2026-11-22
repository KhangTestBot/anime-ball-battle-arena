import type { UltimateHandler } from './types';

export interface AkazaUltimateData {
  stage: 'compass-needle' | 'chaotic-afterglow';
  compassRadius: number;
  counterCd: number;
  counterHits: number;
  afterglowFired: boolean;
  afterglowFlash: number;
}

export const akazaUltimateHandler: UltimateHandler = {
  characterId: 'akaza',
  title: 'DESTRUCTIVE DEATH: COMPASS NEEDLE & SILVER DISTORTION',
  subtitle:
    'Deploys the 12-Point Snowflake Compass: faster enemies (stronger Fighting Spirit) trigger harder Air Type auto-counters → Unleashes a 10-fist Silver Distortion storm shattering shields!',
  bannerColor: '#ec4899',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.2);

    const data: AkazaUltimateData = {
      stage: 'compass-needle',
      compassRadius: 235,
      counterCd: 0.25,
      counterHits: 0,
      afterglowFired: false,
      afterglowFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      235,
      '#38bdf8',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'DESTRUCTIVE DEATH: COMPASS NEEDLE!',
      '#bae6fd',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#38bdf8', 75, 250, 3, 6, 'star');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AkazaUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.afterglowFlash > 0) data.afterglowFlash = Math.max(0, data.afterglowFlash - dt);

    // 1. Compass Needle Battle-Spirit Detector: scales damage strictly with target's velocity!
    if (data.stage === 'compass-needle') {
      data.counterCd -= dt;
      if (data.counterCd <= 0) {
        data.counterCd = 0.44;
        for (const e of enemies) {
          const dist = Math.hypot(e.x - owner.x, e.y - owner.y);
          if (dist <= data.compassRadius + e.radius) {
            const enemySpeed = Math.hypot(e.vx, e.vy);
            const spiritBonus = Math.min(6.0, enemySpeed * 0.011);
            data.counterHits++;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.8 + spiritBonus), 0, 0, {
              isCrit: enemySpeed >= 180,
              sourceKind: 'ability',
            });
            ctx.spawnParticles(e.x, e.y, 8, '#38bdf8', 50, 170, 2.5, 5, 'spark');
            ctx.spawnFloatingText(
              e.x,
              e.y - e.radius - 14,
              enemySpeed >= 180 ? 'COMPASS COUNTER CRIT!' : 'AIR TYPE!',
              '#7dd3fc',
              enemySpeed >= 180 ? 'crit' : 'callout',
            );
            ctx.emitSfx({ type: 'hit', intensity: 1.05 });
          }
        }
      }

      // Climax (2.1s): BLUE SILVER CHAOTIC AFTERGLOW (10-way shockwave punch storm!)
      if (!data.afterglowFired && state.elapsed >= 2.1) {
        data.afterglowFired = true;
        data.stage = 'chaotic-afterglow';
        data.afterglowFlash = 1.15;

        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;

        for (let i = 0; i < 10; i++) {
          const ang = baseAng + (i * Math.PI * 2) / 10;
          ctx.projectiles.push({
            id: ctx.nextId('afterglow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fist-wave',
            x: owner.x + Math.cos(ang) * (owner.radius + 10),
            y: owner.y + Math.sin(ang) * (owner.radius + 10),
            vx: Math.cos(ang) * 660,
            vy: Math.sin(ang) * 660,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 6.0),
            knockback: 320,
            color: '#38bdf8',
            secondaryColor: '#f472b6',
            angle: ang,
            life: 1.0,
            maxLife: 1.0,
            piercing: true,
            hitCooldowns: {},
            powerLevel: 6,
          });
        }

        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 220 + e.radius) {
            e.shieldTimer = 0;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 11.5), 0, 0, {
              isCrit: true,
              sourceKind: 'ability',
            });
          }
        }

        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#ec4899',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'BLUE SILVER CHAOTIC AFTERGLOW!!',
          '#fbcfe8',
          'powerup',
        );
        ctx.addHitstop(0.075);
        ctx.addScreenShake(18);
        ctx.emitSfx({ type: 'ko', intensity: 1.35 });
      }
    }
  },
};
