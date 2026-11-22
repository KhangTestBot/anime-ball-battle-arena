import type { UltimateHandler } from './types';

export interface SenkeiSwordNode {
  x: number;
  y: number;
}

export interface ByakuyaUltimateData {
  stage: 'senkei-ring' | 'hakuteiken' | 'aftermath';
  ringX: number;
  ringY: number;
  ringRadius: number;
  swords: SenkeiSwordNode[];
  petalTick: number;
  hakuteiFlash: number;
}

export const byakuyaUltimateHandler: UltimateHandler = {
  characterId: 'byakuya',
  title: 'SENKEI: SENBONZAKURA KAGEYOSHI · HAKUTEIKEN',
  subtitle:
    'Traps foes inside 12 Senkei Blades amid a storm of millions of steel cherry-blossom petals → Forms the white wings of Shukei Hakuteiken for a devastating piercing finisher!',
  bannerColor: '#ec4899',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const rx = Math.max(left + 120, Math.min(right - 120, owner.x));
    const ry = Math.max(top + 120, Math.min(bottom - 120, owner.y));
    const ringRadius = 175;
    const swords: SenkeiSwordNode[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      swords.push({ x: rx + Math.cos(a) * ringRadius, y: ry + Math.sin(a) * ringRadius });
    }

    const data: ByakuyaUltimateData = {
      stage: 'senkei-ring',
      ringX: rx,
      ringY: ry,
      ringRadius,
      swords,
      petalTick: 0,
      hakuteiFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnShockwave(
      rx,
      ry,
      ringRadius,
      '#f472b6',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'SENKEI: SENBONZAKURA KAGEYOSHI!',
      '#fbcfe8',
      'powerup',
    );
    ctx.spawnParticles(rx, ry, 28, '#f472b6', 75, 250, 3, 6, 'petal');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ByakuyaUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.hakuteiFlash > 0) data.hakuteiFlash = Math.max(0, data.hakuteiFlash - dt);

    // 1. Senkei Blade Cage pulls escaping enemies back inside & slices continuously!
    if (data.stage === 'senkei-ring') {
      for (const e of enemies) {
        const dx = e.x - data.ringX;
        const dy = e.y - data.ringY;
        const dist = Math.hypot(dx, dy);
        if (dist > data.ringRadius - e.radius && dist < data.ringRadius + 90) {
          const d = Math.max(1, dist);
          e.vx -= (dx / d) * 320 * dt;
          e.vy -= (dy / d) * 320 * dt;
        }
      }

      data.petalTick += dt;
      if (data.petalTick >= 0.35) {
        data.petalTick -= 0.35;
        for (const e of enemies) {
          if (Math.hypot(e.x - data.ringX, e.y - data.ringY) <= data.ringRadius + e.radius) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.6), 0, 0, {
              sourceKind: 'ability',
            });
            ctx.spawnParticles(e.x, e.y, 7, '#f472b6', 50, 170, 2.5, 5, 'petal');
          }
        }
      }

      // Climax (2.3s): SHUKEI: HAKUTEIKEN!! White Emperor Winged Sword Final Dash!
      if (state.elapsed >= 2.3) {
        data.stage = 'hakuteiken';
        data.hakuteiFlash = 1.1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        if (target) {
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(
              right - owner.radius - 8,
              target.x - Math.cos(ang) * (owner.radius + target.radius + 8),
            ),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(
              bottom - owner.radius - 8,
              target.y - Math.sin(ang) * (owner.radius + target.radius + 8),
            ),
          );
        }

        ctx.addHitstop(0.08);
        ctx.addScreenShake(20);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#ffffff',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'SHUKEI: HAKUTEIKEN!!',
          '#fdf2f8',
          'powerup',
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.45 });

        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 210 + e.radius) {
            e.shieldTimer = 0;
            const dx = e.x - owner.x;
            const dy = e.y - owner.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 17.5),
              (dx / d) * 560,
              (dy / d) * 560,
              {
                isCrit: true,
                sourceKind: 'ability',
              },
            );
          }
        }
      }
      return;
    }

    if (data.stage === 'hakuteiken' && data.hakuteiFlash <= 0) {
      data.stage = 'aftermath';
    }
  },
};
