import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface VegitoUltimateData {
  swordPinned: boolean;
  swordAngle: number;
  beamFired: boolean;
  beamAngle: number;
  beamFlash: number;
}

export const vegitoUltimateHandler: UltimateHandler = {
  characterId: 'vegito',
  title: 'SPIRIT EXCALIBUR · FINAL KAMEHAMEHA',
  subtitle:
    'Impales foes & shatters obstacles with a golden Spirit Excalibur blade locking dodge, then fires a turquoise-gold Final Kamehameha!',
  bannerColor: '#06b6d4',
  castDuration: 0.25,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: VegitoUltimateData = {
      swordPinned: false,
      swordAngle: ang,
      beamFired: false,
      beamAngle: ang,
      beamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'YOSHA!! SPIRIT SWORD!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as VegitoUltimateData;
    if (data.beamFlash > 0) data.beamFlash = Math.max(0, data.beamFlash - dt);

    // 1. Spirit Excalibur Blade Impale (0.75s): Shatters obstacles & pins foes!
    if (!data.swordPinned && state.elapsed >= 0.75) {
      data.swordPinned = true;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.swordAngle;
      data.swordAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        const obs = ctx.obstacles[i];
        const px = obs.x - owner.x;
        const py = obs.y - owner.y;
        if (px * lx + py * ly >= -30 && Math.abs(px * ly - py * lx) <= 72) {
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 20 && Math.abs(px * ly - py * lx) <= e.radius + 72) {
          e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.5);
          applyFighterStun(ctx, owner, e, 0.75, 'chained', 'PINNED!');
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 12.5), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.addScreenShake(11);
      ctx.emitSfx({ type: 'crit', intensity: 1.2 });
    }

    // 2. Climax (1.9s): FINAL KAMEHAMEHA!
    if (!data.beamFired && state.elapsed >= 1.9) {
      data.beamFired = true;
      data.beamFlash = 1.35;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.swordAngle;
      data.beamAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 82) {
          e.shieldTimer = 0;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.0), lx * 540, ly * 540, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FINAL KAMEHAMEHA!!',
        '#22d3ee',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};
