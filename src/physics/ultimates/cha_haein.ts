import type { UltimateHandler } from './types';

export interface ChaHaeInUltimateData {
  dancesDone: number;
  danceCd: number;
  trails: Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>;
  finisherFired: boolean;
  flash: number;
}

export const chaHaeInUltimateHandler: UltimateHandler = {
  characterId: 'cha_haein',
  title: 'SWORD DANCE: DANCER OF LIGHT!',
  subtitle:
    'Enters weightless golden Sword Dance (Auto-Dodge), weaves 5 radiant rapier blinks, and finishes with Sword of Light!',
  bannerColor: '#facc15',
  castDuration: 0.2,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);

    const data: ChaHaeInUltimateData = {
      dancesDone: 0,
      danceCd: 0.24,
      trails: [],
      finisherFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SWORD DANCE!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ChaHaeInUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);
    for (const tr of data.trails) {
      tr.alpha = Math.max(0, tr.alpha - dt * 0.9);
    }

    if (!data.finisherFired && data.dancesDone < 5) {
      data.danceCd -= dt;
      if (data.danceCd <= 0) {
        data.danceCd = 0.28;
        data.dancesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const oldX = owner.x;
          const oldY = owner.y;
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          const pad = owner.radius + 8;
          owner.x = Math.max(
            ctx.bounds.left + pad,
            Math.min(ctx.bounds.right - pad, target.x + Math.cos(ang + 0.8) * 62),
          );
          owner.y = Math.max(
            ctx.bounds.top + pad,
            Math.min(ctx.bounds.bottom - pad, target.y + Math.sin(ang + 0.8) * 62),
          );
          data.trails.push({ x1: oldX, y1: oldY, x2: owner.x, y2: owner.y, alpha: 1 });
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 7.6),
            Math.cos(ang) * 220,
            Math.sin(ang) * 220,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.15 });
        }
      }
    }

    if (!data.finisherFired && state.elapsed >= 1.95) {
      data.finisherFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.5),
          Math.cos(ang) * 500,
          Math.sin(ang) * 500,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        290,
        '#facc15',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SWORD OF LIGHT!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};
