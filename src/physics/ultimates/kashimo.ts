import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface KashimoUltimateData {
  charges: Record<string, number>;
  pulseCd: number;
  boltFlash: number;
  boltX1: number;
  boltY1: number;
  boltX2: number;
  boltY2: number;
  sureHitCount: number;
}

export const kashimoUltimateHandler: UltimateHandler = {
  characterId: 'kashimo',
  title: 'MYTHICAL BEAST AMBER & SURE-HIT LIGHTNING',
  subtitle:
    'Manifests Mythical Beast Amber with crowd-control immunity · Stacks 3 Positive Charges (+) on foes → Calls down a SURE-HIT Return Stroke bolt locking dodge & paralyzing!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const charges: Record<string, number> = {};
    for (const e of ctx.getEnemies(owner)) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 230) {
        charges[e.uid] = 1;
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, '+1 CHARGE', '#7dd3fc', 'callout');
      }
    }

    const data: KashimoUltimateData = {
      charges,
      pulseCd: 0.35,
      boltFlash: 0,
      boltX1: owner.x,
      boltY1: owner.y,
      boltX2: owner.x,
      boltY2: owner.y,
      sureHitCount: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#38bdf8',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'MYTHICAL BEAST AMBER!',
      '#7dd3fc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#38bdf8', 90, 310, 3, 6.5, 'star');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KashimoUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.boltFlash > 0) {
      data.boltFlash = Math.max(0, data.boltFlash - dt);
    }

    data.pulseCd -= dt;
    if (data.pulseCd <= 0) {
      data.pulseCd = 0.45;

      // Dash swiftly toward nearest target to build positive charges
      const nearest = ctx.getNearestEnemy(owner);
      if (nearest) {
        const dx = nearest.x - owner.x;
        const dy = nearest.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        owner.vx += (dx / d) * 260;
        owner.vy += (dy / d) * 260;
        owner.facingAngle = Math.atan2(dy, dx);
      }

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= owner.radius + e.radius + 145) {
          const nextCharge = (data.charges[e.uid] ?? 0) + 1;
          data.charges[e.uid] = nextCharge;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 3.6), 0, 0, {
            sourceKind: 'ability',
          });
          ctx.spawnFloatingText(
            e.x,
            e.y - e.radius - 14,
            `+${nextCharge} CHARGE`,
            '#38bdf8',
            'callout',
          );

          // 3 Positive Charges -> Instantaneous SURE-HIT LIGHTNING RETURN STROKE!
          if (nextCharge >= 3) {
            data.charges[e.uid] = 0;
            data.sureHitCount++;
            data.boltX1 = owner.x;
            data.boltY1 = owner.y;
            data.boltX2 = e.x;
            data.boltY2 = e.y;
            data.boltFlash = 0.75;

            e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 1.2);
            e.paralyzeTimer = Math.max(e.paralyzeTimer, 1.8);
            applyFighterStun(ctx, owner, e, 0.45, 'void-overload', 'SURE-HIT LIGHTNING!!');
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.0), 0, 0, {
              isCrit: true,
              sourceKind: 'ability',
            });
            ctx.addHitstop(0.07);
            ctx.addScreenShake(18);
            ctx.spawnShockwave(
              e.x,
              e.y,
              165,
              '#38bdf8',
              7,
              owner.character.id,
              owner.character.series,
            );
            ctx.spawnParticles(e.x, e.y, 24, '#bae6fd', 100, 340, 3, 6.5, 'star');
            ctx.emitSfx({ type: 'crit', intensity: 1.4 });
          }
        }
      }
    }
  },
};
