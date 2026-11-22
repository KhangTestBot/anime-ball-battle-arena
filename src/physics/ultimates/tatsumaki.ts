import type { UltimateHandler } from './types';

export interface TatsumakiUltimateData {
  pulsesDone: number;
  pulseCd: number;
  meteorDropped: boolean;
  targetX: number;
  targetY: number;
  meteorFlash: number;
}

export const tatsumakiUltimateHandler: UltimateHandler = {
  characterId: 'tatsumaki',
  title: 'PSYCHIC METEOR & BASE FLIP!',
  subtitle:
    'Raises an emerald Psychic Barrier, crushes all foes with 3 telekinetic gravity pulses, and drops a colossal Psychic Meteor!',
  bannerColor: '#22c55e',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.6);
    owner.shieldColor = '#22c55e';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const cx = (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) * 0.5;

    const data: TatsumakiUltimateData = {
      pulsesDone: 0,
      pulseCd: 0.34,
      meteorDropped: false,
      targetX: cx,
      targetY: cy,
      meteorFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TERRIBLE TORNADO!',
      '#4ade80',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TatsumakiUltimateData;
    if (data.meteorFlash > 0) data.meteorFlash = Math.max(0, data.meteorFlash - dt);

    const target = ctx.getNearestEnemy(owner);
    if (target && !data.meteorDropped) {
      data.targetX = target.x;
      data.targetY = target.y;
    }

    if (!data.meteorDropped && data.pulsesDone < 3) {
      data.pulseCd -= dt;
      if (data.pulseCd <= 0) {
        data.pulseCd = 0.45;
        data.pulsesDone += 1;
        for (const e of ctx.getEnemies(owner)) {
          const dx = data.targetX - e.x;
          const dy = data.targetY - e.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          e.vx += (dx / dist) * 290;
          e.vy += (dy / dist) * 290;
          e.airborneTimer = Math.max(e.airborneTimer, 0.75);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 7.2), 0, 0, {
            sourceKind: 'ability',
          });
        }
        ctx.spawnShockwave(
          data.targetX,
          data.targetY,
          175,
          '#4ade80',
          6,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'powerup', intensity: 1.05 });
      }
    }

    if (!data.meteorDropped && state.elapsed >= 2.1) {
      data.meteorDropped = true;
      data.meteorFlash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - data.targetY, e.x - data.targetX);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        data.targetX,
        data.targetY,
        340,
        '#22c55e',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        data.targetX,
        data.targetY - 26,
        'PSYCHIC METEOR CRUSH!!',
        '#4ade80',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};
