import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface NeteroUltimateData {
  palmsStruck: number;
  palmCd: number;
  palmFlash: number;
  palmAngle: number;
  zeroHandFired: boolean;
  zeroAngle: number;
  zeroFlash: number;
}

export const neteroUltimateHandler: UltimateHandler = {
  characterId: 'netero',
  title: '100-TYPE GUANYIN BODHISATTVA · ZERO HAND',
  subtitle:
    'Manifests the colossal golden Bodhisattva unleashing 5 hypersonic palm strikes that stun & knock back foes, ending in the blinding ZERO HAND beam!',
  bannerColor: '#facc15',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    owner.shieldTimer = Math.max(owner.shieldTimer, 2.5);
    owner.shieldColor = '#facc15';
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: NeteroUltimateData = {
      palmsStruck: 0,
      palmCd: 0.28,
      palmFlash: 0,
      palmAngle: ang,
      zeroHandFired: false,
      zeroAngle: ang,
      zeroFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      '100-TYPE GUANYIN!',
      '#fde047',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NeteroUltimateData;
    if (data.palmFlash > 0) data.palmFlash = Math.max(0, data.palmFlash - dt);
    if (data.zeroFlash > 0) data.zeroFlash = Math.max(0, data.zeroFlash - dt);

    // 1. 5 Rapid Hypersonic Bodhisattva Palm Strikes!
    if (!data.zeroHandFired && data.palmsStruck < 5) {
      data.palmCd -= dt;
      if (data.palmCd <= 0) {
        data.palmCd = 0.34;
        data.palmsStruck += 1;
        data.palmFlash = 0.28;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          data.palmAngle = ang;
          if (Math.hypot(target.x - owner.x, target.y - owner.y) <= 290 + target.radius) {
            ctx.applyDamage(
              owner,
              target,
              ctx.getEffectiveDamage(owner, 6.2),
              Math.cos(ang) * 340,
              Math.sin(ang) * 340,
              { sourceKind: 'ability' },
            );
            if (data.palmsStruck === 3) {
              applyFighterStun(ctx, owner, target, 0.45, 'chained', 'THIRD HAND!');
            }
          }
          ctx.spawnShockwave(
            target.x,
            target.y,
            115,
            '#facc15',
            5,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'crit', intensity: 1.05 });
        }
      }
    }

    // 2. Climax (2.2s): ZERO HAND!
    if (!data.zeroHandFired && state.elapsed >= 2.2) {
      data.zeroHandFired = true;
      data.zeroFlash = 1.35;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.palmAngle;
      data.zeroAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 88) {
          e.shieldTimer = 0;
          e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.5), lx * 560, ly * 560, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 28, 'ZERO HAND!!', '#fef08a', 'crit');
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
    }
  },
};
