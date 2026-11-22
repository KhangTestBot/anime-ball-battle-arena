import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface JirenUltimateData {
  stage: 'eye-glare' | 'power-impact';
  glareCd: number;
  glarePunches: number;
  impactFired: boolean;
  impactX: number;
  impactY: number;
  impactFlash: number;
}

export const jirenUltimateHandler: UltimateHandler = {
  characterId: 'jiren',
  title: 'OMEGAHEAT MAGNETRON: EYE GLARE & POWER IMPACT',
  subtitle:
    'Absolute Unstoppable state with invisible Eye Glare erasing approaching projectiles & landing shockwave blows from afar → Condenses crimson Power Impact breaking shields & detonating the zone!',
  bannerColor: '#dc2626',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.2);

    const target = ctx.getNearestEnemy(owner);
    const data: JirenUltimateData = {
      stage: 'eye-glare',
      glareCd: 0.2,
      glarePunches: 0,
      impactFired: false,
      impactX: target ? target.x : owner.x + 120,
      impactY: target ? target.y : owner.y,
      impactFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#f97316',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'OVERHEAT MAGNETRON!!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#ef4444', 85, 280, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JirenUltimateData;
    const enemies = ctx.getEnemies(owner);
    const { left, right, top, bottom } = ctx.bounds;

    if (data.impactFlash > 0) data.impactFlash = Math.max(0, data.impactFlash - dt);

    // Eye Glare Barrier erases hostile bullets entering 135px radius!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (p.ownerUid !== owner.uid && Math.hypot(p.x - owner.x, p.y - owner.y) <= 135) {
        ctx.spawnParticles(p.x, p.y, 6, '#f97316', 45, 130, 2.5, 4.5, 'spark');
        ctx.projectiles.splice(i, 1);
      }
    }

    // Periodic Invisible Eye-Glare Air Punches on closest target
    if (data.stage === 'eye-glare') {
      data.glareCd -= dt;
      if (data.glareCd <= 0) {
        data.glareCd = 0.45;
        const target = ctx.getNearestEnemy(owner);
        if (target && Math.hypot(target.x - owner.x, target.y - owner.y) <= 320) {
          data.glarePunches++;
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.2);
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 4.6), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnShockwave(
            target.x,
            target.y,
            85,
            '#dc2626',
            4.5,
            owner.character.id,
            owner.character.series,
          );
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 14,
            'GLARE SHOCK!',
            '#fb923c',
            'callout',
          );
          ctx.emitSfx({ type: 'hit', intensity: 1.1 });
        }
      }

      // Climax (1.85s): POWER IMPACT!! Compressed fiery sphere explodes on target!
      if (!data.impactFired && state.elapsed >= 1.85) {
        data.impactFired = true;
        data.stage = 'power-impact';
        data.impactFlash = 1.2;

        const target = ctx.getNearestEnemy(owner);
        data.impactX = Math.max(
          left + 40,
          Math.min(right - 40, target ? target.x : (left + right) / 2),
        );
        data.impactY = Math.max(
          top + 40,
          Math.min(bottom - 40, target ? target.y : (top + bottom) / 2),
        );

        ctx.addHitstop(0.08);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          data.impactX,
          data.impactY,
          245,
          '#ef4444',
          8.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          data.impactX,
          data.impactY - 24,
          'OWARI DA! POWER IMPACT!!',
          '#fed7aa',
          'powerup',
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.4 });

        for (const e of enemies) {
          const dx = e.x - data.impactX;
          const dy = e.y - data.impactY;
          const dist = Math.hypot(dx, dy);
          if (dist <= 200 + e.radius) {
            const d = Math.max(1, dist);
            e.shieldTimer = 0;
            applyFighterStun(ctx, owner, e, 0.55, 'airborne', 'POWER IMPACT!');
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 16.0),
              (dx / d) * 620,
              (dy / d) * 620,
              { isCrit: true, sourceKind: 'ability' },
            );
          }
        }
      }
    }
  },
};
